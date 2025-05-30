import { useState, useRef, useMemo } from "react";
import reiniciarIcono from "./assets/reiniciar.png";
import axios from "axios";
import "./SubirCalif.css";
import { Watch } from 'react-loader-spinner';
import { Button } from 'primereact/button'; // asegúrate que ya esté arriba
import { Toast } from 'primereact/toast';


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
            mostrarToast("Archivo requerido", "Selecciona un archivo Excel primero.", "warn");
            return;
        }

        const formData = new FormData();
        formData.append("file", archivo);
        setCargando(true);

        try {
            // 1️ Subir archivo
            const response = await axios.post("http://localhost:5099/api/calificaciones/subirCalificaciones", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            mostrarToast("Carga exitosa", response.data.mensaje, "success");

            // 2️ Obtener resumen ya procesado desde el backend
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

            mostrarToast("Error al subir", mensajeError, "error");
        } finally {
            setCargando(false);
        }
    };


    const handleReset = () => {
        setDatos([]);
        mostrarToast("Reiniciado", "Tabla de calificaciones vaciada", "info");
    };

    const toast = useRef(null);

    const mostrarToast = (summary, detail, severity = "info") => {
        toast.current.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };



    return (
        <>
            <Toast ref={toast} />
            {cargando && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999
                }}>
                    <Watch
                        visible={true}
                        height="100"
                        width="100"
                        radius="48"
                        color="#fcac01" // Color del spinner
                        ariaLabel="watch-loading"
                    />
                    <p style={{ color: "white", marginTop: 10, fontSize: "18px" }}>
                        Cargando calificaciones...
                    </p>
                </div>
            )}
            <div className="contenedor-subir">
                <div className="caja-subir">
                    <h2 className="titulo-subir">📁 Subir Calificaciones</h2>

                    <div className="contenedor-superior">
                        <div className="contenedor-archivo">
                            <Button
                                label="Elegir Archivo"
                                icon="pi pi-folder-open"
                                iconPos="left"
                                outlined
                                onClick={() => fileInputRef.current.click()}
                                className="boton-elegir-prime"
                            />
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
                            <button className="boton-reiniciar" onClick={handleReset}
                                title="Reiniciar tabla de calificaciones"
                                aria-label="Reiniciar tabla de calificaciones"
                            >
                                <img src={reiniciarIcono} alt="Reiniciar" className="icono-reiniciar" />
                            </button>
                            <Button
                                label={cargando ? "Cargando..." : "Cargar Datos"}
                                icon="pi pi-upload"
                                iconPos="left"
                                onClick={handleUpload}
                                loading={cargando}
                                disabled={cargando || !archivo}
                                severity="primary"
                                className="boton-subir-prime"
                            />
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
        </>
    );
};

export default SubirCalif;
