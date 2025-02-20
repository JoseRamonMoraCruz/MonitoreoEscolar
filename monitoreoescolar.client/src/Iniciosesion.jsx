import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Iniciosesion.css';

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
        <div className="container">
            <div className="login-container">
                <h2>Iniciar sesión</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Ingrese su correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Ingrese su password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Iniciar sesión</button>
                </form>

                {/* Agregamos el link al registro */}
                <div className="register-link">
                    <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;



                