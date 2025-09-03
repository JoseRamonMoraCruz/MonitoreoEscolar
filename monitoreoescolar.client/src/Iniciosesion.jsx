import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Iniciosesion.css';
import birreteIcon from './assets/sombrero-de-graduado.png';
import { Toast } from 'primereact/toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const toast = useRef(null);

    const location = useLocation();

    const toastShownRef = useRef(false);

    useEffect(() => {
        if (!toastShownRef.current) {
            if (location.state?.mensajeRegistro) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Registro exitoso',
                    detail: location.state.mensajeRegistro,
                    life: 3000
                });
            } else if (location.state?.mensajeError) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Atención',
                    detail: location.state.mensajeError,
                    life: 3000
                });
            }

            toastShownRef.current = true;
            window.history.replaceState({}, document.title); // limpiar estado
        }
    }, [location.state]);



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const codigoEscuela = localStorage.getItem("codigoEscuela");

            const response = await axios.post("http://localhost:5099/api/usuarios/login", {
                correo: email,
                contrasena: password
            }, {
                headers: {
                    "Codigo-Escuela": codigoEscuela || ""
                }
            });


            const usuario = response.data.usuario;

            // Guardar en localStorage
            localStorage.setItem('idUsuario', usuario.id_Usuario);
            localStorage.setItem('nombre', usuario.nombre);
            localStorage.setItem('apellidoPaterno', usuario.apellidoPaterno);
            localStorage.setItem('apellidoMaterno', usuario.apellidoMaterno);
            localStorage.setItem('correo', usuario.correo);
            localStorage.setItem('contraseña', usuario.contrasena);
            localStorage.setItem('telefono', usuario.telefono);
            localStorage.setItem('tipo_Usuario', usuario.tipo_Usuario);

            if (usuario.escuelaId) {
                localStorage.setItem("escuelaId", usuario.escuelaId);
            }
            if (usuario.codigoEscuela) {
                localStorage.setItem("codigoEscuela", usuario.codigoEscuela);
            }

            // Esperar a que se muestre el toast antes de redirigir
            if (usuario.tipo_Usuario === "personal") {
                if (usuario.escuelaId) {
                    localStorage.setItem("escuelaId", usuario.escuelaId); // Guardar la escuela si ya está vinculada

                    navigate("/menu", {
                        state: {
                            mensajeBienvenida: `¡Bienvenido ${usuario.nombre}! Gracias por iniciar sesión.`
                        }
                    });
                } else {
                    navigate("/validar-codigo", {
                        state: {
                            mensajeError: "Debes ingresar el código de tu escuela antes de continuar."
                        }
                    });
                }
            } else if (usuario.tipo_Usuario === "padre") {
                localStorage.setItem("idPadre", usuario.id_Usuario);
                localStorage.setItem("nombrePadre", usuario.nombre);
                localStorage.setItem("apellidosPadre", usuario.apellidos);
                navigate("/padre", {
                    state: {
                        mensajeBienvenida: `¡Bienvenido ${usuario.nombre}!`
                    }
                });
            }

        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error de inicio de sesión',
                detail: error.response?.data?.mensaje || "❌ Usuario o contraseña incorrectos.",
                life: 3000
            });
        }
    };

    return (
        <div className="login-container-wrapper">
            <Toast ref={toast} />
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
                <img src={birreteIcon} alt="Birrete" className="birrete-icon" />

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
                    <span>No tengo cuenta</span> <Link to="/registro">Registrarse?</Link>
                </div>

                <div className="forgot-password">
                    <Link to="/actualizar-password">¿Olvidaste tu contraseña?</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
