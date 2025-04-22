import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ActualizarPassword.css';

function ActualizarPassword() {
    const [correo, setCorreo] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/usuarios/actualizar-password", { correo, newPassword });
            setMessage(response.data.mensaje);
            setError('');
            // Opcional: redirigir al login después de unos segundos
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al actualizar la contraseña.");
            setMessage('');
        }
    };

    return (
        <div className="update-container-wrapper">
            <div className="update-box">
                <h2>Actualizar Contraseña</h2>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Ingresa tu correo"
                        className="update-input"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Nueva Contraseña"
                        className="update-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="update-button">Actualizar</button>
                </form>
                <div className="back-to-login">
                    <Link to="/">Volver a Iniciar Sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default ActualizarPassword;

