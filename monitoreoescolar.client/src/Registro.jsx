import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Registro() {
    const [tipoUsuario, setTipoUsuario] = useState("personal"); // Por defecto en "Personal Escolar"
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegistro = async (e) => {
        e.preventDefault();

        if (!nombre || !apellidos || !telefono ||!correo || !contrasena) {
            setError("❌ Todos los campos son obligatorios.");
            return;
        }

        if (!correo.includes("@")) {
            setError("❌ Ingresa un correo válido.");
            return;
        }

        setLoading(true);

        const usuario = {
            nombre,
            apellidos,
            correo,
            telefono,
            contrasena,
            tipo_Usuario: tipoUsuario
        };

        try {
            const response = await axios.post("/api/usuarios/registro", usuario);
            alert(response.data.mensaje);
            navigate("/"); //Redirige al login tras el registro
        } catch (error) {
            console.error("Error en el registro:", error.response?.data || error.message);
            setError(error.response?.data?.mensaje || "❌ Error en el registro.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="register-container">
                <h2 className="register-title">Registra tus datos</h2>

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
                    <input type="password" placeholder="Password" className="input-field" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                    <input type="tel" placeholder="Telefono" className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                    <input type="email" placeholder="Correo" className="input-field" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

                    {/* Este campo solo se muestra si el usuario es "Padre", pero aún no lo registramos en el backend */}
                    {tipoUsuario === "padre" && (
                        <input type="text" placeholder="Nombre del Alumn@" className="input-field" />
                    )}

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? "Creando cuenta..." : "CREAR CUENTA"}
                    </button>
                </form>
            </div>
        </div>
    );
}

