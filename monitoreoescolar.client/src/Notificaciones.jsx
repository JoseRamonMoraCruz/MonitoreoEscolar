import { useState } from "react";
import "./Notificaciones.css";
import axios from "axios";
import WhatsappIcon from "./assets/whatsapp.png"; // Ícono de WhatsApp

const Notificaciones = () => {
    const [nombre, setNombre] = useState("");
    const [resultados, setResultados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const buscarPadre = async () => {
        if (nombre.trim() === "") {
            alert("Por favor ingrese un nombre para buscar.");
            return;
        }

        setCargando(true);
        setMensaje("");
        setResultados([]);

        try {
            const nombreBusqueda = nombre.trim();
            const response = await axios.get("/api/usuarios/buscarPadre", { params: { nombre: nombreBusqueda } });
            console.log("Respuesta de la API:", response.data);

            setResultados(response.data);
        } catch (error) {
            console.error("Error al buscar:", error);
            setMensaje(error.response?.data?.mensaje || "Error al buscar.");
        } finally {
            setCargando(false);
        }
    };

    // Función para abrir WhatsApp con el número
    const enviarWhatsApp = (telefono) => {
        window.open(`https://wa.me/${telefono}?text=`, "_blank");
    };


    // Función para simular el envío de SMS (se puede conectar a una API real)

    return (
        <div className="notificaciones-container">
            <div className="notificaciones-content">
                <h2 className="notificaciones-title">Notificaciones</h2>

                <div className="notificaciones-search-container">
                    <input
                        type="text"
                        placeholder="Buscar padre de familia"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                    <button className="notificaciones-search-button" onClick={buscarPadre}>🔍</button>
                </div>

                {cargando && <p>Cargando...</p>}

                {mensaje && <p>{mensaje}</p>}

                {resultados.length > 0 && (
                    <div className="notificaciones-result-container">
                        {resultados.map((padre, index) => (
                            <div key={index} className="notificaciones-item">
                                <span>
                                    <strong>{padre.nombre}{padre.apellidos ? ` ${padre.apellidos}` : ""}</strong>
                                </span>
                                <div className="notificaciones-icons">
                                   
                                    <img
                                        src={WhatsappIcon}
                                        alt="WhatsApp"
                                        className="icono-notificacion"
                                        onClick={() => enviarWhatsApp(padre.telefono)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notificaciones;
