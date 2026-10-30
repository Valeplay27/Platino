# Platino PHP API

This API is intended to run on the same HTTPS origin as the Vite site on SiteGround.
It requires PHP 8.2+, `pdo_mysql`, and OpenSSL with AES-256-GCM support. Database
credentials and encryption keys must be configured as server environment variables;
never put them in React/Vite variables or commit them to the repository.

## Required server environment

- `PLATINO_DB_HOST`
- `PLATINO_DB_NAME`
- `PLATINO_DB_USER`
- `PLATINO_DB_PASSWORD`
- `PLATINO_APP_ORIGIN` (for example `https://www.example.com`)
- `PLATINO_JWT_SECRET` (base64-encoded random 32-byte key)
- `PLATINO_DATA_KEY` (a different base64-encoded random 32-byte key)

Generate each key independently with a cryptographically secure random-number
generator. Keep these values in SiteGround's server-side configuration, not in
files served by the website.

## Initialize the database and master account

Run once from the project directory using the same environment variables and a
MySQL account allowed to create tables:

```text
php api/index.php bootstrap-admin
```

Also provide `PLATINO_ADMIN_NAME`, `PLATINO_ADMIN_EMAIL` (must be
`vladimiryt18@gmail.com`) and `PLATINO_ADMIN_PASSWORD` for this one-time command.
The password must be at least 12 characters. The API stores only a PHP Argon2id
password hash. The administrator name and email are encrypted in MySQL; email
lookup uses a keyed HMAC.

After creating the master account, remove `PLATINO_ADMIN_PASSWORD` from the
environment. The application cannot display or retrieve stored passwords.

## Security behavior

- Sessions use an encrypted JWE compact token in an `HttpOnly`, `Secure`,
  `SameSite=Strict` cookie. JavaScript cannot read the cookie; the API does not
  return tokens or password hashes.
- Passwords are one-way hashed with Argon2id; they are not JWTs and cannot be
  decrypted.
- Persisted application JSON is encrypted with AES-256-GCM before insertion in
  `app_data`.
- Every request requires HTTPS. Mutating requests must come from the configured
  application origin.
- Database privileges should be limited to the application's dedicated schema.

## API routes

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `POST /api/auth/admin/password` (master administrator only)
- `GET|PUT|DELETE /api/data?namespace=<name>` (encrypted namespaces, authenticated writes)
- `POST /api/public/appointments` (validated booking; public reads redact customer details)
- `POST /api/public/reclamations` (append-only public complaint submission)
- `POST /api/public/orders` (authenticated customer's append-only order submission)
- `POST /api/migration/import` (one-time, master-only migration from known legacy browser keys)

The React application reads and writes app data through the API. In-memory cache
is used only to support existing synchronous service interfaces; it is not browser
persistence. The one-time migration sends legacy app records to the API over HTTPS,
re-hashes eligible legacy account passwords on the server, and removes only keys
the server confirms it imported. Obsolete browser-only session/recovery/password
keys are discarded after a successful import and are never uploaded.

The bootstrap command creates Vladimir's master account and the two branch-admin
accounts. Branch accounts receive random, undisclosed initial passwords; Vladimir
must set their usable passwords through the master-admin panel.

The old `database/schema.sql` and SQL dump files are not the schema for this API.
The bootstrap command creates the `app_*` tables in MySQL. Do not import the old
demo dump into the API database.

## Deployment and validation notes

Deploy the contents of `api/` under the same HTTPS origin as the built frontend.
Confirm Apache honors `api/.htaccess`, then run the bootstrap command after setting
the server environment variables. Do not publish the API until bootstrap and
HTTPS are verified. No DB credentials or encryption keys belong in the Vite build.

The app-data API currently stores encrypted JSON in one record per namespace.
Keep each namespace under 2 MB and the complete request under 8 MB; large media
should be stored as server-side files with a future upload endpoint rather than
expanding these limits indiscriminately.

The frontend build/linter can be run with `npm run build` and `npm run lint`.
PHP syntax and MySQL end-to-end checks must be run on the SiteGround PHP/MySQL
environment (PHP is not installed in the development workspace).
