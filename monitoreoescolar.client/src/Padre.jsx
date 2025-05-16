import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Padre.css";

const Padre = () => {
    const [hijos, setHijos] = useState([]);
    const [reportesPorAlumno, setReportesPorAlumno] = useState({});
    const [expandedAlumnoId, setExpandedAlumnoId] = useState(null);
    const [asistenciasPorAlumno, setAsistenciasPorAlumno] = useState({});
    const [fechasPorAlumno, setFechasPorAlumno] = useState({});
    const [rangosPorAlumno, setRangosPorAlumno] = useState({});

    const navigate = useNavigate();

    const [nombrePadre, setNombrePadre] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Carga el nombre del padre y dispara el toast 3s
        const nombre = localStorage.getItem("nombrePadre") || "";
        setNombrePadre(nombre);
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const descargarPDF = async (alumnoId) => {
        try {
            const response = await axios.get(`http://localhost:5099/api/padres/descargar-reporte/${alumnoId}`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Reporte_Alumno_${alumnoId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("❌ Error al descargar el PDF:", error);
            alert("Ocurrió un error al intentar descargar el PDF.");
        }
    };

    useEffect(() => {
        const idPadre = localStorage.getItem("idPadre");

        if (!idPadre) {
            alert("🔒 Debes iniciar sesión.");
            navigate("/");
            return;
        }

        const obtenerHijosConGrupo = async () => {
            try {
                const response = await axios.get(`http://localhost:5099/api/padres/obtener-hijos-con-grupo/${idPadre}`);
                setHijos(response.data);
            } catch (error) {
                console.error("❌ Error al obtener hijos con grupo:", error);
            }
        };

        obtenerHijosConGrupo();
    }, [navigate]);

    // Obtener asistencias por fecha
    const cambiarRangoAsistencia = async (alumnoId, inicio, fin) => {
        setRangosPorAlumno(prev => ({
            ...prev,
            [alumnoId]: { inicio, fin }
        }));

        try {
            const response = await axios.get(`http://localhost:5099/api/padres/obtener-asistencias-alumno/${alumnoId}?fechaInicio=${inicio}&fechaFin=${fin}`);
            setAsistenciasPorAlumno(prev => ({ ...prev, [alumnoId]: response.data }));
        } catch (error) {
            console.error("❌ Error al obtener asistencias por rango:", error);
        }
    };

    const toggleExpand = async (alumnoId) => {
        if (expandedAlumnoId === alumnoId) {
            setExpandedAlumnoId(null);
            return;
        } if (!asistenciasPorAlumno[alumnoId]) {
            try {
                const response = await axios.get(`http://localhost:5099/api/padres/obtener-asistencias-alumno/${alumnoId}`);
                setAsistenciasPorAlumno(prev => ({ ...prev, [alumnoId]: response.data }));
            } catch (error) {
                console.error("❌ Error al obtener asistencias:", error);
            }
        } if (!fechasPorAlumno[alumnoId]) {
            const hoy = new Date().toISOString().split("T")[0];
            setFechasPorAlumno(prev => ({ ...prev, [alumnoId]: hoy }));
        }

        setExpandedAlumnoId(alumnoId);

        // Obtener reportes si aún no están
        if (!reportesPorAlumno[alumnoId]) {
            try {
                const response = await axios.get(`http://localhost:5099/api/padres/obtener-reportes-hijo/${alumnoId}`);
                setReportesPorAlumno((prev) => ({ ...prev, [alumnoId]: response.data }));
            } catch (error) {
                console.error("❌ Error al obtener reportes:", error);
            }
        }

        // Obtener calificaciones si aún no están
        const alumno = hijos.find(h => h.alumnoId === alumnoId);
        if (!alumno?.calificaciones) {
            try {
                const response = await axios.get(`http://localhost:5099/api/padres/obtener-calificaciones-alumno/${alumnoId}`);
                setHijos(prev =>
                    prev.map(h =>
                        h.alumnoId === alumnoId
                            ? { ...h, calificaciones: response.data }
                            : h
                    )
                );
            } catch (error) {
                console.error("❌ Error al obtener calificaciones:", error);
            }
        }
    };

    return (
        <>
            <nav className="menu-bar">
                <ul className="menu-list">
                    <li><Link to="/" className="logout-link">Cerrar Sesión</Link></li>
                </ul>
                {/* Toast de bienvenida para el padre */}
                {showToast && (
                    <div className="welcome-toast">
                        ¡Bienvenido, <strong>{nombrePadre}</strong>!
                    </div>
                )}
            </nav>

            <div className="padre-container">
                {hijos.map((hijo) => (
                    <div key={hijo.alumnoId} className="seccion">
                        <div className="card-alumno" onClick={() => toggleExpand(hijo.alumnoId)}>
                            <div className="nombre">{hijo.nombreCompleto}</div>
                            <div className="grupo">{hijo.grupo}</div>
                        </div>

                        {expandedAlumnoId === hijo.alumnoId && (
                            <div className="contenido-expandido">
                                <h3>📘 Calificaciones</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Materia</th>
                                            <th>Calificación</th>
                                            <th>Parcial</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hijo.calificaciones?.length > 0 ? (
                                            hijo.calificaciones.map((calif, idx) => (
                                                <tr key={idx}>
                                                    <td>{calif.materia}</td>
                                                    <td>{calif.calificacion}</td>
                                                    <td>{calif.parcial}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">Sin calificaciones registradas.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div style={{ margin: "10px 0" }}>
                                    <label style={{ display: "block", marginBottom: "8px" }}>
                                        Filtrar asistencias por rango:
                                    </label>

                                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                                        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                            <span style={{ marginBottom: "4px" }}>Fecha Inicio:</span>
                                            <input
                                                type="date"
                                                value={rangosPorAlumno[hijo.alumnoId]?.inicio || ""}
                                                onChange={(e) => {
                                                    const nuevaInicio = e.target.value;
                                                    const fin = rangosPorAlumno[hijo.alumnoId]?.fin || nuevaInicio;
                                                    cambiarRangoAsistencia(hijo.alumnoId, nuevaInicio, fin);
                                                }}
                                                style={{ padding: "5px", width: "100%" }}
                                            />
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                            <span style={{ marginBottom: "4px" }}>Fecha Fin:</span>
                                            <input
                                                type="date"
                                                value={rangosPorAlumno[hijo.alumnoId]?.fin || ""}
                                                onChange={(e) => {
                                                    const nuevaFin = e.target.value;
                                                    const inicio = rangosPorAlumno[hijo.alumnoId]?.inicio || nuevaFin;
                                                    cambiarRangoAsistencia(hijo.alumnoId, inicio, nuevaFin);
                                                }}
                                                style={{ padding: "5px", width: "100%" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <h3> Asistencias</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Hora de entrada</th>
                                            <th>Hora de salida</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asistenciasPorAlumno[hijo.alumnoId]?.length > 0 ? (
                                            asistenciasPorAlumno[hijo.alumnoId].map((a, idx) => (
                                                <tr key={idx}>
                                                    <td>{a.fecha}</td>
                                                    <td>{a.horaEntrada}</td>
                                                    <td>{a.horaSalida}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3">Sin asistencias registradas.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <h3>⚠️ Reporte de Mala Conducta</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Situación del Reporte</th>
                                            <th>Fecha del Reporte</th>
                                            <th>Profesor Responsable de Poner el Reporte</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportesPorAlumno[hijo.alumnoId]?.length > 0 ? (
                                            reportesPorAlumno[hijo.alumnoId].map((reporte, idx) => (
                                                <tr key={idx}>
                                                    <td>{reporte.motivo}</td>
                                                    <td>{new Date(reporte.fecha).toLocaleString('es-MX', {
                                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                        hour12: true
                                                    }).replace(',', '').replace(/\//g, '/')}</td>
                                                    <td>{reporte.responsable}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="3">Sin reportes registrados.</td></tr>
                                        )}
                                    </tbody>
                                </table>

                                <button onClick={() => descargarPDF(hijo.alumnoId)} className="boton-descargar">
                                    📄 Descargar PDF Escolar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Padre;