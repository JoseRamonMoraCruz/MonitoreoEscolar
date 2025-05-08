import { useState, useRef, useMemo } from "react";
import reiniciarIcono from "./assets/reiniciar.png";
import axios from "axios";
import "./SubirCalif.css";

const SubirCalif = () => {
    const [archivo, setArchivo] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState("");
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const fileInputRef = useRef(null);

    // Obtener materias únicas de los datos cargados
    const materiasUnicas = useMemo(() => {
        const materias = new Set();
        datos.forEach(alumno => {
            Object.keys(alumno).forEach(key => {
                if (!["alumno", "grupo", "parcialUnidad", "periodo", "tipo", "firmado", "asistenciasTotal"].includes(key)) {
                    materias.add(key);
                }
            });
        });
        return Array.from(materias);
    }, [datos]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setArchivo(file);
            setNombreArchivo(file.name);
        }
    };

    const handleUpload = async () => {
        if (!archivo) {
            alert("Selecciona un archivo Excel primero.");
            return;
        }

        const formData = new FormData();
        formData.append("file", archivo);
        setCargando(true);

        try {
            // 1️⃣ Subir archivo
            const response = await axios.post("http://localhost:5099/api/calificaciones/subirCalificaciones", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert(` ${response.data.mensaje}`);

            // 2️⃣ Obtener resumen ya procesado desde el backend
            const resumen = await axios.get("http://localhost:5099/api/calificaciones/obtenerResumenAgrupado");

            setDatos(resumen.data);

            // 3️ Limpiar archivo y formulario
            setArchivo(null);
            setNombreArchivo("");
            fileInputRef.current.value = null;
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error.response ? error.response.data : error.message);

            const mensajeError = error.response?.data && typeof error.response.data === "string"
                ? error.response.data
                : "❌ Error al subir el archivo. Intenta nuevamente.";

            alert(mensajeError);
        } finally {
            setCargando(false);
        }
    };


    const handleReset = () => {
        setDatos([]);
    };

    return (
        <div className="contenedor-subir">
            <div className="caja-subir">
                <h2 className="titulo-subir">📁 Subir Calificaciones</h2>

                <div className="contenedor-superior">
                    <div className="contenedor-archivo">
                        <button className="boton-seleccionar" onClick={() => fileInputRef.current.click()}>
                            📄 Elegir Archivo
                        </button>
                        <span className="nombre-archivo">{nombreArchivo || "No se ha seleccionado archivo"}</span>
                        <input
                            type="file"
                            accept=".xlsx"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileSelect}
                        />
                    </div>

                    <div className="contenedor-botones">
                        <button className="boton-reiniciar" onClick={handleReset}>
                            <img src={reiniciarIcono} alt="Reiniciar" className="icono-reiniciar" />
                        </button>
                        <button className="boton-subir" onClick={handleUpload} disabled={cargando || !archivo}>
                            {cargando ? "📥 Cargando..." : "📥 Cargar Datos"}
                        </button>
                    </div>
                </div>

                <div className="contenedor-tabla">
                    <h3>📊 Calificaciones Cargadas</h3>
                    <table className="tabla-subir">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Grupo</th>
                                <th>Parcial / Unidad</th>
                                <th>Periodo</th>
                                <th>Tipo Acreditación</th>
                                <th>¿Firmado?</th>
                                <th>Total Asistencias</th>
                                {materiasUnicas.map((materia, index) => (
                                    <th key={index}>{materia}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {datos.length > 0 ? (
                                datos.map((alumno, index) => (
                                    <tr key={index}>
                                        <td>{alumno.alumno}</td>
                                        <td>{alumno.grupo}</td>
                                        <td>{alumno.parcialUnidad}</td>
                                        <td>{alumno.periodo}</td>
                                        <td>{alumno.tipo}</td>
                                        <td>{alumno.firmado ? "SI FIRMADO" : "NO FIRMADO"}</td>
                                        <td>{alumno.asistenciasTotal}</td>
                                        {materiasUnicas.map((materia, idx) => (
                                            <td key={idx}>{alumno[materia] ?? "N/A"}</td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7 + materiasUnicas.length}>No hay datos cargados aún.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubirCalif;
