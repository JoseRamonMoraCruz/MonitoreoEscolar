import { useState } from "react";
import "./Notificaciones.css";

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
            const response = await fetch(`http://localhost:5099/api/usuarios/buscarPadre?nombre=${encodeURIComponent(nombre)}`);

            if (!response.ok) {
                throw new Error("No se encontraron resultados.");
            }

            const data = await response.json();
            console.log("Respuesta de la API:", data);

            setResultados(data);
        } catch (error) {
            console.error("Error al buscar:", error);
            setMensaje(error.message);
        } finally {
            setCargando(false);
        }
    };

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
                            <p key={index}>
                                <strong>{padre.nombre}{padre.apellidos ? ` ${padre.apellidos}` : ""}</strong> -------------- <strong>{padre.telefono}</strong>
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notificaciones;
