import { useState, useEffect } from "react";
import "./Padre.css";

const Padre = () => {
    // Estado para almacenar los datos de la base de datos
    const [calificaciones, setCalificaciones] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [malaConducta, setMalaConducta] = useState("");

    // Simulaci�n de carga de datos (m�s adelante se puede conectar a una API real)
    useEffect(() => {
        // Datos corregidos con codificaci�n correcta
        setCalificaciones([
            { materia: "Matem�ticas", calificacion: 10, grupo: "1� A", parcial: "Primera" },
            { materia: "Espa�ol", calificacion: 9, grupo: "1� A", parcial: "Primera" }
        ]);

        setAsistencias([
            { fecha: "26/03/2025", nombre: "Juan Manuel M�rquez M�rquez", asistencia: "Presente", grupo: "A" }
        ]);

        setMalaConducta("Agresi�n a docente escolar");
    }, []);

    return (
        <div className="padre-container">
            <h3 className="titulo-seccion">Vista padre-alumno</h3>

            {/* Secci�n de Calificaciones */}
            {calificaciones.length > 0 ? (
                <div className="seccion">
                    <h2>Calificaciones</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th>Calificaci�n</th>
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
            ) : (
                <p className="mensaje-vacio">No hay calificaciones registradas.</p>
            )}

            {/* Secci�n de Reportes de Asistencias */}
            {asistencias.length > 0 ? (
                <div className="seccion">
                    <h2>Reportes de asistencias</h2>
                    <table>
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
            ) : (
                <p className="mensaje-vacio">No hay registros de asistencia.</p>
            )}

            {/* Secci�n de Reporte de mala conducta */}
            {malaConducta ? (
                <div className="seccion">
                    <h2>Reporte de mala conducta</h2>
                    <p><strong>Situaci�n:</strong> {malaConducta}</p>
                </div>
            ) : (
                <p className="mensaje-vacio">No hay reportes de mala conducta.</p>
            )}
        </div>
    );
};

export default Padre;
