<?php
declare(strict_types=1);

date_default_timezone_set('America/Lima');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

const SESSION_COOKIE = 'platino_session';
const SESSION_TTL = 28800;
const MAX_NAMESPACE_BYTES = 16_000_000;
const MAX_REQUEST_BYTES = 20_000_000;

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requiredEnv(string $name): string
{
    static $localEnv = null;
    if ($localEnv === null) {
        $localEnv = [];
        $localPath = __DIR__ . '/env.local.php';
        if (is_file($localPath)) {
            $loaded = require $localPath;
            if (is_array($loaded)) {
                $localEnv = $loaded;
            }
        }
    }

    $candidates = [
        $localEnv[$name] ?? null,
        getenv($name),
        $_ENV[$name] ?? null,
        $_SERVER[$name] ?? null,
        $_SERVER['REDIRECT_' . $name] ?? null,
    ];
    foreach ($candidates as $value) {
        if (is_string($value) && $value !== '') {
            return $value;
        }
    }
    throw new RuntimeException("Missing server configuration: {$name}");
}

function database(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        requiredEnv('PLATINO_DB_HOST'),
        requiredEnv('PLATINO_DB_NAME')
    );
    $pdo = new PDO($dsn, requiredEnv('PLATINO_DB_USER'), requiredEnv('PLATINO_DB_PASSWORD'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function signingKey(): string
{
    $key = base64_decode(requiredEnv('PLATINO_JWT_SECRET'), true);
    if ($key === false || strlen($key) !== 32) {
        throw new RuntimeException('PLATINO_JWT_SECRET must be base64-encoded and exactly 32 bytes.');
    }
    return $key;
}

function encryptionKey(): string
{
    $key = base64_decode(requiredEnv('PLATINO_DATA_KEY'), true);
    if ($key === false || strlen($key) !== 32) {
        throw new RuntimeException('PLATINO_DATA_KEY must be base64-encoded and exactly 32 bytes.');
    }
    return $key;
}

function ensureSchema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_users (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            name_nonce BINARY(12) NOT NULL,
            name_cipher VARBINARY(512) NOT NULL,
            email_nonce BINARY(12) NOT NULL,
            email_cipher VARBINARY(512) NOT NULL,
            email_lookup BINARY(32) NOT NULL UNIQUE,
            dni_nonce BINARY(12) NULL,
            dni_cipher VARBINARY(128) NULL,
            dni_lookup BINARY(32) NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin_master', 'admin_sede', 'admin', 'cliente') NOT NULL DEFAULT 'cliente',
            sede_id VARCHAR(50) NULL,
            active TINYINT(1) NOT NULL DEFAULT 1,
            failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
            locked_until DATETIME NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_data (
            owner_id BIGINT UNSIGNED NOT NULL,
            namespace VARCHAR(64) NOT NULL,
            nonce BINARY(12) NOT NULL,
            ciphertext MEDIUMBLOB NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (owner_id, namespace),
            CONSTRAINT fk_app_data_owner FOREIGN KEY (owner_id) REFERENCES app_users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_sessions (
            jti_hash BINARY(32) NOT NULL PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_app_session_owner FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
            KEY idx_app_sessions_expiry (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_recovery_codes (
            code_date DATE NOT NULL PRIMARY KEY,
            code_nonce BINARY(12) NOT NULL,
            code_cipher VARBINARY(128) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function base64UrlEncode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64UrlDecode(string $value): string|false
{
    return base64_decode(strtr($value, '-_', '+/'), true);
}

function issueSession(PDO $pdo, array $user): void
{
    $now = time();
    $jti = bin2hex(random_bytes(32));
    $header = base64UrlEncode(json_encode(['alg' => 'dir', 'enc' => 'A256GCM', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
    $payload = base64UrlEncode(json_encode([
        'sub' => (string) $user['id'],
        'role' => $user['role'],
        'iat' => $now,
        'exp' => $now + SESSION_TTL,
        'jti' => $jti,
    ], JSON_THROW_ON_ERROR));
    $iv = random_bytes(12);
    $tag = '';
    $ciphertext = openssl_encrypt($payload, 'aes-256-gcm', signingKey(), OPENSSL_RAW_DATA, $iv, $tag, $header);
    if ($ciphertext === false) {
        throw new RuntimeException('No se pudo crear la sesión cifrada.');
    }
    $token = "{$header}.." . base64UrlEncode($iv) . '.' . base64UrlEncode($ciphertext) . '.' . base64UrlEncode($tag);

    $statement = $pdo->prepare(
        'INSERT INTO app_sessions (jti_hash, user_id, expires_at) VALUES (?, ?, FROM_UNIXTIME(?))'
    );
    $statement->execute([hash('sha256', $jti, true), $user['id'], $now + SESSION_TTL]);

    setcookie(SESSION_COOKIE, $token, [
        'expires' => $now + SESSION_TTL,
        'path' => '/api',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

function clearSessionCookie(): void
{
    setcookie(SESSION_COOKIE, '', [
        'expires' => time() - 3600,
        'path' => '/api',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

function currentUser(PDO $pdo): ?array
{
    $token = $_COOKIE[SESSION_COOKIE] ?? '';
    $parts = explode('.', $token);
    if (count($parts) !== 5 || $parts[1] !== '') {
        return null;
    }
    [$encodedHeader, , $encodedIv, $encodedCiphertext, $encodedTag] = $parts;
    $header = json_decode(base64UrlDecode($encodedHeader) ?: '', true);
    $iv = base64UrlDecode($encodedIv);
    $ciphertext = base64UrlDecode($encodedCiphertext);
    $tag = base64UrlDecode($encodedTag);
    if (
        !is_array($header) ||
        ($header['alg'] ?? null) !== 'dir' ||
        ($header['enc'] ?? null) !== 'A256GCM' ||
        $iv === false ||
        $ciphertext === false ||
        $tag === false
    ) {
        return null;
    }
    $encodedPayload = openssl_decrypt($ciphertext, 'aes-256-gcm', signingKey(), OPENSSL_RAW_DATA, $iv, $tag, $encodedHeader);
    $payload = $encodedPayload === false ? null : json_decode(base64UrlDecode($encodedPayload) ?: '', true);
    if (
        !is_array($payload) ||
        !isset($payload['sub'], $payload['jti'], $payload['exp']) ||
        (int) $payload['exp'] <= time()
    ) {
        return null;
    }

    $statement = $pdo->prepare(
        'SELECT u.id, u.name_nonce, u.name_cipher, u.email_nonce, u.email_cipher, u.email_lookup, u.dni_nonce, u.dni_cipher, u.role, u.sede_id
         FROM app_sessions s JOIN app_users u ON u.id = s.user_id
         WHERE s.jti_hash = ? AND s.user_id = ? AND s.expires_at > NOW() AND u.active = 1'
    );
    $statement->execute([hash('sha256', (string) $payload['jti'], true), $payload['sub']]);
    $user = $statement->fetch();
    return $user ? [...publicUser($user), 'email_lookup' => $user['email_lookup']] : null;
}

function requireUser(PDO $pdo): array
{
    $user = currentUser($pdo);
    if ($user === null) {
        respond(401, ['error' => 'Autenticación requerida.']);
    }
    return $user;
}

function isMasterUser(?array $user): bool
{
    if (!is_array($user)) {
        return false;
    }
    return $user['role'] === 'admin_master' &&
        isset($user['email_lookup']) &&
        hash_equals(emailLookup('vladimiryt18@gmail.com'), (string) $user['email_lookup']);
}

function isAdminUser(?array $user): bool
{
    return is_array($user) && in_array($user['role'] ?? '', ['admin_master', 'admin_sede', 'admin'], true);
}

function requireMaster(array $user): void
{
    if (!isMasterUser($user)) {
        respond(403, ['error' => 'Se requiere la cuenta del administrador principal.']);
    }
}

function requireAdmin(array $user): void
{
    if (!isAdminUser($user)) {
        respond(403, ['error' => 'Se requiere una cuenta de administrador autorizada.']);
    }
}

function enforceSameOrigin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $expectedOrigin = rtrim(requiredEnv('PLATINO_APP_ORIGIN'), '/');
    if ($origin === '' || !hash_equals($expectedOrigin, rtrim($origin, '/'))) {
        respond(403, ['error' => 'Origen de solicitud no permitido.']);
    }
}

function requestBody(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > MAX_REQUEST_BYTES) {
        respond(413, ['error' => 'La solicitud supera el límite permitido.']);
    }
    $body = json_decode($raw, true);
    if (!is_array($body)) {
        respond(400, ['error' => 'El cuerpo JSON no es válido.']);
    }
    return $body;
}

function encryptData(string $plaintext): array
{
    $nonce = random_bytes(12);
    $tag = '';
    $ciphertext = openssl_encrypt(
        $plaintext,
        'aes-256-gcm',
        encryptionKey(),
        OPENSSL_RAW_DATA,
        $nonce,
        $tag
    );
    if ($ciphertext === false) {
        throw new RuntimeException('No se pudo cifrar el dato.');
    }
    return [$nonce, $tag . $ciphertext];
}

function decryptData(string $nonce, string $ciphertext): string
{
    if (strlen($ciphertext) < 16) {
        throw new RuntimeException('El dato cifrado no es válido.');
    }
    $plaintext = openssl_decrypt(
        substr($ciphertext, 16),
        'aes-256-gcm',
        encryptionKey(),
        OPENSSL_RAW_DATA,
        $nonce,
        substr($ciphertext, 0, 16)
    );
    if ($plaintext === false) {
        throw new RuntimeException('No se pudo descifrar el dato.');
    }
    return $plaintext;
}

function emailLookup(string $email): string
{
    $lookupKey = hash_hmac('sha256', 'platino-email-index-v1', encryptionKey(), true);
    return hash_hmac('sha256', strtolower(trim($email)), $lookupKey, true);
}

function dniLookupHash(string $dni): string
{
    $dniKey = hash_hmac('sha256', 'platino-dni-index-v1', encryptionKey(), true);
    return hash_hmac('sha256', $dni, $dniKey, true);
}

function deriveClientRecoveryCode(string $dailyCode, string $userId, string $dateKey): string
{
    $mac = hash_hmac('sha256', "recovery:{$dateKey}:{$userId}:{$dailyCode}", signingKey(), true);
    $num = unpack('N', substr($mac, 0, 4))[1] & 0x7fffffff;
    return (string) (100000 + ($num % 900000));
}

function publicUser(array $user): array
{
    return [
        'id' => (string) $user['id'],
        'name' => decryptData($user['name_nonce'], $user['name_cipher']),
        'email' => decryptData($user['email_nonce'], $user['email_cipher']),
        'dni' => isset($user['dni_nonce']) && $user['dni_nonce'] !== null
            ? decryptData($user['dni_nonce'], $user['dni_cipher'])
            : '',
        'role' => $user['role'],
        'sede_id' => $user['sede_id'],
    ];
}

function getMasterOwnerId(PDO $pdo, bool $forUpdate = false): int
{
    $sql = "SELECT id FROM app_users WHERE role = 'admin_master' AND email_lookup = ? LIMIT 1";
    if ($forUpdate) {
        $sql .= ' FOR UPDATE';
    }
    $master = $pdo->prepare($sql);
    $master->execute([emailLookup('vladimiryt18@gmail.com')]);
    $ownerId = (int) $master->fetchColumn();
    if ($ownerId === 0) {
        if ($forUpdate && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        respond(503, ['error' => 'La cuenta principal todavía no está configurada.']);
    }
    return $ownerId;
}

function readNamespaceData(PDO $pdo, int $ownerId, string $namespace, bool $forUpdate = false): mixed
{
    $sql = 'SELECT nonce, ciphertext FROM app_data WHERE owner_id = ? AND namespace = ?';
    if ($forUpdate) {
        $sql .= ' FOR UPDATE';
    }
    $statement = $pdo->prepare($sql);
    $statement->execute([$ownerId, $namespace]);
    $row = $statement->fetch();
    if (!$row) {
        return null;
    }
    $plaintext = decryptData($row['nonce'], $row['ciphertext']);
    return json_decode($plaintext, true, 512, JSON_THROW_ON_ERROR);
}

function writeNamespaceData(PDO $pdo, int $ownerId, string $namespace, mixed $data): void
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    if (strlen($json) > MAX_NAMESPACE_BYTES) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        respond(413, ['error' => 'El conjunto de datos supera el límite permitido.']);
    }
    [$nonce, $ciphertext] = encryptData($json);
    $statement = $pdo->prepare(
        'INSERT INTO app_data (owner_id, namespace, nonce, ciphertext) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nonce = VALUES(nonce), ciphertext = VALUES(ciphertext)'
    );
    $statement->execute([$ownerId, $namespace, $nonce, $ciphertext]);
}

function adminHasNamespacePermission(PDO $pdo, array $user, int $masterOwnerId, string $namespace): bool
{
    if (isMasterUser($user)) {
        return true;
    }
    if (!isAdminUser($user)) {
        return false;
    }

    $namespaceToPermissions = [
        'catalog' => ['catalogo'],
        'home_images' => ['home_images'],
        'announcement' => ['home_images'],
        'announcement_active' => ['home_images'],
        'nosotros' => ['nosotros'],
        'educacion' => ['nosotros', 'educacion'],
        'finance' => ['finanzas'],
        'inventory' => ['inventario', 'inventario_global'],
        'appointments' => ['citas', 'citas_global'],
        'blocked_slots' => ['citas', 'citas_global'],
        'orders' => ['pedidos', 'pedidos_global', 'finanzas'],
        'reclamations' => ['reclamaciones'],
        'care_config' => [],
        'care_clients' => ['pedidos', 'pedidos_global', 'finanzas'],
        'gemstones' => ['catalogo'],
        'laboratories' => ['catalogo'],
    ];

    if (!array_key_exists($namespace, $namespaceToPermissions)) {
        return false;
    }
    $requiredAny = $namespaceToPermissions[$namespace];
    if (count($requiredAny) === 0) {
        return false;
    }

    $matrix = readNamespaceData($pdo, $masterOwnerId, 'permissions');
    if (!is_array($matrix)) {
        return false;
    }
    $email = strtolower(trim((string) ($user['email'] ?? '')));
    $userPerms = $matrix[$email] ?? [];
    if (!is_array($userPerms)) {
        return false;
    }
    foreach ($requiredAny as $permKey) {
        if (in_array($permKey, $userPerms, true)) {
            return true;
        }
    }
    return false;
}

function defaultCatalogPrices(): array
{
    return [
        'collar-cristal' => 190.0,
        'anillo-9-promesas' => 2500.0,
        'aros-trial' => 5700.0,
        'anillo-solitario-sublime' => 3100.0,
        'anillo-trilogia-tres-piedras' => 3850.0,
        'anillo-vintage-heritage' => 3450.0,
        'anillo-moderno-bisel' => 2950.0,
        'anillo-compromiso-esmeralda-real' => 3600.0,
        'anillo-compromiso-rubi-pasion' => 3750.0,
        'anillo-compromiso-zafiro-royal' => 3900.0,
        'anillo-corazon-amor-eterno' => 3250.0,
        'anillo-marquesa-realeza' => 2750.0,
        'aros-romance-clasico' => 4800.0,
        'anillo-promesa-esmeralda' => 1850.0,
        'pulsera-tennis-diamantes' => 3400.0,
        'collar-solitario-lagrima' => 1450.0,
        'aros-alianza-eterna' => 4900.0,
        'aros-boda-pedreria-lux' => 5200.0,
        'aros-boda-textura-laurel' => 4950.0,
        'aros-boda-moderno-dual' => 5400.0,
        'aros-boda-vintage-milgrain' => 5100.0,
        'porta-aros-cristal-lujo' => 180.0,
        'copas-decoradas-nupciales' => 240.0,
        'cuadros-conmemorativos-boda' => 290.0,
        'aretes-bebes-bolita-oro' => 380.0,
        'aretes-pegados-solitarios' => 850.0,
        'aretes-colgantes-cascada' => 1450.0,
        'relicario-corazon-oro' => 1650.0,
        'cadena-grumet-varon' => 680.0,
        'tobillera-esferas-plata' => 210.0,
        'anillo-promesa-infinito-oro' => 980.0,
        'anillo-promesa-nudo-amor' => 890.0,
        'anillo-promesa-moderno-onda' => 1150.0,
        'alianza-amor-clasica-oro' => 3200.0,
        'alianza-amor-sin-pedreria-dual' => 3450.0,
        'alianza-amor-moderna-bisel' => 3600.0,
        'alianza-amor-vintage-corona' => 3800.0,
        'collar-cruz-latina-oro' => 1290.0,
        'collar-nombre-personalizado' => 990.0,
        'juego-nupcial-perlas-australianas' => 2600.0,
        'aro-casual-varon-plata-oro' => 750.0,
        'pulsera-eslabon-hombre-baraka' => 890.0,
        'reloj-cronografo-platino-swiss' => 1850.0,
        'aretes-nina-mariposa-oro' => 450.0,
        'cadena-bebe-angel-guarda' => 620.0,
        'esclava-bebe-identidad-oro' => 580.0,
    ];
}

function getOrCreateDailyCode(PDO $pdo, string $today): string
{
    $statement = $pdo->prepare('SELECT code_nonce, code_cipher FROM app_recovery_codes WHERE code_date = ?');
    $statement->execute([$today]);
    $row = $statement->fetch();
    if ($row) {
        return decryptData($row['code_nonce'], $row['code_cipher']);
    }
    $code = (string) random_int(100000, 999999);
    [$nonce, $cipher] = encryptData($code);
    $pdo->prepare(
        'INSERT INTO app_recovery_codes (code_date, code_nonce, code_cipher) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE code_nonce = VALUES(code_nonce), code_cipher = VALUES(code_cipher), created_at = CURRENT_TIMESTAMP'
    )->execute([$today, $nonce, $cipher]);
    return $code;
}

function route(PDO $pdo): void
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $path = preg_replace('#^/api(?:/index\.php)?#', '', $path);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'OPTIONS') {
        header('Allow: GET, POST, PUT, DELETE, OPTIONS');
        respond(204, []);
    }

    if ($method === 'POST' || $method === 'PUT' || $method === 'DELETE') {
        enforceSameOrigin();
    }

    if ($path === '/auth/login' && $method === 'POST') {
        $body = requestBody();
        $identifier = strtolower(trim((string) ($body['identifier'] ?? $body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');
        if ($identifier === '' || $password === '' || strlen($password) > 1024) {
            respond(422, ['error' => 'Correo o DNI y contraseña son obligatorios.']);
        }

        $statement = $pdo->prepare(
            'SELECT id, name_nonce, name_cipher, email_nonce, email_cipher, dni_nonce, dni_cipher, password_hash, role, sede_id, active, failed_attempts, locked_until
             FROM app_users WHERE email_lookup = ? OR dni_lookup = ? LIMIT 1'
        );
        $digits = preg_replace('/\D/', '', $identifier);
        $statement->execute([
            emailLookup($identifier),
            strlen($digits) === 8 ? dniLookupHash($digits) : random_bytes(32),
        ]);
        $user = $statement->fetch();
        if (!$user || !(int) $user['active'] || ($user['locked_until'] && strtotime($user['locked_until']) > time())) {
            respond(401, ['error' => 'Correo o contraseña incorrectos.']);
        }
        if (!password_verify($password, $user['password_hash'])) {
            $attempts = (int) $user['failed_attempts'] + 1;
            $maxAttempts = $user['role'] === 'admin_master' ? 10 : 5;
            $lockDuration = $user['role'] === 'admin_master' ? 180 : 900;
            $lockedUntil = $attempts >= $maxAttempts ? date('Y-m-d H:i:s', time() + $lockDuration) : null;
            $update = $pdo->prepare('UPDATE app_users SET failed_attempts = ?, locked_until = ? WHERE id = ?');
            $update->execute([$attempts >= $maxAttempts ? 0 : $attempts, $lockedUntil, $user['id']]);
            respond(401, ['error' => 'Correo o contraseña incorrectos.']);
        }

        $pdo->prepare('UPDATE app_users SET failed_attempts = 0, locked_until = NULL WHERE id = ?')
            ->execute([$user['id']]);
        issueSession($pdo, $user);
        respond(200, ['user' => publicUser($user)]);
    }

    if ($path === '/auth/register' && $method === 'POST') {
        $body = requestBody();
        $name = trim((string) ($body['name'] ?? ''));
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $dni = preg_replace('/\D/', '', (string) ($body['dni'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        if ($name === '' || strlen($name) > 150 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
            respond(422, ['error' => 'Nombre o correo no válido.']);
        }
        if (strlen($dni) !== 8 || strlen($password) < 12 || strlen($password) > 1024) {
            respond(422, ['error' => 'El DNI debe tener 8 dígitos y la contraseña al menos 12 caracteres.']);
        }
        $dniLookup = dniLookupHash($dni);
        $exists = $pdo->prepare('SELECT id FROM app_users WHERE email_lookup = ? OR dni_lookup = ? LIMIT 1');
        $exists->execute([emailLookup($email), $dniLookup]);
        if ($exists->fetchColumn()) {
            respond(409, ['error' => 'El correo o DNI ya tiene una cuenta registrada.']);
        }
        [$nameNonce, $nameCipher] = encryptData($name);
        [$emailNonce, $emailCipher] = encryptData($email);
        [$dniNonce, $dniCipher] = encryptData($dni);
        $insert = $pdo->prepare(
            "INSERT INTO app_users (name_nonce, name_cipher, email_nonce, email_cipher, email_lookup, dni_nonce, dni_cipher, dni_lookup, password_hash, role)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'cliente')"
        );
        $insert->execute([
            $nameNonce, $nameCipher, $emailNonce, $emailCipher, emailLookup($email),
            $dniNonce, $dniCipher, $dniLookup,
            password_hash($password, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT),
        ]);
        $user = [
            'id' => $pdo->lastInsertId(),
            'name_nonce' => $nameNonce,
            'name_cipher' => $nameCipher,
            'email_nonce' => $emailNonce,
            'email_cipher' => $emailCipher,
            'dni_nonce' => $dniNonce,
            'dni_cipher' => $dniCipher,
            'email_lookup' => emailLookup($email),
            'role' => 'cliente',
            'sede_id' => null,
        ];
        issueSession($pdo, $user);
        respond(201, ['user' => publicUser($user)]);
    }

    if ($path === '/auth/logout' && $method === 'POST') {
        $token = $_COOKIE[SESSION_COOKIE] ?? '';
        $parts = explode('.', $token);
        if (count($parts) === 5 && $parts[1] === '') {
            $header = json_decode(base64UrlDecode($parts[0]) ?: '', true);
            $iv = base64UrlDecode($parts[2]);
            $ciphertext = base64UrlDecode($parts[3]);
            $tag = base64UrlDecode($parts[4]);
            $encodedPayload = is_array($header) && $iv !== false && $ciphertext !== false && $tag !== false
                ? openssl_decrypt($ciphertext, 'aes-256-gcm', signingKey(), OPENSSL_RAW_DATA, $iv, $tag, $parts[0])
                : false;
            $payload = $encodedPayload === false ? null : json_decode(base64UrlDecode($encodedPayload) ?: '', true);
            if (is_array($payload) && isset($payload['jti'])) {
                $pdo->prepare('DELETE FROM app_sessions WHERE jti_hash = ?')
                    ->execute([hash('sha256', (string) $payload['jti'], true)]);
            }
        }
        clearSessionCookie();
        respond(200, ['success' => true]);
    }

    if ($path === '/auth/me' && $method === 'GET') {
        $user = currentUser($pdo);
        if ($user) {
            unset($user['email_lookup']);
        }
        respond(200, ['user' => $user]);
    }

    if ($path === '/auth/change-password' && $method === 'POST') {
        $user = requireUser($pdo);
        $body = requestBody();
        $current = (string) ($body['currentPassword'] ?? '');
        $next = (string) ($body['newPassword'] ?? '');
        $statement = $pdo->prepare('SELECT password_hash FROM app_users WHERE id = ?');
        $statement->execute([$user['id']]);
        $hash = $statement->fetchColumn();
        if (!is_string($hash) || !password_verify($current, $hash)) {
            respond(403, ['error' => 'La contraseña actual no es correcta.']);
        }
        if (strlen($next) < 12 || strlen($next) > 1024) {
            respond(422, ['error' => 'La nueva contraseña debe tener entre 12 y 1024 caracteres.']);
        }
        $hash = password_hash($next, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT);
        $pdo->prepare('UPDATE app_users SET password_hash = ? WHERE id = ?')->execute([$hash, $user['id']]);
        $cookieParts = explode('.', $_COOKIE[SESSION_COOKIE] ?? '');
        $iv = count($cookieParts) === 5 ? base64UrlDecode($cookieParts[2]) : false;
        $ciphertext = count($cookieParts) === 5 ? base64UrlDecode($cookieParts[3]) : false;
        $tag = count($cookieParts) === 5 ? base64UrlDecode($cookieParts[4]) : false;
        $encodedPayload = $iv !== false && $ciphertext !== false && $tag !== false
            ? openssl_decrypt($ciphertext, 'aes-256-gcm', signingKey(), OPENSSL_RAW_DATA, $iv, $tag, $cookieParts[0])
            : false;
        $payload = $encodedPayload === false ? null : json_decode(base64UrlDecode($encodedPayload) ?: '', true);
        $currentSessionHash = is_array($payload) && isset($payload['jti'])
            ? hash('sha256', (string) $payload['jti'], true)
            : '';
        $pdo->prepare('DELETE FROM app_sessions WHERE user_id = ? AND jti_hash <> ?')
            ->execute([$user['id'], $currentSessionHash]);
        respond(200, ['success' => true]);
    }

    if ($path === '/auth/admin/password' && $method === 'POST') {
        $user = requireUser($pdo);
        requireMaster($user);
        $body = requestBody();
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['newPassword'] ?? '');
        if (strlen($password) < 12 || strlen($password) > 1024) {
            respond(422, ['error' => 'La nueva contraseña debe tener al menos 12 caracteres.']);
        }
        $statement = $pdo->prepare('SELECT id FROM app_users WHERE email_lookup = ?');
        $statement->execute([emailLookup($email)]);
        $accountId = $statement->fetchColumn();
        if ($accountId === false) {
            respond(404, ['error' => 'No se encontró la cuenta indicada.']);
        }
        $pdo->prepare('UPDATE app_users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?')
            ->execute([password_hash($password, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT), $accountId]);
        $pdo->prepare('DELETE FROM app_sessions WHERE user_id = ?')->execute([$accountId]);
        respond(200, ['success' => true]);
    }

    if ($path === '/admin/users' && $method === 'GET') {
        $user = requireUser($pdo);
        requireMaster($user);
        $query = trim((string) ($_GET['q'] ?? ''));
        if ($query === '' || strlen($query) > 190) {
            respond(200, ['users' => []]);
        }
        $digits = preg_replace('/\D/', '', $query);
        $sql = 'SELECT id, name_nonce, name_cipher, email_nonce, email_cipher, dni_nonce, dni_cipher, role, sede_id FROM app_users WHERE email_lookup = ?';
        $params = [emailLookup($query)];
        if (strlen($digits) === 8) {
            $sql .= ' OR dni_lookup = ?';
            $params[] = dniLookupHash($digits);
        }
        $statement = $pdo->prepare($sql . ' LIMIT 5');
        $statement->execute($params);
        $today = date('Y-m-d');
        $dailyCode = getOrCreateDailyCode($pdo, $today);
        $users = array_map(static function (array $record) use ($dailyCode, $today): array {
            $id = (string) $record['id'];
            $clientCode = $record['role'] === 'cliente' ? deriveClientRecoveryCode($dailyCode, $id, $today) : '';
            return [
                'id' => $id,
                'name' => decryptData($record['name_nonce'], $record['name_cipher']),
                'email' => decryptData($record['email_nonce'], $record['email_cipher']),
                'dni' => $record['dni_nonce'] === null ? '' : decryptData($record['dni_nonce'], $record['dni_cipher']),
                'role' => $record['role'],
                'sede' => $record['sede_id'],
                'recoveryCode' => $clientCode,
                'formattedRecoveryCode' => $clientCode !== '' ? "PLT-{$clientCode}" : '',
            ];
        }, $statement->fetchAll());
        respond(200, ['users' => $users]);
    }

    if ($path === '/admin/recovery-code' && ($method === 'GET' || $method === 'POST')) {
        $user = requireUser($pdo);
        requireMaster($user);
        $today = date('Y-m-d');
        if ($method === 'POST') {
            $code = (string) random_int(100000, 999999);
            [$nonce, $cipher] = encryptData($code);
            $pdo->prepare(
                'INSERT INTO app_recovery_codes (code_date, code_nonce, code_cipher) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE code_nonce = VALUES(code_nonce), code_cipher = VALUES(code_cipher), created_at = CURRENT_TIMESTAMP'
            )->execute([$today, $nonce, $cipher]);
            respond(200, ['code' => $code, 'dateKey' => $today]);
        }
        $code = getOrCreateDailyCode($pdo, $today);
        respond(200, ['code' => $code, 'dateKey' => $today]);
    }

    if ($path === '/admin/recovery-code/validate' && $method === 'POST') {
        $user = requireUser($pdo);
        requireMaster($user);
        $body = requestBody();
        $input = preg_replace('/\D/', '', (string) ($body['code'] ?? ''));
        $identifier = trim((string) ($body['identifier'] ?? ''));
        $today = date('Y-m-d');
        $dailyCode = getOrCreateDailyCode($pdo, $today);

        $valid = strlen($input) === 6 && hash_equals($dailyCode, $input);
        if (!$valid && $identifier !== '' && strlen($input) === 6) {
            $digits = preg_replace('/\D/', '', $identifier);
            $lookup = strlen($digits) === 8 ? dniLookupHash($digits) : random_bytes(32);
            $account = $pdo->prepare(
                'SELECT id FROM app_users WHERE (email_lookup = ? OR dni_lookup = ?) AND role = "cliente" LIMIT 1'
            );
            $account->execute([emailLookup($identifier), $lookup]);
            $targetId = $account->fetchColumn();
            if ($targetId !== false) {
                $clientCode = deriveClientRecoveryCode($dailyCode, (string) $targetId, $today);
                $valid = hash_equals($clientCode, $input);
            }
        }
        respond(200, ['valid' => $valid]);
    }

    if ($path === '/auth/recover/validate' && $method === 'POST') {
        $body = requestBody();
        $identifier = trim((string) ($body['identifier'] ?? ''));
        $inputCode = preg_replace('/\D/', '', (string) ($body['code'] ?? ''));
        if ($identifier === '' || strlen($inputCode) !== 6) {
            respond(422, ['error' => 'Ingresa tu DNI o correo y el código de 6 dígitos.']);
        }
        $today = date('Y-m-d');
        $statement = $pdo->prepare('SELECT code_nonce, code_cipher FROM app_recovery_codes WHERE code_date = ?');
        $statement->execute([$today]);
        $row = $statement->fetch();
        $digits = preg_replace('/\D/', '', $identifier);
        $lookup = strlen($digits) === 8 ? dniLookupHash($digits) : random_bytes(32);
        $account = $pdo->prepare(
            'SELECT id, name_nonce, name_cipher, email_nonce, email_cipher, dni_nonce, dni_cipher, failed_attempts, locked_until
             FROM app_users WHERE (email_lookup = ? OR dni_lookup = ?) AND role = "cliente" LIMIT 1'
        );
        $account->execute([emailLookup($identifier), $lookup]);
        $target = $account->fetch();
        if (!$target || !$row) {
            respond(400, ['error' => 'No se pudo validar el usuario o el código de recuperación.']);
        }
        if ($target['locked_until'] && strtotime($target['locked_until']) > time()) {
            respond(429, ['error' => 'Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar.']);
        }
        $dailyCode = decryptData($row['code_nonce'], $row['code_cipher']);
        $expectedClientCode = deriveClientRecoveryCode($dailyCode, (string) $target['id'], $today);
        if (!hash_equals($expectedClientCode, $inputCode)) {
            $attempts = (int) $target['failed_attempts'] + 1;
            $lockedUntil = $attempts >= 5 ? date('Y-m-d H:i:s', time() + 900) : null;
            $pdo->prepare('UPDATE app_users SET failed_attempts = ?, locked_until = ? WHERE id = ?')
                ->execute([$attempts >= 5 ? 0 : $attempts, $lockedUntil, $target['id']]);
            respond(400, ['error' => 'No se pudo validar el usuario o el código de recuperación.']);
        }

        $email = decryptData($target['email_nonce'], $target['email_cipher']);
        $parts = explode('@', $email);
        $maskedEmail = count($parts) === 2
            ? substr($parts[0], 0, 2) . '***@' . $parts[1]
            : $email;
        $dni = $target['dni_nonce'] === null ? '' : decryptData($target['dni_nonce'], $target['dni_cipher']);
        $maskedDni = strlen($dni) === 8 ? '****' . substr($dni, -4) : '';

        respond(200, ['targetUser' => [
            'id' => (string) $target['id'],
            'name' => decryptData($target['name_nonce'], $target['name_cipher']),
            'email' => $maskedEmail,
            'dni' => $maskedDni,
        ]]);
    }

    if ($path === '/auth/recover/reset' && $method === 'POST') {
        $body = requestBody();
        $identifier = trim((string) ($body['identifier'] ?? ''));
        $inputCode = preg_replace('/\D/', '', (string) ($body['code'] ?? ''));
        $password = (string) ($body['newPassword'] ?? '');
        if ($identifier === '' || strlen($inputCode) !== 6 || strlen($password) < 12 || strlen($password) > 1024) {
            respond(422, ['error' => 'Datos inválidos o contraseña de menos de 12 caracteres.']);
        }
        $today = date('Y-m-d');
        $statement = $pdo->prepare('SELECT code_nonce, code_cipher FROM app_recovery_codes WHERE code_date = ?');
        $statement->execute([$today]);
        $row = $statement->fetch();
        $digits = preg_replace('/\D/', '', $identifier);
        $lookup = strlen($digits) === 8 ? dniLookupHash($digits) : random_bytes(32);
        $account = $pdo->prepare(
            'SELECT id, name_nonce, name_cipher, email_nonce, email_cipher, dni_nonce, dni_cipher, failed_attempts, locked_until
             FROM app_users WHERE (email_lookup = ? OR dni_lookup = ?) AND role = "cliente" LIMIT 1'
        );
        $account->execute([emailLookup($identifier), $lookup]);
        $target = $account->fetch();
        if (!$target || !$row) {
            respond(400, ['error' => 'No se pudo validar el usuario o el código de recuperación.']);
        }
        if ($target['locked_until'] && strtotime($target['locked_until']) > time()) {
            respond(429, ['error' => 'Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar.']);
        }
        $dailyCode = decryptData($row['code_nonce'], $row['code_cipher']);
        $expectedClientCode = deriveClientRecoveryCode($dailyCode, (string) $target['id'], $today);
        if (!hash_equals($expectedClientCode, $inputCode)) {
            $attempts = (int) $target['failed_attempts'] + 1;
            $lockedUntil = $attempts >= 5 ? date('Y-m-d H:i:s', time() + 900) : null;
            $pdo->prepare('UPDATE app_users SET failed_attempts = ?, locked_until = ? WHERE id = ?')
                ->execute([$attempts >= 5 ? 0 : $attempts, $lockedUntil, $target['id']]);
            respond(400, ['error' => 'No se pudo validar el usuario o el código de recuperación.']);
        }
        $userId = (int) $target['id'];
        $pdo->prepare('UPDATE app_users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?')
            ->execute([password_hash($password, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT), $userId]);
        $pdo->prepare('DELETE FROM app_sessions WHERE user_id = ?')->execute([$userId]);

        $masterId = getMasterOwnerId($pdo, false);
        if ($masterId > 0) {
            $logs = readNamespaceData($pdo, $masterId, 'recovery_logs') ?: [];
            if (!is_array($logs)) {
                $logs = [];
            }
            $nowIso = date(DATE_ATOM);
            $userName = decryptData($target['name_nonce'], $target['name_cipher']);
            $userEmail = decryptData($target['email_nonce'], $target['email_cipher']);
            $userDni = $target['dni_nonce'] === null ? 'No registrado' : decryptData($target['dni_nonce'], $target['dni_cipher']);
            array_unshift($logs, [
                'id' => 'rec-' . bin2hex(random_bytes(4)),
                'userId' => (string) $userId,
                'userName' => $userName,
                'dni' => $userDni,
                'userDni' => $userDni,
                'email' => $userEmail,
                'userEmail' => $userEmail,
                'codeUsed' => "PLT-{$inputCode}",
                'usedCode' => $inputCode,
                'dateKey' => $today,
                'recoveredAt' => $nowIso,
                'timestamp' => $nowIso,
            ]);
            writeNamespaceData($pdo, $masterId, 'recovery_logs', array_slice($logs, 0, 50));
        }
        respond(200, ['success' => true]);
    }

    if ($path === '/migration/import' && $method === 'POST') {
        $user = currentUser($pdo);
        if (!isMasterUser($user)) {
            respond(403, ['error' => 'Solo el administrador principal puede importar datos antiguos.']);
        }
        $body = requestBody();
        $records = $body['records'] ?? [];
        $discardKeys = $body['discardKeys'] ?? [];
        if (!is_array($records) || !is_array($discardKeys)) {
            respond(422, ['error' => 'El conjunto de datos de migración no es válido.']);
        }
        $namespaceKeys = [
            'platino_catalog_products_v1' => 'catalog',
            'platino_citas_v1' => 'appointments',
            'platino_blocked_slots_v1' => 'blocked_slots',
            'platino_category_margins_v2' => 'finance',
            'platino_certified_gemstones' => 'gemstones',
            'platino_gem_laboratories' => 'laboratories',
            'platino_home_images_v1' => 'home_images',
            'platino_announcement_text_v1' => 'announcement',
            'platino_announcement_active_v1' => 'announcement_active',
            'platino_inventory_stock_v1' => 'inventory',
            'platino_nosotros_content_v1' => 'nosotros',
            'platino_orders_v1' => 'orders',
            'platino_admin_permissions_v4' => 'permissions',
            'platino_permission_requests_v4' => 'permission_requests',
            'platino_reclamaciones_v1' => 'reclamations',
            'platino_care_config_v2' => 'care_config',
            'platino_care_clients_v2' => 'care_clients',
            'platino_password_recovery_logs_v1' => 'recovery_logs',
        ];
        $consumedKeys = [];
        $pdo->beginTransaction();
        try {
            $userList = $records['platino_users_database'] ?? [];
            $usersComplete = is_array($userList);
            if (is_array($userList)) {
                foreach ($userList as $legacyUser) {
                    if (!is_array($legacyUser)) {
                        $usersComplete = false;
                        continue;
                    }
                    $email = strtolower(trim((string) ($legacyUser['email'] ?? '')));
                    $name = trim((string) ($legacyUser['name'] ?? $legacyUser['nombre'] ?? ''));
                    $password = (string) ($legacyUser['password'] ?? $legacyUser['contrasena'] ?? $legacyUser['clave'] ?? '');
                    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $name === '' || strlen($name) > 150 ||
                        strlen($password) < 6 || strlen($password) > 1024 ||
                        $email === 'vladimiryt18@gmail.com') {
                        if ($email !== 'vladimiryt18@gmail.com') {
                            $usersComplete = false;
                        }
                        continue;
                    }
                    $existing = $pdo->prepare('SELECT id FROM app_users WHERE email_lookup = ? LIMIT 1');
                    $existing->execute([emailLookup($email)]);
                    if ($existing->fetchColumn()) {
                        continue;
                    }
                    $dni = preg_replace('/\D/', '', (string) ($legacyUser['dni'] ?? $legacyUser['documento'] ?? ''));
                    $dniLookup = strlen($dni) === 8 ? dniLookupHash($dni) : null;
                    if ($dniLookup !== null) {
                        $existingDni = $pdo->prepare('SELECT id FROM app_users WHERE dni_lookup = ? LIMIT 1');
                        $existingDni->execute([$dniLookup]);
                        if ($existingDni->fetchColumn()) {
                            $dni = '';
                            $dniLookup = null;
                        }
                    }
                    [$nameNonce, $nameCipher] = encryptData($name);
                    [$emailNonce, $emailCipher] = encryptData($email);
                    $dniNonce = null;
                    $dniCipher = null;
                    if ($dni !== '') {
                        [$dniNonce, $dniCipher] = encryptData($dni);
                    }
                    $sedeId = in_array($email, ['admin.lima@platino.pe', 'admin.miraflores@platino.pe'], true)
                        ? ($email === 'admin.lima@platino.pe' ? 'lima-centro' : 'miraflores')
                        : null;
                    $role = $sedeId === null ? 'cliente' : 'admin_sede';
                    $insert = $pdo->prepare(
                        'INSERT INTO app_users (name_nonce, name_cipher, email_nonce, email_cipher, email_lookup,
                         dni_nonce, dni_cipher, dni_lookup, password_hash, role, sede_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                    );
                    $insert->execute([
                        $nameNonce, $nameCipher, $emailNonce, $emailCipher, emailLookup($email),
                        $dni !== '' ? $dniNonce : null, $dni !== '' ? $dniCipher : null, $dniLookup,
                        password_hash($password, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT),
                        $role, $sedeId,
                    ]);
                }
                if (isset($records['platino_users_database']) && $usersComplete) {
                    $consumedKeys[] = 'platino_users_database';
                }
            }
            $pendingKeys = [];
            if (isset($records['platino_users_database']) && !in_array('platino_users_database', $consumedKeys, true)) {
                $pendingKeys[] = 'platino_users_database';
            }

            $masterId = (int) $user['id'];
            foreach ($namespaceKeys as $legacyKey => $namespace) {
                if (!array_key_exists($legacyKey, $records)) {
                    continue;
                }
                writeNamespaceData($pdo, $masterId, $namespace, $records[$legacyKey]);
                $consumedKeys[] = $legacyKey;
            }

            foreach ($records as $legacyKey => $favorites) {
                if (!is_string($legacyKey) || !str_starts_with($legacyKey, 'platino_favorites_')) {
                    continue;
                }
                $email = strtolower(trim(substr($legacyKey, strlen('platino_favorites_'))));
                $lookup = $pdo->prepare('SELECT id FROM app_users WHERE email_lookup = ? LIMIT 1');
                $lookup->execute([emailLookup($email)]);
                $favoriteOwner = (int) $lookup->fetchColumn();
                if ($favoriteOwner === 0 || !is_array($favorites)) {
                    $pendingKeys[] = $legacyKey;
                    continue;
                }
                writeNamespaceData($pdo, $favoriteOwner, 'favorites', $favorites);
                $consumedKeys[] = $legacyKey;
            }

            $allowedDiscardKeys = [
                'platino_auth_user', 'platino_admin_passwords_v2',
                'platino_daily_recovery_seed_v1', 'platino_last_viewed_product_id',
            ];
            foreach ($discardKeys as $key) {
                if (is_string($key) && in_array($key, $allowedDiscardKeys, true)) {
                    $consumedKeys[] = $key;
                }
            }
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }
        respond(200, [
            'success' => true,
            'consumedKeys' => array_values(array_unique($consumedKeys)),
            'pendingKeys' => $pendingKeys,
        ]);
    }

    if ($path === '/public/care/lookup' && $method === 'GET') {
        $dni = preg_replace('/\D/', '', (string) ($_GET['dni'] ?? ''));
        if (strlen($dni) !== 8) {
            respond(200, ['record' => null]);
        }
        $ownerId = getMasterOwnerId($pdo, false);
        $clients = readNamespaceData($pdo, $ownerId, 'care_clients');
        if (!is_array($clients)) {
            respond(200, ['record' => null]);
        }
        foreach ($clients as $client) {
            if (is_array($client) && trim((string) ($client['dni'] ?? '')) === $dni) {
                respond(200, ['record' => [
                    'id' => $client['id'] ?? '',
                    'dni' => $client['dni'] ?? '',
                    'clientName' => $client['clientName'] ?? '',
                    'planType' => $client['planType'] ?? 'cortesia',
                    'planTitle' => $client['planTitle'] ?? '',
                    'orderId' => $client['orderId'] ?? '',
                    'productName' => $client['productName'] ?? '',
                    'productMetal' => $client['productMetal'] ?? '',
                    'fechaRegistro' => $client['fechaRegistro'] ?? null,
                    'fechaValidacionGratuidad' => $client['fechaValidacionGratuidad'] ?? null,
                    'fechaEntallado' => $client['fechaEntallado'] ?? null,
                    'entalladoStatus' => $client['entalladoStatus'] ?? 'pendiente',
                    'entalladoDetalle' => $client['entalladoDetalle'] ?? '',
                    'fechaLimpieza' => $client['fechaLimpieza'] ?? null,
                    'fechaProximoMantenimiento' => $client['fechaProximoMantenimiento'] ?? null,
                    'status' => $client['status'] ?? 'activo',
                    'paymentConfirmed' => (bool) ($client['paymentConfirmed'] ?? false),
                    'paymentConfirmedAt' => $client['paymentConfirmedAt'] ?? null,
                    'approvedBy' => $client['approvedBy'] ?? null,
                    'paymentMethod' => $client['paymentMethod'] ?? '',
                    'canEnjoyBenefits' => (bool) ($client['canEnjoyBenefits'] ?? false),
                ]]);
            }
        }
        respond(200, ['record' => null]);
    }

    if ($path === '/admin/appointments/mutate' && $method === 'POST') {
        $user = requireUser($pdo);
        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        if (!adminHasNamespacePermission($pdo, $user, $ownerId, 'appointments')) {
            $pdo->rollBack();
            respond(403, ['error' => 'No tienes permiso para gestionar citas.']);
        }
        $body = requestBody();
        $action = (string) ($body['action'] ?? '');
        $id = (string) ($body['id'] ?? '');
        $appointments = readNamespaceData($pdo, $ownerId, 'appointments', true) ?: [];
        if (!is_array($appointments)) {
            $appointments = [];
        }
        if ($action === 'update_status') {
            $status = (string) ($body['status'] ?? '');
            if (!in_array($status, ['confirmada', 'atendida', 'cancelada', 'pendiente'], true)) {
                $pdo->rollBack();
                respond(422, ['error' => 'Estado de cita no válido.']);
            }
            foreach ($appointments as &$item) {
                if (($item['id'] ?? '') === $id) {
                    $item['status'] = $status;
                }
            }
            unset($item);
        } elseif ($action === 'delete') {
            $appointments = array_values(array_filter($appointments, static fn($c) => ($c['id'] ?? '') !== $id));
        } else {
            $pdo->rollBack();
            respond(422, ['error' => 'Acción de cita no válida.']);
        }
        writeNamespaceData($pdo, $ownerId, 'appointments', $appointments);
        $pdo->commit();
        respond(200, ['data' => $appointments]);
    }

    if ($path === '/admin/orders/mutate' && $method === 'POST') {
        $user = requireUser($pdo);
        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        if (!adminHasNamespacePermission($pdo, $user, $ownerId, 'orders')) {
            $pdo->rollBack();
            respond(403, ['error' => 'No tienes permiso para modificar pedidos.']);
        }
        $body = requestBody();
        $action = (string) ($body['action'] ?? '');
        $orderId = (string) ($body['orderId'] ?? '');
        $orders = readNamespaceData($pdo, $ownerId, 'orders', true) ?: [];
        if (!is_array($orders)) {
            $orders = [];
        }
        if ($action === 'delete') {
            $orders = array_values(array_filter($orders, static fn($o) => ($o['id'] ?? '') !== $orderId));
            writeNamespaceData($pdo, $ownerId, 'orders', $orders);
            $pdo->commit();
            respond(200, ['data' => $orders]);
        }

        $found = false;
        $today = date('Y-m-d');
        foreach ($orders as &$order) {
            if (($order['id'] ?? '') !== $orderId) {
                continue;
            }
            $found = true;
            if ($action === 'update_status') {
                $newStage = (string) ($body['stage'] ?? $order['stage'] ?? 'recibido');
                $order['stage'] = $newStage;
                if (array_key_exists('adminNotes', $body) && $body['adminNotes'] !== null) {
                    $order['adminNotes'] = (string) $body['adminNotes'];
                }
                if (is_array($body['timeline'] ?? null)) {
                    $order['timeline'] = $body['timeline'];
                }
                $order['lastUpdated'] = $today;
            } elseif ($action === 'update_payment') {
                if (!empty($body['paymentStatus'])) {
                    $order['paymentStatus'] = (string) $body['paymentStatus'];
                }
                if (array_key_exists('paymentMethod', $body) && $body['paymentMethod'] !== null) {
                    $order['paymentMethod'] = (string) $body['paymentMethod'];
                }
                if (array_key_exists('paymentNotes', $body) && $body['paymentNotes'] !== null) {
                    $order['paymentNotes'] = (string) $body['paymentNotes'];
                }
                $order['lastUpdated'] = $today;
            } elseif ($action === 'update_fields') {
                $fields = $body['fields'] ?? [];
                if (is_array($fields)) {
                    unset($fields['id'], $fields['total'], $fields['items'], $fields['clientEmail'], $fields['clientDni']);
                    $order = array_merge($order, $fields);
                    $order['lastUpdated'] = $today;
                }
            } else {
                $pdo->rollBack();
                respond(422, ['error' => 'Acción de pedido no válida.']);
            }
            break;
        }
        unset($order);

        if (!$found) {
            $pdo->rollBack();
            respond(404, ['error' => 'No se encontró el pedido indicado.']);
        }
        writeNamespaceData($pdo, $ownerId, 'orders', $orders);
        $pdo->commit();
        respond(200, ['data' => $orders]);
    }

    if ($path === '/admin/reclamations/mutate' && $method === 'POST') {
        $user = requireUser($pdo);
        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        if (!adminHasNamespacePermission($pdo, $user, $ownerId, 'reclamations')) {
            $pdo->rollBack();
            respond(403, ['error' => 'No tienes permiso para gestionar el libro de reclamaciones.']);
        }
        $body = requestBody();
        $id = (string) ($body['id'] ?? '');
        $status = (string) ($body['estado'] ?? '');
        $reclamations = readNamespaceData($pdo, $ownerId, 'reclamations', true) ?: [];
        if (!is_array($reclamations)) {
            $reclamations = [];
        }
        foreach ($reclamations as &$rec) {
            if (($rec['id'] ?? '') === $id) {
                if ($status !== '') {
                    $rec['estado'] = $status;
                }
                if (array_key_exists('respuestaProveedor', $body) && is_array($body['respuestaProveedor'])) {
                    $rec['respuestaProveedor'] = $body['respuestaProveedor'];
                }
                break;
            }
        }
        unset($rec);
        writeNamespaceData($pdo, $ownerId, 'reclamations', $reclamations);
        $pdo->commit();
        respond(200, ['data' => $reclamations]);
    }

    if ($path === '/admin/care-clients/mutate' && $method === 'POST') {
        $user = requireUser($pdo);
        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        if (!adminHasNamespacePermission($pdo, $user, $ownerId, 'care_clients')) {
            $pdo->rollBack();
            respond(403, ['error' => 'No tienes permiso para gestionar clientes de Platino Care.']);
        }
        $body = requestBody();
        $action = (string) ($body['action'] ?? '');
        $clients = readNamespaceData($pdo, $ownerId, 'care_clients', true) ?: [];
        if (!is_array($clients)) {
            $clients = [];
        }
        if ($action === 'upsert' && is_array($body['record'] ?? null)) {
            $record = $body['record'];
            $dni = trim((string) ($record['dni'] ?? ''));
            $id = trim((string) ($record['id'] ?? ''));
            $matched = false;
            foreach ($clients as $idx => $existing) {
                if (($id !== '' && ($existing['id'] ?? '') === $id) || ($dni !== '' && trim((string) ($existing['dni'] ?? '')) === $dni)) {
                    $clients[$idx] = array_merge($existing, $record);
                    $matched = true;
                    break;
                }
            }
            if (!$matched) {
                array_unshift($clients, $record);
            }
        } elseif ($action === 'delete') {
            $target = trim((string) ($body['idOrDni'] ?? ''));
            $clients = array_values(array_filter(
                $clients,
                static fn($c) => ($c['id'] ?? '') !== $target && trim((string) ($c['dni'] ?? '')) !== $target
            ));
        } else {
            $pdo->rollBack();
            respond(422, ['error' => 'Acción de Platino Care no válida.']);
        }
        writeNamespaceData($pdo, $ownerId, 'care_clients', $clients);
        $pdo->commit();
        respond(200, ['data' => $clients]);
    }

    if ($path === '/admin/permission-requests/mutate' && $method === 'POST') {
        $user = requireUser($pdo);
        requireAdmin($user);
        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        $body = requestBody();
        $action = (string) ($body['action'] ?? '');
        $requests = readNamespaceData($pdo, $ownerId, 'permission_requests', true) ?: [];
        if (!is_array($requests)) {
            $requests = [];
        }
        if ($action === 'create' && is_array($body['request'] ?? null)) {
            $req = $body['request'];
            $email = strtolower(trim((string) $user['email']));
            $permKey = (string) ($req['permissionKey'] ?? '');
            foreach ($requests as $existing) {
                if (strtolower((string) ($existing['userEmail'] ?? '')) === $email &&
                    ($existing['permissionKey'] ?? '') === $permKey &&
                    ($existing['status'] ?? '') === 'pendiente') {
                    $pdo->rollBack();
                    respond(409, ['error' => 'Ya tienes una solicitud pendiente para este permiso.']);
                }
            }
            $req['userEmail'] = $email;
            $req['userName'] = $user['name'];
            $req['status'] = 'pendiente';
            $req['createdAt'] = date(DATE_ATOM);
            array_unshift($requests, $req);
            writeNamespaceData($pdo, $ownerId, 'permission_requests', $requests);
            $pdo->commit();
            respond(200, ['data' => $requests]);
        }
        if (!isMasterUser($user)) {
            $pdo->rollBack();
            respond(403, ['error' => 'Solo el administrador principal puede resolver solicitudes de permisos.']);
        }
        if (is_array($body['requests'] ?? null)) {
            $requests = $body['requests'];
            writeNamespaceData($pdo, $ownerId, 'permission_requests', $requests);
        }
        if (is_array($body['permissions'] ?? null)) {
            writeNamespaceData($pdo, $ownerId, 'permissions', $body['permissions']);
        }
        $pdo->commit();
        respond(200, ['data' => $requests]);
    }

    if ($path === '/data' && ($method === 'GET' || $method === 'PUT' || $method === 'DELETE')) {
        $namespace = (string) ($_GET['namespace'] ?? '');
        $allowedNamespaces = [
            'catalog', 'home_images', 'announcement', 'announcement_active', 'gemstones',
            'laboratories', 'inventory', 'appointments', 'blocked_slots', 'orders',
            'favorites', 'finance', 'nosotros', 'permissions', 'permission_requests',
            'reclamations', 'care_config', 'care_clients', 'recovery_logs', 'educacion',
        ];
        if (!in_array($namespace, $allowedNamespaces, true)) {
            respond(422, ['error' => 'Espacio de datos no válido.']);
        }

        $user = currentUser($pdo);
        $isPrivate = $namespace === 'favorites';
        if ($isPrivate && $user === null) {
            respond(401, ['error' => 'Inicia sesión para acceder a estos datos.']);
        }

        $adminOnlyReadNamespaces = [
            'reclamations', 'permission_requests', 'permissions', 'recovery_logs', 'care_clients',
        ];
        if ($method === 'GET') {
            if (in_array($namespace, $adminOnlyReadNamespaces, true)) {
                if ($user === null) {
                    respond(401, ['error' => 'Inicia sesión con una cuenta autorizada para consultar estos datos.']);
                }
                if (!isAdminUser($user)) {
                    respond(403, ['error' => 'No tienes permiso para consultar estos datos administrativos.']);
                }
                if ($namespace === 'recovery_logs' && !isMasterUser($user)) {
                    respond(403, ['error' => 'Solo el administrador principal puede consultar el historial de recuperaciones.']);
                }
            }
            if ($namespace === 'orders' && $user === null) {
                respond(401, ['error' => 'Inicia sesión para consultar tus pedidos.']);
            }
        }

        $ownerId = $isPrivate ? (int) $user['id'] : getMasterOwnerId($pdo, $method !== 'GET');

        if (!$isPrivate && $method !== 'GET') {
            if ($user === null) {
                respond(401, ['error' => 'Inicia sesión para guardar estos datos.']);
            }
            if (!isAdminUser($user)) {
                respond(403, ['error' => 'No tienes permiso para modificar estos datos.']);
            }
            if ($method === 'DELETE' && !isMasterUser($user)) {
                respond(403, ['error' => 'Solo el administrador principal puede eliminar conjuntos de datos.']);
            }
            if ($namespace === 'permissions' || $namespace === 'recovery_logs' || $namespace === 'care_config') {
                requireMaster($user);
            } elseif ($namespace === 'permission_requests') {
                if (!isMasterUser($user)) {
                    $body = requestBody();
                    $incoming = $body['data'] ?? null;
                    if (!is_array($incoming)) {
                        respond(422, ['error' => 'Formato de solicitudes no válido.']);
                    }
                    $existingReqs = readNamespaceData($pdo, $ownerId, 'permission_requests', true) ?: [];
                    $email = strtolower(trim((string) $user['email']));
                    foreach ($incoming as $reqItem) {
                        if (!is_array($reqItem)) {
                            continue;
                        }
                        $alreadyExisted = false;
                        foreach ($existingReqs as $oldItem) {
                            if (($oldItem['id'] ?? '') === ($reqItem['id'] ?? '')) {
                                $alreadyExisted = true;
                                if (($oldItem['status'] ?? '') !== ($reqItem['status'] ?? '')) {
                                    respond(403, ['error' => 'Solo el administrador principal puede aprobar o rechazar permisos.']);
                                }
                                break;
                            }
                        }
                        if (!$alreadyExisted && (strtolower((string) ($reqItem['userEmail'] ?? '')) !== $email || ($reqItem['status'] ?? '') !== 'pendiente')) {
                            respond(403, ['error' => 'No puedes crear solicitudes a nombre de otro usuario ni pre-aprobarlas.']);
                        }
                    }
                    writeNamespaceData($pdo, $ownerId, 'permission_requests', $incoming);
                    respond(200, ['success' => true]);
                }
            } elseif (!adminHasNamespacePermission($pdo, $user, $ownerId, $namespace)) {
                respond(403, ['error' => 'No tienes permiso asignado para modificar este módulo.']);
            }
        }

        if ($method === 'GET') {
            $data = readNamespaceData($pdo, $ownerId, $namespace, false);
            if ($data === null) {
                respond(200, ['data' => null]);
            }
            if ($namespace === 'appointments' && ($user === null || !isAdminUser($user)) && is_array($data)) {
                $data = array_map(static fn($appointment) => [
                    'id' => $appointment['id'] ?? '',
                    'sedeId' => $appointment['sedeId'] ?? '',
                    'date' => $appointment['date'] ?? '',
                    'time' => $appointment['time'] ?? '',
                    'serviceType' => $appointment['serviceType'] ?? 'asesoria',
                    'status' => $appointment['status'] ?? 'confirmada',
                ], $data);
            }
            if ($namespace === 'orders' && is_array($user) && !isAdminUser($user) && is_array($data)) {
                $email = strtolower((string) $user['email']);
                $data = array_values(array_filter($data, static fn($order) => strtolower((string) ($order['clientEmail'] ?? '')) === $email));
            }
            if ($namespace === 'permission_requests' && is_array($user) && !isMasterUser($user) && is_array($data)) {
                $email = strtolower((string) $user['email']);
                $data = array_values(array_filter($data, static fn($req) => strtolower((string) ($req['userEmail'] ?? '')) === $email));
            }
            respond(200, ['data' => $data]);
        }

        if ($method === 'DELETE') {
            $pdo->prepare('DELETE FROM app_data WHERE owner_id = ? AND namespace = ?')->execute([$ownerId, $namespace]);
            respond(200, ['success' => true]);
        }

        $body = requestBody();
        if (!array_key_exists('data', $body)) {
            respond(422, ['error' => 'Falta el campo data.']);
        }
        writeNamespaceData($pdo, $ownerId, $namespace, $body['data']);
        respond(200, ['success' => true]);
    }

    if ($path === '/public/appointments' && $method === 'POST') {
        $body = requestBody();
        $sedeId = (string) ($body['sedeId'] ?? '');
        $date = (string) ($body['date'] ?? '');
        $time = (string) ($body['time'] ?? '');
        $name = trim((string) ($body['clientName'] ?? ''));
        $email = strtolower(trim((string) ($body['clientEmail'] ?? '')));
        $phone = trim((string) ($body['clientPhone'] ?? ''));
        if (!in_array($sedeId, ['lima-centro', 'miraflores'], true) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ||
            $time === '' || strlen($time) > 20 || $name === '' || strlen($name) > 150 ||
            !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190 || strlen($phone) > 50) {
            respond(422, ['error' => 'Los datos de la cita están incompletos o no son válidos.']);
        }
        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        $appointments = readNamespaceData($pdo, $ownerId, 'appointments', true) ?: [];
        $blocked = readNamespaceData($pdo, $ownerId, 'blocked_slots', true) ?: [];
        foreach (array_merge($appointments, $blocked) as $entry) {
            if (($entry['sedeId'] ?? '') === $sedeId && ($entry['date'] ?? '') === $date &&
                (($entry['time'] ?? '') === $time || ($entry['time'] ?? '') === 'FULL_DAY') &&
                ($entry['status'] ?? '') !== 'cancelada') {
                $pdo->rollBack();
                respond(409, ['error' => 'Ese horario acaba de ser reservado o bloqueado. Elige otro horario.']);
            }
        }
        $appointment = [
            'id' => 'PLT-' . random_int(1000, 9999), 'sedeId' => $sedeId,
            'serviceType' => 'asesoria', 'serviceTitle' => 'Cita de Asesoría General',
            'date' => $date, 'time' => $time, 'clientName' => $name,
            'clientPhone' => $phone, 'clientEmail' => $email,
            'observation' => substr(trim((string) ($body['observation'] ?? '')), 0, 2000),
            'status' => 'confirmada', 'createdAt' => date(DATE_ATOM),
        ];
        array_unshift($appointments, $appointment);
        writeNamespaceData($pdo, $ownerId, 'appointments', $appointments);
        $pdo->commit();
        respond(201, ['appointment' => $appointment]);
    }

    if ($path === '/public/orders' && $method === 'POST') {
        $user = currentUser($pdo);
        if (!is_array($user) || !in_array($user['role'] ?? '', ['cliente', 'admin_master', 'admin_sede', 'admin'], true)) {
            respond(403, ['error' => 'Inicia sesión con tu cuenta para registrar un pedido.']);
        }
        $body = requestBody();
        $input = $body['order'] ?? null;
        if (!is_array($input) || !is_array($input['items'] ?? null) || count($input['items']) < 1 ||
            count($input['items']) > 50 || !filter_var($user['email'], FILTER_VALIDATE_EMAIL)) {
            respond(422, ['error' => 'Los datos del pedido no son válidos.']);
        }
        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        $orders = readNamespaceData($pdo, $ownerId, 'orders', true) ?: [];
        $catalog = readNamespaceData($pdo, $ownerId, 'catalog', false) ?: [];
        $careConfig = readNamespaceData($pdo, $ownerId, 'care_config', false) ?: [];
        $plusPrice = isset($careConfig['plus']['price']) && is_numeric($careConfig['plus']['price'])
            ? (float) $careConfig['plus']['price']
            : 90.0;

        $catalogById = [];
        if (is_array($catalog)) {
            foreach ($catalog as $prod) {
                if (is_array($prod) && isset($prod['id'])) {
                    $catalogById[(string) $prod['id']] = $prod;
                }
            }
        }
        $defaultPrices = defaultCatalogPrices();

        $sanitizedItems = [];
        $computedTotal = 0.0;
        foreach ($input['items'] as $rawItem) {
            if (!is_array($rawItem)) {
                $pdo->rollBack();
                respond(422, ['error' => 'Uno de los productos del pedido no es válido.']);
            }
            $itemId = trim((string) ($rawItem['id'] ?? ''));
            $qty = max(1, min(20, (int) ($rawItem['quantity'] ?? 1)));
            $carePlan = ($rawItem['platinoCarePlan'] ?? 'cortesia') === 'plus' ? 'plus' : 'cortesia';
            $metalName = substr(trim((string) ($rawItem['metal'] ?? 'Oro 18K Blanco')), 0, 80);

            $basePrice = null;
            $isAccessory = false;
            if (isset($catalogById[$itemId])) {
                $prod = $catalogById[$itemId];
                $prodType = strtolower((string) ($prod['type'] ?? ''));
                $prodCat = strtolower((string) ($prod['category'] ?? ''));
                $isAccessory = $prodType === 'accesorio' || str_contains($prodCat, 'accesorio') || str_contains($prodCat, 'collar') || str_contains($prodCat, 'pulsera') || str_contains($prodCat, 'aretes');
                $basePrice = isset($prod['price']) && is_numeric($prod['price']) ? (float) $prod['price'] : null;
                if (isset($prod['metalPrices']) && is_array($prod['metalPrices'])) {
                    foreach ($prod['availableMetals'] ?? [] as $m) {
                        if (is_array($m) && (($m['name'] ?? '') === $metalName || ($m['id'] ?? '') === $metalName)) {
                            $mId = (string) ($m['id'] ?? '');
                            if ($mId !== '' && isset($prod['metalPrices'][$mId]) && is_numeric($prod['metalPrices'][$mId]) && (float) $prod['metalPrices'][$mId] > 0) {
                                $basePrice = (float) $prod['metalPrices'][$mId];
                            }
                            break;
                        }
                    }
                }
            } elseif (isset($defaultPrices[$itemId])) {
                $basePrice = $defaultPrices[$itemId];
                $isAccessory = str_starts_with($itemId, 'collar-') || str_starts_with($itemId, 'pulsera-') || str_starts_with($itemId, 'aretes-') || str_starts_with($itemId, 'porta-aros') || str_starts_with($itemId, 'copas-') || str_starts_with($itemId, 'cuadros-');
            }

            if ($basePrice === null || $basePrice <= 0) {
                $pdo->rollBack();
                respond(422, ['error' => 'El producto seleccionado no se encuentra disponible en el catálogo oficial.']);
            }

            $unitPrice = round($basePrice + ($carePlan === 'plus' && !$isAccessory ? $plusPrice : 0.0), 2);
            $computedTotal += $unitPrice * $qty;

            $sanitizedItems[] = [
                'id' => $itemId,
                'name' => substr(trim((string) ($rawItem['name'] ?? 'Joya Platino')), 0, 150),
                'metal' => $metalName,
                'size' => substr(trim((string) ($rawItem['size'] ?? 'Estándar')), 0, 120),
                'gemstone' => substr(trim((string) ($rawItem['gemstone'] ?? 'Diamante Natural')), 0, 120),
                'engraving' => isset($rawItem['engraving']) && $rawItem['engraving'] !== null ? substr(trim((string) $rawItem['engraving']), 0, 200) : null,
                'needsSizeAdvice' => (bool) ($rawItem['needsSizeAdvice'] ?? false),
                'stockUnits' => (int) ($rawItem['stockUnits'] ?? 0),
                'deliveryDays' => (int) ($rawItem['deliveryDays'] ?? 2),
                'estimatedDeliveryDate' => substr(trim((string) ($rawItem['estimatedDeliveryDate'] ?? '')), 0, 80),
                'platinoCarePlan' => $carePlan,
                'price' => $unitPrice,
                'quantity' => $qty,
                'image' => substr(trim((string) ($rawItem['image'] ?? '/images/secret-garden-white.jpg')), 0, 500),
            ];
        }

        $clientDni = (string) ($user['dni'] ?? '');
        if ($clientDni === '') {
            $submittedDni = preg_replace('/\D/', '', (string) ($input['clientDni'] ?? ''));
            if (strlen($submittedDni) === 8) {
                $clientDni = $submittedDni;
            }
        }
        $date = date('Y-m-d');
        $order = [
            'id' => 'PLT-' . date('Y') . '-' . random_int(1000, 9999),
            'date' => $date,
            'clientName' => $user['name'],
            'clientDni' => $clientDni,
            'clientEmail' => $user['email'],
            'clientPhone' => substr(trim((string) ($input['clientPhone'] ?? '')), 0, 50),
            'deliveryType' => in_array(($input['deliveryType'] ?? ''), ['recojo_sede', 'envio_domicilio'], true) ? $input['deliveryType'] : 'recojo_sede',
            'sedeRecojo' => substr(trim((string) ($input['sedeRecojo'] ?? '')), 0, 200),
            'shippingAddress' => substr(trim((string) ($input['shippingAddress'] ?? '')), 0, 500),
            'stage' => 'recibido',
            'estimatedCompletion' => substr(trim((string) ($input['estimatedCompletion'] ?? '15 días hábiles')), 0, 80),
            'adminNotes' => 'Pedido ingresado al sistema. En espera de asignación de maestro joyero.',
            'lastUpdated' => $date,
            'paymentStatus' => 'Pendiente de Validación',
            'paymentMethod' => substr(trim((string) ($input['paymentMethod'] ?? '')), 0, 80),
            'total' => round($computedTotal, 2),
            'items' => $sanitizedItems,
            'timeline' => [['stage' => 'recibido', 'date' => date(DATE_ATOM), 'note' => 'Pedido registrado.']],
        ];
        array_unshift($orders, $order);
        writeNamespaceData($pdo, $ownerId, 'orders', $orders);

        if ($clientDni !== '') {
            $careClients = readNamespaceData($pdo, $ownerId, 'care_clients', true) ?: [];
            if (!is_array($careClients)) {
                $careClients = [];
            }
            $hasPlus = false;
            foreach ($sanitizedItems as $it) {
                if (($it['platinoCarePlan'] ?? '') === 'plus') {
                    $hasPlus = true;
                    break;
                }
            }
            $careRecord = [
                'id' => 'CARE-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(3))),
                'dni' => $clientDni,
                'clientName' => $user['name'],
                'clientEmail' => $user['email'],
                'clientPhone' => $order['clientPhone'],
                'planType' => $hasPlus ? 'plus' : 'cortesia',
                'planTitle' => $hasPlus ? "Platino Care + (Premium S/. {$plusPrice})" : 'Platino Care Cortesía (Gratuito S/. 0)',
                'orderId' => $order['id'],
                'productName' => $sanitizedItems[0]['name'] ?? 'Joya Platino',
                'productMetal' => $sanitizedItems[0]['metal'] ?? 'Oro 18K',
                'fechaRegistro' => $date,
                'fechaValidacionGratuidad' => $hasPlus ? null : $date,
                'fechaEntallado' => null,
                'entalladoStatus' => 'pendiente',
                'entalladoDetalle' => '',
                'fechaLimpieza' => null,
                'fechaProximoMantenimiento' => null,
                'status' => $hasPlus ? 'pendiente_pago' : 'activo',
                'paymentConfirmed' => !$hasPlus,
                'paymentConfirmedAt' => null,
                'approvedBy' => $hasPlus ? null : 'Sistema Oficial Platino',
                'paymentMethod' => $hasPlus ? $order['paymentMethod'] : 'Gratuito (Cortesía)',
                'amountPaid' => $hasPlus ? $plusPrice : 0,
                'canEnjoyBenefits' => !$hasPlus,
                'notes' => $hasPlus
                    ? 'Plan Premium registrado. Pendiente de confirmación de pago.'
                    : 'Plan gratuito de cortesía validado.',
            ];
            $existingCareIndex = null;
            foreach ($careClients as $index => $existingCare) {
                if ((string) ($existingCare['dni'] ?? '') === $clientDni) {
                    $existingCareIndex = $index;
                    break;
                }
            }
            if ($existingCareIndex === null) {
                array_unshift($careClients, $careRecord);
            } else {
                $careClients[$existingCareIndex] = array_merge($careClients[$existingCareIndex], $careRecord);
            }
            writeNamespaceData($pdo, $ownerId, 'care_clients', $careClients);
        }
        $pdo->commit();
        respond(201, ['order' => $order]);
    }

    if ($path === '/public/reclamations' && $method === 'POST') {
        $body = requestBody();
        $input = $body['reclamation'] ?? null;
        $jsonInput = json_encode($input, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (!is_array($input) || !is_string($jsonInput) || strlen($jsonInput) > 20000 ||
            !is_array($input['consumidor'] ?? null) || !is_array($input['bienContratado'] ?? null) ||
            !is_array($input['detalle'] ?? null)) {
            respond(422, ['error' => 'Los datos del reclamo no son válidos.']);
        }
        $consumer = $input['consumidor'];
        $email = strtolower(trim((string) ($consumer['email'] ?? '')));
        if (trim((string) ($consumer['nombres'] ?? '')) === '' ||
            !filter_var($email, FILTER_VALIDATE_EMAIL) ||
            trim((string) ($consumer['numeroDocumento'] ?? '')) === '' ||
            trim((string) ($input['detalle']['motivo'] ?? '')) === '' ||
            trim((string) ($input['detalle']['pedido'] ?? '')) === '') {
            respond(422, ['error' => 'Completa los datos obligatorios del reclamo.']);
        }

        $pdo->beginTransaction();
        $ownerId = getMasterOwnerId($pdo, true);
        $reclamations = readNamespaceData($pdo, $ownerId, 'reclamations', true) ?: [];
        if (!is_array($reclamations)) {
            $reclamations = [];
        }
        $correlativo = max(0, ...array_map(static fn($item) => (int) ($item['correlativo'] ?? 0), $reclamations)) + 1;
        $now = new DateTimeImmutable('now', new DateTimeZone('America/Lima'));
        $reclamation = $input;
        $reclamation['id'] = 'HR-' . $now->format('Y') . '-' . str_pad((string) $correlativo, 4, '0', STR_PAD_LEFT);
        $reclamation['correlativo'] = $correlativo;
        $reclamation['fecha'] = $now->format('Y-m-d');
        $reclamation['hora'] = $now->format('H:i');
        $reclamation['estado'] = 'pendiente';
        $reclamation['consumidor']['email'] = $email;
        $reclamation['respuestaProveedor'] = null;
        array_unshift($reclamations, $reclamation);
        writeNamespaceData($pdo, $ownerId, 'reclamations', $reclamations);
        $pdo->commit();
        respond(201, ['reclamation' => $reclamation]);
    }

    respond(404, ['error' => 'Ruta API no encontrada.']);
}

function bootstrapDatabaseAndMaster(PDO $pdo, string $name, string $email, string $password): void
{
    ensureSchema($pdo);
    $name = trim($name);
    $email = strtolower(trim($email));
    if ($email !== 'vladimiryt18@gmail.com' || strlen($password) < 12) {
        throw new RuntimeException('Use the master admin email and a password of at least 12 characters.');
    }
    $findAccount = $pdo->prepare('SELECT id FROM app_users WHERE email_lookup = ? LIMIT 1');
    $findAccount->execute([emailLookup($email)]);
    if (!$findAccount->fetchColumn()) {
        [$nameNonce, $nameCipher] = encryptData($name);
        [$emailNonce, $emailCipher] = encryptData($email);
        $statement = $pdo->prepare(
            "INSERT INTO app_users (name_nonce, name_cipher, email_nonce, email_cipher, email_lookup, password_hash, role)
             VALUES (?, ?, ?, ?, ?, ?, 'admin_master')"
        );
        $statement->execute([
            $nameNonce, $nameCipher, $emailNonce, $emailCipher, emailLookup($email),
            password_hash($password, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT),
        ]);
    }

    foreach ([
        ['Admin Sede Lima Centro', 'admin.lima@platino.pe', 'lima-centro'],
        ['Admin Sede Miraflores', 'admin.miraflores@platino.pe', 'miraflores'],
    ] as [$branchName, $branchEmail, $branchSede]) {
        $findAccount->execute([emailLookup($branchEmail)]);
        if ($findAccount->fetchColumn()) {
            continue;
        }
        [$branchNameNonce, $branchNameCipher] = encryptData($branchName);
        [$branchEmailNonce, $branchEmailCipher] = encryptData($branchEmail);
        $randomPassword = bin2hex(random_bytes(32));
        $statement = $pdo->prepare(
            "INSERT INTO app_users (name_nonce, name_cipher, email_nonce, email_cipher, email_lookup, password_hash, role, sede_id)
             VALUES (?, ?, ?, ?, ?, ?, 'admin_sede', ?)"
        );
        $statement->execute([
            $branchNameNonce, $branchNameCipher, $branchEmailNonce, $branchEmailCipher,
            emailLookup($branchEmail),
            password_hash($randomPassword, defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT),
            $branchSede,
        ]);
    }
}

function autoBootstrapIfNeeded(PDO $pdo): void
{
    try {
        $check = $pdo->prepare("SELECT id FROM app_users WHERE role = 'admin_master' AND email_lookup = ? LIMIT 1");
        $check->execute([emailLookup('vladimiryt18@gmail.com')]);
        if ($check->fetchColumn()) {
            return;
        }
    } catch (Throwable) {
        // Table app_users does not exist yet; proceed with bootstrap
    }

    try {
        $name = requiredEnv('PLATINO_ADMIN_NAME');
    } catch (Throwable) {
        $name = 'Vladimir';
    }
    try {
        $email = requiredEnv('PLATINO_ADMIN_EMAIL');
    } catch (Throwable) {
        $email = 'vladimiryt18@gmail.com';
    }
    $password = requiredEnv('PLATINO_ADMIN_PASSWORD');
    bootstrapDatabaseAndMaster($pdo, $name, $email, $password);
}

if (PHP_SAPI === 'cli') {
    if (($argv[1] ?? '') !== 'bootstrap-admin') {
        fwrite(STDERR, "Usage: php api/index.php bootstrap-admin\n");
        exit(2);
    }
    try {
        $pdo = database();
        bootstrapDatabaseAndMaster(
            $pdo,
            requiredEnv('PLATINO_ADMIN_NAME'),
            requiredEnv('PLATINO_ADMIN_EMAIL'),
            requiredEnv('PLATINO_ADMIN_PASSWORD')
        );
        fwrite(STDOUT, "Master and branch admin accounts are initialized. Reset branch passwords from the master account.\n");
    } catch (Throwable $error) {
        error_log((string) $error);
        fwrite(STDERR, "Unable to initialize the master admin account.\n");
        exit(1);
    }
    exit(0);
}

try {
    if (($_SERVER['HTTPS'] ?? '') === '' && ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') !== 'https') {
        respond(400, ['error' => 'La API requiere HTTPS.']);
    }
    $pdo = database();
    autoBootstrapIfNeeded($pdo);
    route($pdo);
} catch (Throwable $error) {
    error_log((string) $error);
    respond(500, ['error' => 'Error interno del servidor.']);
}
