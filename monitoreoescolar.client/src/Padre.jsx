import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Padre.css";

const Padre = () => {
    const [hijos, setHijos] = useState([]);
    const [reportesPorAlumno, setReportesPorAlumno] = useState({});
    const [expandedAlumnoId, setExpandedAlumnoId] = useState(null);
    const navigate = useNavigate();

    const descargarPDF = async (alumnoId) => {
        try {
            const response = await axios.get(`/api/padres/descargar-reporte/${alumnoId}`, {
                responseType: "blob", // importante para archivos binarios
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
                const response = await axios.get(`/api/padres/obtener-hijos-con-grupo/${idPadre}`);
                setHijos(response.data);
            } catch (error) {
                console.error("❌ Error al obtener hijos con grupo:", error);
            }
        };

        obtenerHijosConGrupo();
    }, [navigate]);

    const toggleExpand = async (alumnoId) => {
        if (expandedAlumnoId === alumnoId) {
            setExpandedAlumnoId(null);
            return;
        }

        setExpandedAlumnoId(alumnoId);

        // Obtener reportes si aún no están
        if (!reportesPorAlumno[alumnoId]) {
            try {
                const response = await axios.get(`/api/padres/obtener-reportes-hijo/${alumnoId}`);
                setReportesPorAlumno((prev) => ({ ...prev, [alumnoId]: response.data }));
            } catch (error) {
                console.error("❌ Error al obtener reportes:", error);
            }
        }

        // Obtener calificaciones si aún no están
        const alumno = hijos.find(h => h.alumnoId === alumnoId);
        if (!alumno?.calificaciones) {
            try {
                const response = await axios.get(`/api/padres/obtener-calificaciones-alumno/${alumnoId}`);
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
            </nav>

            <div className="padre-container">
                {hijos.map((hijo) => (
                    <div key={hijo.alumnoId} className="seccion">
                        <div className="card-alumno" onClick={() => toggleExpand(hijo.alumnoId)}>
                            <div className="grupo">{hijo.grupo}</div>
                            <div className="nombre">{hijo.nombreCompleto}</div>
                        </div>

                        {expandedAlumnoId === hijo.alumnoId && (
                            <div className="contenido-expandido">
                                <h3>📘 Calificaciones</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Materia</th>
                                            <th>Calificación</th>
                                            <th>Grupo</th>
                                            <th>Parcial</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hijo.calificaciones?.length > 0 ? (
                                            hijo.calificaciones.map((calif, idx) => (
                                                <tr key={idx}>
                                                    <td>{calif.materia}</td>
                                                    <td>{calif.calificacion}</td>
                                                    <td>{calif.grupo}</td>
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

                                <h3>📅 Asistencias</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Asistencia</th>
                                            <th>Fecha y hora de entrada</th>
                                            <th>Fecha y hora de salida</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Presente</td><td>2025/01/25 08:46:12 AM</td><td>2025/01/25 02:46:12 PM</td></tr>
                                        <tr><td>Ausente</td><td>-</td><td>-</td></tr>
                                        <tr><td>Presente</td><td>2025/01/27 08:50:00 AM</td><td>2025/01/27 02:40:00 PM</td></tr>
                                    </tbody>
                                </table>

                                <h3>⚠️ Reporte de Mala Conducta</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr><th>Situación del Reporte</th><th>Fecha del Reporte</th></tr>
                                    </thead>
                                    <tbody>
                                        {reportesPorAlumno[hijo.alumnoId]?.length > 0 ? (
                                            reportesPorAlumno[hijo.alumnoId].map((reporte, idx) => (
                                                <tr key={idx}>
                                                    <td>{reporte.motivo}</td>
                                                    <td>{
                                                        new Date(reporte.fecha).toLocaleString('es-MX', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: true
                                                        }).replace(',', '').replace(/\//g, '/')
                                                    }</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="2">Sin reportes registrados.</td></tr>
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