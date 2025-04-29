import { useState, useEffect } from 'react';
import axios from 'axios';
import './ActualizarPassword.css';
import { useNavigate } from 'react-router-dom';
import AtrasIcon from './assets/flecha-hacia-atras.png'; // Ajusta la ruta si es distinta


function ActualizarPassword() {
    const [correo, setCorreo] = useState('');
    const [codigo, setCodigo] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [paso, setPaso] = useState(1); 
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [contador, setContador] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (contador > 0) {
            const timer = setTimeout(() => setContador(contador - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [contador]);

    const enviarCodigo = async () => {
        try {
            await axios.post('/api/usuarios/enviar-codigo', { correo });
            setMessage('Código enviado. Revisa tu correo.');
            setError('');
            setPaso(2);
            setContador(15); 
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al enviar código.");
            setMessage('');
        }
    };

    const validarCodigo = async () => {
        try {
            await axios.post('/api/usuarios/validar-codigo', { correo, codigo });
            setMessage('Código válido. Ahora escribe tu nueva contraseña.');
            setError('');
            setPaso(3);
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al validar código.");
            setMessage('');
        }
    };

    const actualizarPassword = async () => {
        try {
            await axios.post('/api/usuarios/actualizar-password', { correo, newPassword });
            setMessage('Contraseña actualizada exitosamente. Redirigiendo...');
            setError('');
            setTimeout(() => {
                window.location.href = '/'; // Regresa al login
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al actualizar contraseña.");
            setMessage('');
        }
    };

    return (
        <div className="update-container-wrapper">
            <div className="update-box">
                <button className="back-button" onClick={() => window.location.href = '/'}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>

                <h2 className="register-title">Actualizar Contraseña</h2>


                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                {/* Paso 1: Ingresar correo */}
                {paso === 1 && (
                    <>
                        <label>Ingresa el Correo Electrónico:</label>
                        <input
                            type="email"
                            className="update-input"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                        <button className="update-button" onClick={enviarCodigo}>
                            Enviar
                        </button>
                    </>
                )}

                {/* Paso 2: Ingresar código */}
                {paso === 2 && (
                    <>
                        <label>Ingresa el Correo Electrónico:</label>
                        <input
                            type="email"
                            className="update-input"
                            value={correo}
                            disabled
                        />

                        <label>Ingresa código de verificación:</label>
                        <input
                            type="text"
                            className="update-input"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            required
                        />

                        {contador > 0 ? (
                            <p>Volver a enviar código de verificación en: <span style={{ color: 'red' }}>{contador}s</span></p>
                        ) : (
                            <button className="update-button" onClick={enviarCodigo}>
                                Reenviar Código
                            </button>
                        )}

                        <button className="update-button" onClick={validarCodigo}>
                            Confirmar Código
                        </button>
                    </>
                )}

                {/* Paso 3: Ingresar nueva contraseña */}
                {paso === 3 && (
                    <>
                        <label>Ingresa el Correo Electrónico:</label>
                        <input
                            type="email"
                            className="update-input"
                            value={correo}
                            disabled
                        />

                        <label>Ingresa código de verificación:</label>
                        <input
                            type="text"
                            className="update-input"
                            value={codigo}
                            disabled
                        />

                        <label>Ingresa tu nueva contraseña:</label>
                        <input
                            type="password"
                            className="update-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        <button className="update-button" onClick={actualizarPassword}>
                            Actualizar Contraseña
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ActualizarPassword;
