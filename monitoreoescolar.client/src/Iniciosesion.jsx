import { useState } from 'react';
import './Iniciosesion.css';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Por favor, ingrese ambos campos');
            return;
        }

        console.log('Email:', email);
        console.log('Password:', password);

        setEmail('');
        setPassword('');
    };

    return (
        <div className="container">
            <div className="login-container">
                <h2>Iniciar sesión</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Ingrese su correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="container-label">
                        <label>Password</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Ingrese su password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️" : "🔒"}
                            </span>
                        </div>
                    </div>
                    <button type="submit">Iniciar sesión</button>
                </form>
                <div className="register-link">
                    <p>
                        <Link to="/registro">No tengo cuenta</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
