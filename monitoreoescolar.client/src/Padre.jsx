import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Padre.css";

const Padre = () => {
    const [calificaciones, setCalificaciones] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [malaConducta, setMalaConducta] = useState("");

    useEffect(() => {
        setCalificaciones([
            { materia: "Matematicas", calificacion: 10, grupo: "1 A", parcial: "Primera" },
            { materia: "Ciencias Naturales", calificacion: 9, grupo: "1 A", parcial: "Primera" },
            { materia: "Fisica", calificacion: 9, grupo: "1 A", parcial: "Primera" }
        ]);

        setAsistencias([
            { fecha: "26/03/2025", nombre: "Juan Manuel Marquez Marquez", asistencia: "Presente", grupo: "A" }
        ]);

        setMalaConducta("Agresion a docente escolar");
    }, []);

    return (
        <>
            {/* Línea negra tipo menú */}
            <nav className="menu-bar">
                <ul className="menu-list">
                    <li><Link to="/" className="logout-link">Cerrar Sesion</Link></li>
                </ul>
            </nav>

            <div className="padre-container">
                <h1 className="titulo-seccion">Reportes Escolares</h1>

                {/* Calificaciones */}
                <div className="seccion">
                    <h2>Calificaciones</h2>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th>Calificación</th>
                                <th>Grupo</th>
                                <th>Parcial/Unidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calificaciones.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.materia}</td>
                                    <td>{item.calificacion}</td>
                                    <td>{item.grupo}</td>
                                    <td>{item.parcial}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Reportes de Asistencia */}
                <div className="seccion">
                    <h2>Reportes de Asistencia</h2>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Nombre</th>
                                <th>Asistencia</th>
                                <th>Grupo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asistencias.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.fecha}</td>
                                    <td>{item.nombre}</td>
                                    <td>{item.asistencia}</td>
                                    <td>{item.grupo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Reporte de Mala Conducta */}
                <div className="seccion">
                    <h2>Reporte de Mala Conducta</h2>
                    <p><strong>Situacion:</strong> {malaConducta}</p>
                </div>
            </div>
        </>
    );
};

export default Padre;
