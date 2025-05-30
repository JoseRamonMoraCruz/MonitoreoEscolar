import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import "./AgregarAlumno.css";
import agregarIcon from "./assets/agregar-alumno.png";

const AgregarAlumno = () => {
    // 1) Datos del alumno
    const [alumno, setAlumno] = useState({
        Nombre: "",
        ApellidoPaterno: "",
        ApellidoMaterno: "",
        Grupo: "",
        Grado: "",
        letra: "",
        Domicilio: "",
        CURP: "",
        NumeroControl: "",
        Carrera: "",
        Plantel: "",
        Turno: "",
        Generacion: "",
        Ciclo: "",
        TutorId: null,
    });

    // 2) Autocomplete de tutores
    const [tutorOptions, setTutorOptions] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);

    // 3) Estados para QR
    const [qrCompositeUrl, setQrCompositeUrl] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [nombreArchivoQR, setNombreArchivoQR] = useState("QR_alumno");
    const [nombreCompletoQR, setNombreCompletoQR] = useState("");

    // Manejadores de inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAlumno((a) => ({
            ...a,
            [name]: name === "CURP" ? value.toUpperCase() : value,
        }));
    };

    // Grado / letra -> arma Grupo
    const handleChangeGrado = (e) => {
        const g = e.target.value;
        setAlumno((a) => ({
            ...a,
            Grado: g,
            Grupo: g && a.letra ? `${g}${a.letra}` : "",
        }));
    };
    const handleChangeLetra = (e) => {
        const l = e.target.value;
        setAlumno((a) => ({
            ...a,
            letra: l,
            Grupo: a.Grado && l ? `${a.Grado}${l}` : "",
        }));
    };

    // Autocomplete padres
    const fetchTutorOptions = async (input) => {
        if (!input || input.length < 2) return setTutorOptions([]);
        try {
            const { data } = await axios.get(
                `/api/usuarios/autocompletePadres?termino=${input}`
            );
            setTutorOptions(
                data.map((p) => ({
                    value: p.id_Usuario,
                    label: `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno} – ${p.correo}`,
                }))
            );
        } catch (err) {
            console.error(err);
        }
    };
    const handleTutorInputChange = (input, { action }) => {
        if (action === "input-change") fetchTutorOptions(input);
        return input;
    };
    const handleTutorChangeSelect = (opt) => {
        setSelectedTutor(opt);
        setAlumno((a) => ({ ...a, TutorId: opt ? opt.value : null }));
    };

    // Envío del formulario, registro + QR + canvas
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1) validar grupo existe
        try {
            const { data: grupos } = await axios.get("/api/grupos");
            const ok = grupos.find(
                (g) =>
                    g.grado.toString() === alumno.Grado &&
                    g.letra.toUpperCase() === alumno.letra.toUpperCase()
            );
            if (!ok) {
                alert("Crea el grupo antes de registrar.");
                return;
            }
        } catch {
            alert("Error verificando grupos.");
            return;
        }

        // 2) arma nombre completo
        const nombreFull = `${alumno.Nombre} ${alumno.ApellidoPaterno} ${alumno.ApellidoMaterno}`;
        setNombreCompletoQR(nombreFull);
        setNombreArchivoQR(`QR_${nombreFull.replace(/\s+/g, "_")}`);

        // 3) registrar alumno
        try {
            const reg = await axios.post("/api/alumnos/registro", alumno);
            alert(reg.data.mensaje);
            const id = reg.data.alumno.id;

            // 4) obtener blob QR
            const qrResp = await axios.get(`/api/alumnos/qr/${id}`, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(
                new Blob([qrResp.data], { type: "image/png" })
            );

            // 5) componer canvas
            const img = new Image();
            img.onload = () => {
                const pad = 20,
                    th = 30;
                const w = img.width + pad * 2,
                    h = img.height + pad * 2 + th;
                const c = document.createElement("canvas");
                c.width = w;
                c.height = h;
                const ctx = c.getContext("2d");
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, pad, pad);
                ctx.fillStyle = "#000";
                ctx.font = "bold 18px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(nombreFull, w / 2, img.height + pad + th * 0.8);
                c.toBlob((b) => {
                    const url2 = URL.createObjectURL(b);
                    setQrCompositeUrl(url2);
                    setShowQrModal(true);
                    setTimeout(() => {
                        setShowQrModal(false);
                        setQrCompositeUrl(null);
                    }, 10000);
                }, "image/png");
            };
            img.src = blobUrl;
        } catch (err) {
            console.error(err);
            alert("Error al registrar.");
        }

        // 6) limpiar form
        setAlumno({
            Nombre: "",
            ApellidoPaterno: "",
            ApellidoMaterno: "",
            Grupo: "",
            Grado: "",
            letra: "",
            Domicilio: "",
            CURP: "",
            NumeroControl: "",
            Carrera: "",
            Plantel: "",
            Turno: "",
            Generacion: "",
            Ciclo: "",
            TutorId: null,
        });
        setSelectedTutor(null);
        setTutorOptions([]);
    };

    return (
        <div className="bootstrap-scope">
            <div className="agregar-alumno-container">
                <div className="agregar-alumno-content">
                    <h2 className="agregar-alumno-title">📑 Registra un Alumno</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <div className="agregar-alumno-group">
                            <label>👨🏻‍🎓 Nombre:</label>
                            <input
                                type="text"
                                name="Nombre"
                                value={alumno.Nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el primer nombre"
                                required
                            />
                        </div>
                        {/* Apellido Paterno */}
                        <div className="agregar-alumno-group">
                            <label>👨🏻‍🎓 Apellido Paterno:</label>
                            <input
                                type="text"
                                name="ApellidoPaterno"
                                value={alumno.ApellidoPaterno}
                                onChange={handleChange}
                                placeholder="Ingrese el apellido paterno"
                                required
                            />
                        </div>
                        {/* Apellido Materno */}
                        <div className="agregar-alumno-group">
                            <label>👨🏻‍🎓 Apellido Materno:</label>
                            <input
                                type="text"
                                name="ApellidoMaterno"
                                value={alumno.ApellidoMaterno}
                                onChange={handleChange}
                                placeholder="Ingrese el apellido materno"
                                required
                            />
                        </div>
                        {/* Grado + Letra */}
                        <div className="agregar-alumno-group-selects">
                            <div>
                                <label>Grado:</label>
                                <select
                                    name="Grado"
                                    value={alumno.Grado}
                                    onChange={handleChangeGrado}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {[1, 2, 3, 4, 5, 6].map((g) => (
                                        <option key={g} value={g}>
                                            {g}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Grupo:</label>
                                <select
                                    name="letra"
                                    value={alumno.letra || ""}
                                    onChange={handleChangeLetra}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {["A", "B", "C", "D", "E", "F", "G"].map((l) => (
                                        <option key={l} value={l}>
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <input type="hidden" name="Grupo" value={alumno.Grupo} />

                        {/* Tutor */}
                        <div className="agregar-alumno-group">
                            <label>👨🏻‍🦰 Seleccionar padre:</label>
                            <Select
                                classNamePrefix="my-select"
                                value={selectedTutor}
                                onChange={handleTutorChangeSelect}
                                onInputChange={handleTutorInputChange}
                                options={tutorOptions}
                                placeholder="Escriba nombre del padre..."
                                noOptionsMessage={() => "No hay coincidencias"}
                            />
                        </div>

                        {/* Domicilio */}
                        <div className="agregar-alumno-group">
                            <label>🏠 Domicilio:</label>
                            <input
                                type="text"
                                name="Domicilio"
                                value={alumno.Domicilio}
                                onChange={handleChange}
                                placeholder="Ingrese domicilio"
                                required
                            />
                        </div>

                        {/* CURP */}
                        <div className="agregar-alumno-group">
                            <label>👤 CURP:</label>
                            <input
                                type="text"
                                name="CURP"
                                value={alumno.CURP}
                                onChange={handleChange}
                                placeholder="CURP del alumno"
                            />
                        </div>

                        {/* Número de Control */}
                        <div className="agregar-alumno-group">
                            <label>🆔 Número de Control:</label>
                            <input
                                type="text"
                                name="NumeroControl"
                                value={alumno.NumeroControl}
                                onChange={handleChange}
                                placeholder="Número de control"
                            />
                        </div>

                        {/* Carrera */}
                        <div className="agregar-alumno-group">
                            <label>📝 Carrera:</label>
                            <select
                                name="Carrera"
                                value={alumno.Carrera}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione una carrera</option>
                                <option value="CIENCIA DE DATOS E INFORMACIÓN">
                                    CIENCIA DE DATOS E INFORMACIÓN
                                </option>
                                <option value="CONSTRUCCIÓN">CONSTRUCCIÓN</option>
                                <option value="CONTABILIDAD">CONTABILIDAD</option>
                                <option value="LABORATORISTA CLÍNICO">
                                    LABORATORISTA CLÍNICO
                                </option>
                                <option value="MANTENIMIENTO AUTOMOTRIZ">
                                    MANTENIMIENTO AUTOMOTRIZ
                                </option>
                                <option value="MECATRÓNICA">MECATRÓNICA</option>
                                <option value="PUERICULTURA">PUERICULTURA</option>
                            </select>
                        </div>

                        {/* Plantel */}
                        <div className="agregar-alumno-group">
                            <label>🏫 Plantel:</label>
                            <input
                                type="text"
                                name="Plantel"
                                value={alumno.Plantel}
                                onChange={handleChange}
                                placeholder="Plantel asignado"
                            />
                        </div>

                        {/* Turno */}
                        <div className="agregar-alumno-group">
                            <label>☀️🌜 Turno:</label>
                            <input
                                type="text"
                                name="Turno"
                                value={alumno.Turno}
                                onChange={handleChange}
                                placeholder="Matutino / Vespertino"
                            />
                        </div>

                        {/* Generación */}
                        <div className="agregar-alumno-group">
                            <label>🔢 Generación:</label>
                            <input
                                type="text"
                                name="Generacion"
                                value={alumno.Generacion}
                                onChange={handleChange}
                                placeholder="Generación"
                            />
                        </div>

                        {/* Ciclo */}
                        <div className="agregar-alumno-group">
                            <label>🔢 Ciclo Escolar:</label>
                            <input
                                type="text"
                                name="Ciclo"
                                value={alumno.Ciclo}
                                onChange={handleChange}
                                placeholder="SEMESTRAL 1 - 2024"
                            />
                        </div>

                        {/* Botón Agregar */}
                        <div className="button-container">
                            <button type="submit" className="agregar-alumno-btn">
                                <img src={agregarIcon} alt="Agregar" className="back-icon" />
                                Agregar Alumno
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de QR */}
            {showQrModal && (
                <div className="modal-qr">
                    <div className="modal-qr-content">
                        <span className="close" onClick={() => setShowQrModal(false)}>
                            ×
                        </span>
                        <h3>Código QR de {nombreCompletoQR}</h3>
                        <img
                            src={qrCompositeUrl}
                            alt="Código QR con nombre"
                            className="qr-image"
                        />
                        <a
                            href={qrCompositeUrl}
                            download={`${nombreArchivoQR}.png`}
                            className="qr-download-btn"
                        >
                            Descargar QR
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgregarAlumno;
