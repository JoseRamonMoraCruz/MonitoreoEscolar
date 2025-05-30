import { useState, useEffect } from "react";
import axios from "axios";
import qrIcon from "./assets/codigo-qr.png";
import EscanerQR from "./EscanerQR";
import "./TomaAsistencia.css";
import limpiarIcon from "./assets/limpiardatos.png";


const TomaAsistencia = () => {
    const [mostrarQR, setMostrarQR] = useState(false);
    const [alumnos, setAlumnos] = useState([]);
    const [mensajeToast, setMensajeToast] = useState(null);

    useEffect(() => {
        obtenerAsistenciasDelDia();
    }, []);

    const obtenerAsistenciasDelDia = async () => {
        try {
            const response = await axios.get("/api/tomaasistencia/hoy");
            console.log("📊 Asistencias cargadas:", response.data);
            setAlumnos(response.data);
        } catch (error) {
            console.error(" Error al cargar asistencias del día:", error);
        }
    };

    const abrirModalQR = () => {
        setMostrarQR(true);
    };

    const cerrarModalQR = () => {
        setMostrarQR(false);
    };

    const manejarEscaneo = async (codigo) => {
        console.log(" Código recibido del QR:", codigo);

        try {
            const response = await axios.post("/api/tomaasistencia/registrar", {
                alumnoId: codigo
            });

            const { mensaje, nombre, apellidoPaterno } = response.data;
            mostrarToast(` ${mensaje}: ${nombre} ${apellidoPaterno}`);

            await obtenerAsistenciasDelDia();
        } catch (error) {
            console.error(" Error al registrar asistencia:", error);

            if (error.response && error.response.status === 404) {
                mostrarToast("Alumno no encontrado. Verifica el QR.", "error");
            } else if (error.response?.data?.mensaje) {
                mostrarToast(` ${error.response.data.mensaje}`, "error");
            } else {
                mostrarToast("Error al registrar asistencia.", "error");
            }
        } finally {
            setTimeout(() => cerrarModalQR(), 300);
        }
    };

    const mostrarToast = (texto, tipo = "success") => {
        setMensajeToast({ texto, tipo });
        setTimeout(() => setMensajeToast(null), 2500);
    };

    return (
        <div className="toma-asistencia-container">
            
            {/* Tabla */}
            <div className="tabla-asistencia-container">
                <table className="tabla-asistencia">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido Paterno</th>
                            <th>Apellido Materno</th>
                            <th>Grupo</th>
                            <th>Carrera</th>
                            <th>Turno</th>
                            <th>Hora de Entrada</th>
                            <th>Hora de Salida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos.map((a, index) => (
                            <tr key={index}>
                                <td>{a.nombre}</td>
                                <td>{a.apellidoPaterno}</td>
                                <td>{a.apellidoMaterno}</td>
                                <td>{a.grupo}</td>
                                <td>{a.carrera}</td>
                                <td>{a.turno}</td>
                                <td>{a.entrada}</td>
                                <td>{a.salida}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="botones-accion-container">
                <button
                    className="boton-limpiar"
                    onClick={() => setAlumnos([])}
                    title="Limpiar lista de alumnos"
                    aria-label="Limpiar lista de alumnos"
                >
                    <img src={limpiarIcon} alt="Limpiar" />
                </button>

                <button
                    className="boton-qr"
                    onClick={abrirModalQR}
                    title="Escanear código QR"
                    aria-label="Escanear código QR"
                >
                    <img src={qrIcon} alt="QR" />
                </button>
            </div>

            {/* Modal */}
            {mostrarQR && (
                <div className="modal-qr-overlay">
                    <div className="modal-qr-content">
                        <button className="btn-cerrar-flotante" onClick={cerrarModalQR}>×</button>
                        <EscanerQR onScanSuccess={manejarEscaneo} />
                    </div>
                </div>
            )}

            {/* Toast */}
            {mensajeToast && (
                <div
                    className={`toast-mensaje ${mensajeToast.tipo}`}
                    data-icon={mensajeToast.tipo === "success" ? "✅" : "❌"}
                >
                    {mensajeToast.texto}
                </div>
            )}
        </div>
    );
};

export default TomaAsistencia;
