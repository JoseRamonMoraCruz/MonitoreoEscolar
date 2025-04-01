import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Padre.css";

const Padre = () => {
    const [hijosConCalificaciones, setHijosConCalificaciones] = useState([]); // Este estado almacena los hijos con sus calificaciones
    const [reportesPorAlumno, setReportesPorAlumno] = useState({}); // Este estado almacena los reportes de mala conducta por alumno
    const [expandedAlumnoId, setExpandedAlumnoId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const idPadre = localStorage.getItem("idPadre");

        if (!idPadre) {
            alert("🔒 Debes iniciar sesión.");
            navigate("/");
            return;
        }

        const obtenerCalificaciones = async () => {
            try {
                const response = await axios.get(`/api/padres/obtener-calificaciones-hijos/${idPadre}`);
                setHijosConCalificaciones(response.data);
            } catch (error) {
                console.error("❌ Error al obtener calificaciones:", error);
            }
        };

        obtenerCalificaciones();
    }, [navigate]);

    const toggleExpand = async (alumnoId) => {
    if (expandedAlumnoId === alumnoId) {
        setExpandedAlumnoId(null); // cerrar
    } else {
        setExpandedAlumnoId(alumnoId); // abrir

        console.log("🔎 ID del alumno expandido:", alumnoId); // 👉 Verifica el ID

        // Solo pedir reportes si no se han cargado aún
        if (!reportesPorAlumno[alumnoId]) {
            try {
                const response = await axios.get(`http://localhost:5099/api/padres/obtener-reportes-hijo/${alumnoId}`);
                
                console.log("📥 Reportes recibidos del backend:", response.data); // 👉 Verifica lo que llega del backend

                setReportesPorAlumno((prev) => ({ ...prev, [alumnoId]: response.data }));
            } catch (error) {
                console.error("❌ Error al obtener reportes:", error);
            }
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
                <h1 className="titulo-seccion">Reportes Escolares</h1>

                {hijosConCalificaciones.map((hijo) => (
                    <div key={hijo.alumnoId} className="seccion">
                        <h2
                            style={{ cursor: "pointer", color: "#1D4ED8" }}
                            onClick={() => toggleExpand(hijo.alumnoId)}
                        >
                            Información del alumno: {hijo.nombreCompleto} {expandedAlumnoId === hijo.alumnoId ? "▲" : "▼"}
                        </h2>

                        {expandedAlumnoId === hijo.alumnoId && (
                            <>
                                {/* Calificaciones */}
                                <h3 style={{ marginTop: "10px" }}>📘 Calificaciones</h3>
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
                                        {hijo.calificaciones.map((calif, idx) => (
                                            <tr key={idx}>
                                                <td>{calif.materia}</td>
                                                <td>{calif.calificacion}</td>
                                                <td>{calif.grupo}</td>
                                                <td>{calif.parcial}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Reportes de Asistencia */}
                                <h3 style={{ marginTop: "20px" }}>📅 Reportes de Asistencia</h3>
                                <p>🚧 Aún no disponible.</p>

                                {/* Mala conducta */}
                                <h3 style={{ marginTop: "20px" }}>⚠️ Reporte de Mala Conducta</h3>
                                {reportesPorAlumno[hijo.alumnoId] && reportesPorAlumno[hijo.alumnoId].length > 0 ? (
                                    <ul>
                                        {reportesPorAlumno[hijo.alumnoId].map((reporte, index) => (
                                            <li key={index}>📌 {reporte.motivo || reporte.Motivo}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p><strong>Situación:</strong> Sin reportes registrados.</p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Padre;
