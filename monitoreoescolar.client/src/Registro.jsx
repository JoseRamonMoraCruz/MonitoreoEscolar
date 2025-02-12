import { useState } from "react";

export default function Registro() {
    const [tipoUsuario, setTipoUsuario] = useState("padre");

    return (
        <div className="container">
            <div className="register-container">
                <h2 className="register-title">Registra tus datos</h2>

                {/* Selector de tipo de usuario */}
                <div className="selector-container">
                    <button
                        className={`selector-button ${tipoUsuario === "padre" ? "selected" : ""}`}
                        onClick={() => setTipoUsuario("padre")}
                    >
                        Padre
                    </button>
                    <button
                        className={`selector-button ${tipoUsuario === "personal" ? "selected" : ""}`}
                        onClick={() => setTipoUsuario("personal")}
                    >
                        Personal Escolar
                    </button>
                </div>

                {/* Formulario */}
                <form>
                    <input type="text" placeholder="Nombre" className="input-field" />
                    <input type="text" placeholder="Apellidos" className="input-field" />
                    <input type="password" placeholder="Password" className="input-field" />
                    <input type="tel" placeholder="Telefono" className="input-field" />
                    <input type="email" placeholder="Correo" className="input-field" />
                    {tipoUsuario === "padre" && (
                        <input type="text" placeholder="Nombre del alumn@" className="input-field" />
                    )}

                    <button type="button" className="submit-button">
                        CREAR CUENTA
                    </button>
                </form>
            </div>
        </div>
    );
}