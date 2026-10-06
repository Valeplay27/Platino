import { useState } from "react";
import { Link } from "react-router-dom";
import { PROVEEDOR_INFO, createReclamacion } from "../services/reclamacionesService";

export default function LibroReclamaciones() {
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [tipo, setTipo] = useState("reclamo"); // 'reclamo' | 'queja'
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [nombres, setNombres] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("Lima");
  const [provincia, setProvincia] = useState("Lima");
  const [distrito, setDistrito] = useState("Miraflores");

  const [esMenorDeEdad, setEsMenorDeEdad] = useState(false);
  const [apoderadoNombres, setApoderadoNombres] = useState("");
  const [apoderadoTipoDoc, setApoderadoTipoDoc] = useState("DNI");
  const [apoderadoNumDoc, setApoderadoNumDoc] = useState("");
  const [apoderadoTelefono, setApoderadoTelefono] = useState("");

  const [tipoBien, setTipoBien] = useState("producto"); // 'producto' | 'servicio'
  const [montoReclamado, setMontoReclamado] = useState("");
  const [descripcionBien, setDescripcionBien] = useState("");
  const [sedeId, setSedeId] = useState("miraflores");
  const [numeroPedido, setNumeroPedido] = useState("");

  const [motivo, setMotivo] = useState("");
  const [pedido, setPedido] = useState("");
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aceptoTerminos) {
      alert("Debes confirmar la veracidad de la información y aceptar las condiciones legales para registrar tu reclamo.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      tipo,
      tipoDocumento,
      numeroDocumento,
      nombres,
      telefono,
      email,
      direccion,
      departamento,
      provincia,
      distrito,
      esMenorDeEdad,
      apoderadoNombres,
      apoderadoTipoDoc,
      apoderadoNumDoc,
      apoderadoTelefono,
      tipoBien,
      montoReclamado,
      descripcionBien,
      sedeId,
      numeroPedido,
      motivo,
      pedido,
    };

    setTimeout(() => {
      const recorded = createReclamacion(payload);
      setSubmittedData(recorded);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setSubmittedData(null);
    setMotivo("");
    setPedido("");
    setMontoReclamado("");
    setDescripcionBien("");
    setNumeroPedido("");
    setAceptoTerminos(false);
  };

  return (
    <div className="libro-reclamaciones-page" style={{ background: "#f8faf9", minHeight: "90vh", padding: "40px 20px 90px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <Link to="/" style={{ color: "#137748", textDecoration: "none", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <i className="bi bi-house-door"></i> Inicio
          </Link>
          <span style={{ color: "#9aa7a0" }}>/</span>
          <span style={{ color: "#5d6d65", fontWeight: "500" }}>Libro de Reclamaciones</span>
        </div>

        {/* Pantalla de Confirmación de Hoja Registrada */}
        {submittedData ? (
          <div style={{ background: "white", borderRadius: "14px", border: "1.5px solid #c2e2cf", padding: "36px 32px", boxShadow: "0 10px 30px rgba(15, 42, 36, 0.06)" }}>
            <div style={{ textAlign: "center", marginBottom: "26px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#e8f6ed", color: "#137748", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "14px" }}>
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0f2a24", margin: "0 0 6px" }}>
                Hoja de Reclamación Registrada
              </h2>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#137748", letterSpacing: "0.05em", background: "#f0fbf5", padding: "6px 16px", borderRadius: "20px", display: "inline-block", border: "1px solid #bce6cf" }}>
                N° {submittedData.id}
              </span>
              <p style={{ color: "#54685f", fontSize: "14px", margin: "14px auto 0", maxWidth: "620px" }}>
                Hemos registrado tu {submittedData.tipo.toUpperCase()} conforme a las directivas de INDECOPI (Ley N° 29571). Se ha enviado una constancia electrónica al correo <strong>{submittedData.consumidor.email}</strong>.
              </p>
            </div>

            {/* Ficha Resumen Oficial */}
            <div style={{ background: "#fcfdfc", border: "1px solid #e1ebe5", borderRadius: "10px", padding: "20px", marginBottom: "26px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", fontSize: "13.5px" }}>
                <div>
                  <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block" }}>Fecha y Hora</span>
                  <strong style={{ color: "#112820" }}>{submittedData.fecha} a las {submittedData.hora}</strong>
                </div>
                <div>
                  <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block" }}>Tipo de Registro</span>
                  <span style={{ fontWeight: "700", textTransform: "uppercase", color: submittedData.tipo === "reclamo" ? "#b45309" : "#1e40af" }}>
                    {submittedData.tipo}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block" }}>Consumidor</span>
                  <strong style={{ color: "#112820" }}>{submittedData.consumidor.nombres}</strong>
                </div>
                <div>
                  <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block" }}>Documento</span>
                  <strong style={{ color: "#112820" }}>{submittedData.consumidor.tipoDocumento}: {submittedData.consumidor.numeroDocumento}</strong>
                </div>
                <div>
                  <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block" }}>Sede Involucrada</span>
                  <strong style={{ color: "#112820" }}>{submittedData.bienContratado.sedeNombre}</strong>
                </div>
                <div>
                  <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block" }}>Plazo Legal de Respuesta</span>
                  <strong style={{ color: "#137748" }}>Máximo 15 días hábiles</strong>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e7efe9", marginTop: "16px", paddingTop: "14px" }}>
                <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Detalle del {submittedData.tipo.toUpperCase()}
                </span>
                <p style={{ margin: "0 0 10px", fontSize: "13.5px", color: "#22352c", background: "white", padding: "10px 12px", borderRadius: "6px", border: "1px solid #edf2ee" }}>
                  {submittedData.detalle.motivo}
                </p>

                <span style={{ color: "#778a80", fontSize: "11.5px", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Pedido Concreto del Consumidor
                </span>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#22352c", background: "white", padding: "10px 12px", borderRadius: "6px", border: "1px solid #edf2ee" }}>
                  {submittedData.detalle.pedido}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handlePrint}
                className="button"
                style={{ background: "#0f2a24", color: "white", padding: "12px 24px", fontSize: "14px" }}
              >
                <i className="bi bi-printer" style={{ marginRight: "6px" }}></i> Imprimir / Guardar en PDF
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{ background: "#f2f6f4", color: "#112820", border: "1px solid #c9dbd1", padding: "12px 22px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                Registrar Otra Reclamación
              </button>
              <Link
                to="/"
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", color: "#137748", padding: "12px 18px", fontSize: "14px", fontWeight: "700" }}
              >
                Volver a la Tienda
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario Oficial del Libro de Reclamaciones */
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e1ebe5", padding: "34px 30px", boxShadow: "0 4px 20px rgba(15, 42, 36, 0.04)" }}>
            
            {/* Cabecera Oficial INDECOPI */}
            <div style={{ borderBottom: "1.5px solid #edf2ee", paddingBottom: "22px", marginBottom: "26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", color: "#113B3A", background: "#F2F9F2", border: "1px solid #d5e5d5", padding: "4px 10px", borderRadius: "12px", display: "inline-block", marginBottom: "6px" }}>
                    Conforme al D.S. N° 011-2011-PCM / Ley N° 29571
                  </span>
                  <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#113B3A", margin: 0 }}>
                    Libro de Reclamaciones Virtual
                  </h1>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FDF9F2", border: "1.5px solid #C6AC7F", padding: "8px 14px", borderRadius: "8px" }}>
                  <i className="bi bi-book-half" style={{ color: "#C6AC7F", fontSize: "20px" }}></i>
                  <div>
                    <span style={{ fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#8c6e3d", display: "block" }}>Hoja de Reclamación</span>
                    <strong style={{ fontSize: "13px", color: "#113B3A" }}>Platino Joyería Perú S.A.C.</strong>
                  </div>
                </div>
              </div>

              {/* Datos de la Empresa Proveedora */}
              <div style={{ background: "#F2F9F2", border: "1px solid #d5e5d5", borderRadius: "8px", padding: "12px 16px", fontSize: "12.5px", color: "#113B3A", lineHeight: "1.5" }}>
                <div><strong style={{ color: "#C6AC7F" }}>Razón Social:</strong> {PROVEEDOR_INFO.razonSocial} | <strong style={{ color: "#C6AC7F" }}>RUC:</strong> {PROVEEDOR_INFO.ruc}</div>
                <div><strong>Sede Miraflores:</strong> Av. José Larco 345, Miraflores, Lima | <strong>Sede Lima Centro:</strong> Jr. de la Unión 446, Lima</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Sección 1: Datos del Consumidor Reclamante */}
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 28px" }}>
                <legend style={{ fontSize: "15px", fontWeight: "700", color: "#113B3A", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", padding: 0 }}>
                  <span style={{ background: "#113B3A", color: "white", width: "22px", height: "22px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>1</span>
                  Identificación del Consumidor Reclamante
                </legend>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Nombres y Apellidos *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Camila Mendoza Paredes"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "8px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                        Doc. *
                      </label>
                      <select
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        style={{ width: "100%", padding: "10px 6px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">C.E.</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="RUC">RUC</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                        N° de Documento *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. 72849102"
                        value={numeroDocumento}
                        onChange={(e) => setNumeroDocumento(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Teléfono Celular / WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="Ej. 912 345 678"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Correo Electrónico * (Se enviará copia digital)
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Domicilio / Dirección Completa *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Av. / Calle, número, urbanización o departamento"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Departamento *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Lima"
                      value={departamento}
                      onChange={(e) => setDepartamento(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Provincia *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Lima"
                      value={provincia}
                      onChange={(e) => setProvincia(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Distrito *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Miraflores / Cercado..."
                      value={distrito}
                      onChange={(e) => setDistrito(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Casilla de Menor de Edad */}
                <div style={{ background: "#fbfcfc", border: "1px dashed #d0dcd4", borderRadius: "8px", padding: "12px 14px", marginTop: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#1a382d", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={esMenorDeEdad}
                      onChange={(e) => setEsMenorDeEdad(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    El consumidor reclamante es menor de edad (identificación de padre, madre o tutor)
                  </label>

                  {esMenorDeEdad && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e3ede7" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#4f6358", marginBottom: "2px" }}>Nombres del Padre/Madre/Tutor *</label>
                        <input
                          required={esMenorDeEdad}
                          type="text"
                          placeholder="Nombre del apoderado"
                          value={apoderadoNombres}
                          onChange={(e) => setApoderadoNombres(e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", border: "1px solid #cad9cf", borderRadius: "5px", fontSize: "13px", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "6px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#4f6358", marginBottom: "2px" }}>Doc.</label>
                          <select
                            value={apoderadoTipoDoc}
                            onChange={(e) => setApoderadoTipoDoc(e.target.value)}
                            style={{ width: "100%", padding: "8px 4px", border: "1px solid #cad9cf", borderRadius: "5px", fontSize: "12.5px", boxSizing: "border-box" }}
                          >
                            <option value="DNI">DNI</option>
                            <option value="CE">C.E.</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#4f6358", marginBottom: "2px" }}>N° Documento *</label>
                          <input
                            required={esMenorDeEdad}
                            type="text"
                            placeholder="N° Doc apoderado"
                            value={apoderadoNumDoc}
                            onChange={(e) => setApoderadoNumDoc(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", border: "1px solid #cad9cf", borderRadius: "5px", fontSize: "13px", boxSizing: "border-box" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Sección 2: Identificación del Bien Contratado */}
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 28px" }}>
                <legend style={{ fontSize: "15px", fontWeight: "700", color: "#0f2a24", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", padding: 0 }}>
                  <span style={{ background: "#0f2a24", color: "white", width: "22px", height: "22px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>2</span>
                  Identificación del Bien Contratado
                </legend>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "6px" }}>
                      Tipo de Bien *
                    </label>
                    <div style={{ display: "flex", gap: "14px", marginTop: "4px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", cursor: "pointer", fontWeight: "500" }}>
                        <input
                          type="radio"
                          name="tipoBien"
                          value="producto"
                          checked={tipoBien === "producto"}
                          onChange={() => setTipoBien("producto")}
                        />
                        Producto (Joya, aro, sortija, collar...)
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", cursor: "pointer", fontWeight: "500" }}>
                        <input
                          type="radio"
                          name="tipoBien"
                          value="servicio"
                          checked={tipoBien === "servicio"}
                          onChange={() => setTipoBien("servicio")}
                        />
                        Servicio (Taller, grabado, atención...)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Sede / Canal de Compra *
                    </label>
                    <select
                      value={sedeId}
                      onChange={(e) => setSedeId(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    >
                      <option value="miraflores">Sede Miraflores (Av. José Larco 345)</option>
                      <option value="lima-centro">Sede Lima Centro (Jr. de la Unión 446)</option>
                      <option value="virtual">Tienda Virtual / Web Platino</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      Monto Reclamado en Soles (S/.)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 2850.00"
                      value={montoReclamado}
                      onChange={(e) => setMontoReclamado(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                      N° de Pedido / Boleta / Comprobante (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. PLT-2026-8941 o B001-0941"
                      value={numeroPedido}
                      onChange={(e) => setNumeroPedido(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                    Descripción del Producto o Servicio Contratado *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Anillo Solitario Oro Blanco 18K / Servicio de grabado de aros de boda"
                    value={descripcionBien}
                    onChange={(e) => setDescripcionBien(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", boxSizing: "border-box" }}
                  />
                </div>
              </fieldset>

              {/* Sección 3: Detalle de la Reclamación */}
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 28px" }}>
                <legend style={{ fontSize: "15px", fontWeight: "700", color: "#0f2a24", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", padding: 0 }}>
                  <span style={{ background: "#0f2a24", color: "white", width: "22px", height: "22px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>3</span>
                  Detalle de la Reclamación
                </legend>

                {/* Tipo de Reclamación: RECLAMO vs QUEJA */}
                <div style={{ background: "#fcfaf6", border: "1.5px solid #ecd8ab", borderRadius: "10px", padding: "16px 18px", marginBottom: "18px" }}>
                  <span style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#78350f", marginBottom: "8px" }}>
                    Selecciona el tipo de disconformidad (Definición legal INDECOPI):
                  </span>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label style={{
                      border: tipo === "reclamo" ? "2px solid #b45309" : "1px solid #d9ccb6",
                      background: tipo === "reclamo" ? "#fffbeb" : "white",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "block",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <input
                          type="radio"
                          name="tipo"
                          value="reclamo"
                          checked={tipo === "reclamo"}
                          onChange={() => setTipo("reclamo")}
                        />
                        <strong style={{ fontSize: "14px", color: "#78350f" }}>RECLAMO</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#78350f", lineHeight: "1.4" }}>
                        Disconformidad relacionada directamente a los productos adquiridos o servicios brindados por la joyería.
                      </p>
                    </label>

                    <label style={{
                      border: tipo === "queja" ? "2px solid #1d4ed8" : "1px solid #d9ccb6",
                      background: tipo === "queja" ? "#eff6ff" : "white",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "block",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <input
                          type="radio"
                          name="tipo"
                          value="queja"
                          checked={tipo === "queja"}
                          onChange={() => setTipo("queja")}
                        />
                        <strong style={{ fontSize: "14px", color: "#1e40af" }}>QUEJA</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#1e3a8a", lineHeight: "1.4" }}>
                        Malestar o descontento respecto a la atención al cliente, trato o demora (no ligada al producto físico en sí).
                      </p>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                    Detalle del {tipo === "reclamo" ? "Reclamo" : "Queja"} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={`Describe con claridad los hechos ocurridos respecto a tu ${tipo}...`}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", fontFamily: "var(--font-sans)", boxSizing: "border-box", resize: "vertical" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "600", color: "#22382f", marginBottom: "4px" }}>
                    Pedido Concreto del Consumidor * (¿Qué solución solicita?)
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Indica qué solución o acción concreta esperas por parte de Platino Joyería Perú..."
                    value={pedido}
                    onChange={(e) => setPedido(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #d5e0d9", borderRadius: "6px", fontSize: "13.5px", fontFamily: "var(--font-sans)", boxSizing: "border-box", resize: "vertical" }}
                  />
                </div>
              </fieldset>

              {/* Declaración Jurada y Plazos Legales */}
              <div style={{ background: "#f2f7f4", border: "1px solid #d2e4d9", borderRadius: "8px", padding: "14px 16px", marginBottom: "24px", fontSize: "12.5px", color: "#364d41", lineHeight: "1.5" }}>
                <p style={{ margin: "0 0 10px" }}>
                  <strong>Aviso Legal INDECOPI:</strong> La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá dar respuesta al reclamo o queja en un plazo no mayor de <strong>quince (15) días hábiles</strong> improrrogables conforme a la Ley N° 29571.
                </p>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontWeight: "600", color: "#0f2a24", cursor: "pointer" }}>
                  <input
                    required
                    type="checkbox"
                    checked={aceptoTerminos}
                    onChange={(e) => setAceptoTerminos(e.target.checked)}
                    style={{ width: "16px", height: "16px", marginTop: "2px", cursor: "pointer" }}
                  />
                  <span>
                    Declaro bajo juramento que los datos consignados en la presente Hoja de Reclamación son verdaderos y autorizo a Platino Joyería Perú S.A.C. a remitir la respuesta a mi correo electrónico consignado.
                  </span>
                </label>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="button"
                style={{ width: "100%", padding: "14px 20px", fontSize: "15px", background: "#113B3A", color: "white", borderRadius: "8px", fontWeight: "700" }}
              >
                {isSubmitting ? "Registrando en libro digital..." : "Enviar Hoja de Reclamación"}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
