import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Iniciosesion.css';
import birreteIcon from './assets/sombrero-de-graduado.png'; // Asegúrate de que la imagen esté en la carpeta correcta

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("/api/usuarios/login", {
                correo: email,
                contrasena: password
            });

            const usuario = response.data.usuario;

            alert(response.data.mensaje);

            if (usuario.tipo_Usuario === "personal") {
                navigate("/menu"); // Redirige al menú si es Personal Escolar
            } else if (usuario.tipo_Usuario === "padre") {
                navigate("/padre"); // Para padres 
            }
        } catch (error) {
            setError(error.response?.data?.mensaje || "❌ Error en el inicio de sesión.");
        }
    };

    return (
        <div className="login-container-wrapper">
            <div className="login-box">
                <h2>Iniciar Sesión</h2>

                {/* Imagen del birrete */}
                <img src={birreteIcon} alt="Birrete" className="birrete-icon" />

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Correo"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">Iniciar sesión</button>
                </form>

                {/* Línea divisoria */}
                <div className="separator"></div>

                <div className="register-link">
                    <span>No tengo cuenta</span> <Link to="/registro">Registrarse</Link>
                </div>

                {/* Link para recuperar contraseña */}
                <div className="forgot-password">
                    <Link to="/actualizar-password">¿Olvidaste tu contraseña?</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
