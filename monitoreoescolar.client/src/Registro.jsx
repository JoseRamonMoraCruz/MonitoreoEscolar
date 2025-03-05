import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import familiaIcon from "./assets/familia.png"; // Imagen para "Padre"
import escuelaIcon from "./assets/edificio-escolar.png"; // Imagen para "Personal Escolar"
import AtrasIcon from './assets/hacia-atras.png'; 

export default function Registro() {
    const [tipoUsuario, setTipoUsuario] = useState("personal"); // Por defecto en "Personal Escolar"
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [nombreAlumno, setNombreAlumno] = useState(""); // Nuevo campo para Padres
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegistro = async (e) => {
        e.preventDefault();

        if (!nombre || !apellidos || !telefono || !correo || !contrasena) {
            setError("❌ Todos los campos son obligatorios.");
            return;
        }

        if (!correo.includes("@")) {
            setError("❌ Ingresa un correo válido.");
            return;
        }

        if (tipoUsuario === "padre" && !nombreAlumno) {
            setError("❌ Ingresa el nombre del alumno.");
            return;
        }

        setLoading(true);

        const usuario = {
            nombre,
            apellidos,
            correo,
            telefono,
            contrasena,
            tipo_Usuario: tipoUsuario,
            nombreAlumno: tipoUsuario === "padre" ? nombreAlumno : null //  Solo si es Padre
        };

        try {
            const response = await axios.post("/api/usuarios/registro", usuario);
            alert(response.data.mensaje);
            navigate("/"); // Redirige al login tras el registro
        } catch (error) {
            console.error("Error en el registro:", error.response?.data || error.message);
            setError(error.response?.data?.mensaje || "❌ Error en el registro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className={`register-container ${tipoUsuario === "padre" ? "padre" : ""}`}>
                {/* Botón para regresar al login con imagen personalizada */}
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>


                <h2 className="register-title">Regístrate</h2>

                {/* Botón para regresar al login con imagen personalizada */}
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>


                {/* Imagen dinámica */}
                <img
                    src={tipoUsuario === "padre" ? familiaIcon : escuelaIcon}
                    alt="Tipo de usuario"
                    className="user-icon"
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                {/* Selector de tipo de usuario */}
                <div className="selector-container">
                    <button
                        className={`selector-button ${tipoUsuario === "padre" ? "selected" : ""}`}
                        onClick={() => setTipoUsuario("padre")}
                        type="button"
                    >
                        Padre
                    </button>
                    <button
                        className={`selector-button ${tipoUsuario === "personal" ? "selected" : ""}`}
                        onClick={() => setTipoUsuario("personal")}
                        type="button"
                    >
                        Personal Escolar
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleRegistro}>
                    <input type="text" placeholder="Nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    <input type="text" placeholder="Apellidos" className="input-field" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                    <input type="password" placeholder="Contraseña" className="input-field" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                    <input type="tel" placeholder="Teléfono" className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                    <input type="email" placeholder="Correo" className="input-field" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

                    {/* Este campo solo se muestra si el usuario es "Padre" */}
                    {tipoUsuario === "padre" && (
                        <input type="text" placeholder="Nombre del Alumn@" className="input-field" value={nombreAlumno} onChange={(e) => setNombreAlumno(e.target.value)} required />
                    )}

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? "Creando cuenta..." : "CREAR CUENTA"}
                    </button>
                </form>
            </div>
        </div>
    );
}
