import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Iniciosesion.css';
import birreteIcon from './assets/sombrero-de-graduado.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("/api/usuarios/login", {//NOTA: Cuando se suba a un servidor se debe cambiar la url del localhost a la del servidor
                correo: email,
                contrasena: password
            });

            const usuario = response.data.usuario;

            alert(response.data.mensaje);

            // Guardamos los datos en localStorage
            localStorage.setItem('idUsuario', usuario.id_Usuario); 
            localStorage.setItem('nombre', usuario.nombre); 
            localStorage.setItem('apellidos', usuario.apellidos); 
            localStorage.setItem('correo', usuario.correo); 
            localStorage.setItem('contraseña', usuario.contrasena);
            localStorage.setItem('telefono', usuario.telefono); 
            localStorage.setItem('tipo_Usuario', usuario.tipo_Usuario); 

            // Redirigir según el tipo de usuario
            if (usuario.tipo_Usuario === "personal") {
                navigate("/menu");
            } else if (usuario.tipo_Usuario === "padre") {
                localStorage.setItem("idPadre", usuario.id_Usuario);
                localStorage.setItem("nombrePadre", usuario.nombre); 
                localStorage.setItem("apellidosPadre", usuario.apellidos);
                navigate("/padre");
            }
        } catch (error) {
            setError(error.response?.data?.mensaje || "❌ Error en el inicio de sesión.");
        }
    };

    return (
        <div className="login-container-wrapper">
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
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

                <div className="separator"></div>
                <div className="register-link">
                    <span>No tengo cuenta</span> <Link to="/registro">Registrarse</Link>
                </div>

                <div className="forgot-password">
                    <Link to="/actualizar-password">¿Olvidaste tu contraseña?</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
