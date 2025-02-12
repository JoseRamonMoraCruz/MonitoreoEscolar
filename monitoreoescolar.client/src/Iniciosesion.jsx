import { useState } from 'react'; 
import './Iniciosesion.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
                <h2>Iniciar sesion</h2>
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
                        <input
                            type="password"
                            placeholder="Ingrese su password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Iniciar sesion</button>
                </form>
                <div className="register-link">
                    <p>
                        <a href="/registro">No tengo cuenta</a>
                    </p>
                </div>
            </div>
        </div>

    );
};

export default Login;
