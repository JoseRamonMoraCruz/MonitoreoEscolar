import { useState, useEffect, useRef }  from "react";
import axios from "axios";
import qrIcon from "./assets/codigo-qr.png";
import EscanerQR from "./EscanerQR";
import "./TomaAsistencia.css";
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast'; 


const TomaAsistencia = () => {
    const [mostrarQR, setMostrarQR] = useState(false);
    const [alumnos, setAlumnos] = useState([]);
    const toast = useRef(null);



    useEffect(() => {
        obtenerAsistenciasDelDia();
    }, []);

    const obtenerAsistenciasDelDia = async () => {
        try {
            const response = await axios.get("http://localhost:5099/api/tomaasistencia/hoy");
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
            const response = await axios.post("http://localhost:5099/api/tomaasistencia/registrar", {
                alumnoId: codigo
            });

            const { mensaje, nombre, apellidoPaterno } = response.data;
            mostrarToast(` ${mensaje}: ${nombre} ${apellidoPaterno}`);

            await obtenerAsistenciasDelDia();
        } catch (error) {
            console.error(" Error al registrar asistencia:", error);

            if (error.response && error.response.status === 404) {
                mostrarToast("Alumno no encontrado", "Verifica el código QR.", "error");
            } else if (error.response?.data?.mensaje) {
                mostrarToast(` ${error.response.data.mensaje}`, "error");
            } else {
                mostrarToast("Error al registrar asistencia.", "error");
            }
        } finally {
            setTimeout(() => cerrarModalQR(), 300);
        }
    };


    const mostrarToast = (summary, detail, severity = "success") => {
        toast.current.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    return (
        <div className="toma-asistencia-container">
            <Toast ref={toast} />

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
                    className="boton-qr"
                    onClick={abrirModalQR}
                    title="Escanear código QR"
                    aria-label="Escanear código QR"
                >
                    <img src={qrIcon} alt="QR" />
                </button>
            </div>

            {/* Modal */}
            <Dialog
                header="Escanear QR para registrar asistencia"
                visible={mostrarQR}
                style={{ width: '90%', maxWidth: '600px' }}
                onHide={cerrarModalQR}
                position="center"
                draggable={false}
                resizable={false}
                closable={true}
            >
                <EscanerQR idQr="qr-asistencia" onScanSuccess={manejarEscaneo} />
            </Dialog>
        </div>
    );
};


export default TomaAsistencia;
