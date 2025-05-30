// Padre.jsx
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
    const [nombrePadre, setNombrePadre] = useState("");
    const [showToast, setShowToast] = useState(false);

    const navigate = useNavigate();

    // Bienvenida al padre
    useEffect(() => {
        const nombre = localStorage.getItem("nombrePadre") || "";
        setNombrePadre(nombre);
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Carga los hijos del padre al montar
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

    // Función para descargar el PDF, ahora recibe también el nombre del alumno
    const descargarPDF = async (alumnoId, nombreCompleto) => {
        try {
            const response = await axios.get(
                `http://localhost:5099/api/padres/descargar-reporte/${alumnoId}`,
                { responseType: "blob" }
            );

            // Crea el blob y la URL
            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(pdfBlob);

            // Genera un nombre de archivo seguro a partir del nombre completo
            const safeName = nombreCompleto
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_");

            // Crea y dispara el enlace de descarga
            const link = document.createElement("a");
            link.href = url;
            link.download = `Reporte_${safeName}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Libera la URL
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("❌ Error al descargar el PDF:", error);
            alert("Ocurrió un error al intentar descargar el PDF.");
        }
    };

    // Cambiar el rango de fechas para filtrar asistencias
    const cambiarRangoAsistencia = async (alumnoId, inicio, fin) => {
        setRangosPorAlumno(prev => ({
            ...prev,
            [alumnoId]: { inicio, fin }
        }));
        try {
            const response = await axios.get(
                `http://localhost:5099/api/padres/obtener-asistencias-alumno/${alumnoId}?fechaInicio=${inicio}&fechaFin=${fin}`
            );
            setAsistenciasPorAlumno(prev => ({ ...prev, [alumnoId]: response.data }));
        } catch (error) {
            console.error("❌ Error al obtener asistencias por rango:", error);
        }
    };

    // Mostrar/ocultar detalles de un alumno
    const toggleExpand = async (alumnoId) => {
        if (expandedAlumnoId === alumnoId) {
            setExpandedAlumnoId(null);
            return;
        }

        // Si aún no tenemos asistencias, las traemos
        if (!asistenciasPorAlumno[alumnoId]) {
            try {
                const resp = await axios.get(`http://localhost:5099/api/padres/obtener-asistencias-alumno/${alumnoId}`);
                setAsistenciasPorAlumno(prev => ({ ...prev, [alumnoId]: resp.data }));
            } catch (err) {
                console.error("❌ Error al obtener asistencias:", err);
            }
        }

        // Inicializamos fecha hoy si hace falta
        if (!fechasPorAlumno[alumnoId]) {
            const hoy = new Date().toISOString().split("T")[0];
            setFechasPorAlumno(prev => ({ ...prev, [alumnoId]: hoy }));
        }

        setExpandedAlumnoId(alumnoId);

        // Si aún no tenemos reportes, los traemos
        if (!reportesPorAlumno[alumnoId]) {
            try {
                const resp = await axios.get(`http://localhost:5099/api/padres/obtener-reportes-hijo/${alumnoId}`);
                setReportesPorAlumno(prev => ({ ...prev, [alumnoId]: resp.data }));
            } catch (err) {
                console.error("❌ Error al obtener reportes:", err);
            }
        }

        // Si no están las calificaciones en el estado, las traemos
        const hijo = hijos.find(h => h.alumnoId === alumnoId);
        if (hijo && !hijo.calificaciones) {
            try {
                const resp = await axios.get(`http://localhost:5099/api/padres/obtener-calificaciones-alumno/${alumnoId}`);
                setHijos(prev =>
                    prev.map(h =>
                        h.alumnoId === alumnoId ? { ...h, calificaciones: resp.data } : h
                    )
                );
            } catch (err) {
                console.error("❌ Error al obtener calificaciones:", err);
            }
        }
    };

    return (
        <>
            <nav className="menu-bar">
                <ul className="menu-list">
                    <li><Link to="/" className="logout-link">Cerrar Sesión</Link></li>
                </ul>
                {showToast && (
                    <div className="welcome-toast">
                        ¡Bienvenido, <strong>{nombrePadre}</strong>!
                    </div>
                )}
            </nav>

            <div className="padre-container">
                {hijos.map(hijo => (
                    <div key={hijo.alumnoId} className="seccion">
                        <div
                            className="card-alumno"
                            onClick={() => toggleExpand(hijo.alumnoId)}
                        >
                            <div className="nombre">{hijo.nombreCompleto}</div>
                            <div className="grupo">{hijo.grupo}</div>
                        </div>

                        {expandedAlumnoId === hijo.alumnoId && (
                            <div className="contenido-expandido">
                                {/* Calificaciones */}
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
                                                <td colSpan="3">Sin calificaciones registradas.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Filtro de asistencias */}
                                <div style={{ margin: "10px 0" }}>
                                    <label style={{ display: "block", marginBottom: "8px" }}>
                                        Filtrar asistencias por rango:
                                    </label>
                                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                                        <div style={{ flex: 1 }}>
                                            <span>Fecha Inicio:</span>
                                            <input
                                                type="date"
                                                value={rangosPorAlumno[hijo.alumnoId]?.inicio || fechasPorAlumno[hijo.alumnoId]}
                                                onChange={e => {
                                                    const inicio = e.target.value;
                                                    const fin = rangosPorAlumno[hijo.alumnoId]?.fin || inicio;
                                                    cambiarRangoAsistencia(hijo.alumnoId, inicio, fin);
                                                }}
                                                style={{ padding: "5px", width: "100%" }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span>Fecha Fin:</span>
                                            <input
                                                type="date"
                                                value={rangosPorAlumno[hijo.alumnoId]?.fin || fechasPorAlumno[hijo.alumnoId]}
                                                onChange={e => {
                                                    const fin = e.target.value;
                                                    const inicio = rangosPorAlumno[hijo.alumnoId]?.inicio || fin;
                                                    cambiarRangoAsistencia(hijo.alumnoId, inicio, fin);
                                                }}
                                                style={{ padding: "5px", width: "100%" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Asistencias */}
                                <h3>📋 Asistencias</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Hora entrada</th>
                                            <th>Hora salida</th>
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

                                {/* Reportes de mala conducta */}
                                <h3>⚠️ Reporte de Mala Conducta</h3>
                                <table className="styled-table">
                                    <thead>
                                        <tr>
                                            <th>Situación del Reporte</th>
                                            <th>Fecha del Reporte</th>
                                            <th>Profesor Responsable</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportesPorAlumno[hijo.alumnoId]?.length > 0 ? (
                                            reportesPorAlumno[hijo.alumnoId].map((reporte, idx) => (
                                                <tr key={idx}>
                                                    <td>{reporte.motivo}</td>
                                                    <td>{new Date(reporte.fecha).toLocaleString("es-MX", {
                                                        year: "numeric", month: "2-digit", day: "2-digit",
                                                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                                                        hour12: true
                                                    }).replace(",", "").replace(/\//g, "/")}
                                                    </td>
                                                    <td>{reporte.responsable}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3">Sin reportes registrados.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Botón de descarga de PDF con nombre en el filename */}
                                <button
                                    onClick={() =>
                                        descargarPDF(hijo.alumnoId, hijo.nombreCompleto)
                                    }
                                    className="boton-descargar"
                                >
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
