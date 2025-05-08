import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import familiaIcon from "./assets/familia.png"; 
import escuelaIcon from "./assets/edificio-escolar.png"; 
import AtrasIcon from './assets/flecha-hacia-atras.png'; 


export default function Registro() {
    const [tipoUsuario, setTipoUsuario] = useState("personal"); 
    const [Nombre, setNombre] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [apellidoMaterno, setApellidoMaterno] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [toastMensaje, setToastMensaje] = useState("");

    useEffect(() => {
        if (toastMensaje) {
            const timer = setTimeout(() => setToastMensaje(""), 8000); // 3 segundos se muestra el mensaje
            return () => clearTimeout(timer);
        }
    }, [toastMensaje]);

    const handleRegistro = async (e) => {
        e.preventDefault();

        if (!Nombre || !apellidoPaterno || !apellidoMaterno || !telefono || !correo || !contrasena || !confirmarContrasena) {
            setError("❌ Todos los campos son obligatorios.");
            return;
        }

        if (contrasena !== confirmarContrasena) {
            setError("❌ Las contraseñas no coinciden.");
            return;
        }
        if (contrasena !== confirmarContrasena) {
            setToastMensaje("❌ Las contraseñas no coinciden.");
            return;
        }



         const MASTER_PASS = "EscolarPerson123";  
           if (tipoUsuario === "personal" && contrasena !== MASTER_PASS) {
                   setError("❌ Contraseña de acceso para personal inválida.");
                   return;
           }

        setLoading(true);
        setError(""); // Limpia errores anteriores

        const usuario = {
            Nombre,
            apellidoPaterno,
            apellidoMaterno,
            correo,
            telefono,
            contrasena,
            Tipo_Usuario: tipoUsuario
        };

        try {
            const response = await axios.post("http://localhost:5099/api/usuarios/registro", usuario);
            alert(response.data.mensaje);
            navigate("/"); 
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
               
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>

                <h2 className="register-title">Regístrate</h2>

                
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>

               
                <img
                    src={tipoUsuario === "padre" ? familiaIcon : escuelaIcon}
                    alt="Tipo de usuario"
                    className="user-icon"
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}

               
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

                {toastMensaje && (
                    <div className="toast-mensaje">
                        {toastMensaje}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleRegistro}>
                    <input type="text" placeholder="Nombre" className="input-field" value={Nombre} onChange={(e) => setNombre(e.target.value)} required />
                    <input type="text" placeholder="Apellido Paterno" className="input-field" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} required />
                    <input type="text" placeholder="Apellido Materno" className="input-field" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} required />
                    <input type="tel" placeholder="Teléfono" className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />                
                    <input type="email" placeholder="Correo" className="input-field" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                    <input type="tel" placeholder="Teléfono" className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />  
                    <input type="password" placeholder="Contraseña" className="input-field" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                    <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        className="input-field"
                        value={confirmarContrasena}
                        onChange={(e) => setConfirmarContrasena(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || contrasena !== confirmarContrasena}
                    >
                        {loading ? "Creando cuenta..." : "CREAR CUENTA"}
                    </button>

                </form>
            </div>
        </div>
    );
}
