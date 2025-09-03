import { useState, useEffect, useRef }  from "react";
import axios from "axios";
import qrIcon from "./assets/codigo-qr.png";
import EscanerQR from "./EscanerQR";
import "./TomaAsistencia.css";
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast'; 
import { Avatar } from 'primereact/avatar';


const TomaAsistencia = () => {
    const [mostrarQR, setMostrarQR] = useState(false);
    const [alumnos, setAlumnos] = useState([]);
    const toast = useRef(null);


    useEffect(() => {
        obtenerAsistenciasDelDia();
    }, []);

    const obtenerAsistenciasDelDia = async () => {
        try {
            const response = await axios.get("http://localhost:5099/api/tomaasistencia/hoy", {
                headers: {
                    "Escuela-Id": localStorage.getItem("escuelaId")
                }
            });
            console.log("📊 Asistencias cargadas:", response.data);
            setAlumnos(response.data);
        } catch (error) {
            console.error(" Error al cargar asistencias del día:", error);
        }
    };

    const abrirModalQR = () => {
        setMostrarQR(true);
    };

    const obtenerColorAleatorio = () => {
        const colores = [
            "#f44336", // rojo
            "#3f51b5", // azul
            "#4caf50", // verde
            "#ff9800", // naranja
            "#9c27b0", // morado
            "#009688", // turquesa
            "#795548", // café
            "#2196f3"  // azul claro
        ];
        const indice = Math.floor(Math.random() * colores.length);
        return colores[indice];
    };


    const cerrarModalQR = () => {
        setMostrarQR(false);
    };

    const manejarEscaneo = async (codigo) => {
        console.log(" Código recibido del QR:", codigo);

        try {
            const response = await axios.post(
                "http://localhost:5099/api/tomaasistencia/registrar",
                { alumnoId: codigo },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Escuela-Id": localStorage.getItem("escuelaId")
                    }
                }
            );


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

            {/* Tarjetas de asistencia estilo moderno */}
            <div className="grid grid-nogutter gap-4 mt-4" style={{ paddingInline: "1rem" }}>
                {alumnos.map((a, index) => {
                    const obtenerIniciales = (nombre) => {
                        if (!nombre) return "";
                        const partes = nombre.trim().split(" ");
                        if (partes.length === 1) return partes[0][0].toUpperCase();
                        return (partes[0][0] + partes[1][0]).toUpperCase();
                    };

                    const iniciales = obtenerIniciales(a.nombre);

                    return (
                        <div key={index} className="col-12">
                            <div className="asistencia-box">
                                <div className="asistencia-left">
                                    <Avatar
                                        label={iniciales}
                                        shape="circle"
                                        size="xlarge"
                                        style={{
                                            backgroundColor: obtenerColorAleatorio(),
                                            color: "#fff",
                                            fontWeight: "bold",
                                            width: "60px",
                                            height: "60px",
                                            fontSize: "22px"
                                        }}
                                    />
                                    <div className="asistencia-info">
                                        <div className="asistencia-nombre">{a.nombre} {a.apellidoPaterno} {a.apellidoMaterno}</div>
                                        <small>
                                            <strong>Grupo:</strong> {a.grupo} &nbsp;&nbsp;
                                            <strong>Carrera:</strong> {a.carrera} &nbsp;&nbsp;
                                            <strong>Turno:</strong> {a.turno}
                                        </small>
                                    </div>
                                </div>

                                <div className="asistencia-linea"></div>

                                <div className="asistencia-right">
                                    <div className="asistencia-horas">
                                        <span>Hora Entrada</span>
                                        <span>Hora Salida</span>
                                    </div>
                                    <div className="asistencia-tiempos">
                                        <span>
                                            {a.entrada && a.entrada !== "--"
                                                ? new Date(`1970-01-01T${a.entrada}`).toLocaleTimeString("es-MX", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: true
                                                })
                                                : "--"}
                                        </span>
                                        <span>
                                            {a.salida && a.salida !== "--"
                                                ? new Date(`1970-01-01T${a.salida}`).toLocaleTimeString("es-MX", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: true
                                                })
                                                : "--"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
