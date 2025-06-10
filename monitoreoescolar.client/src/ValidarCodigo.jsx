import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AtrasIcon from './assets/flecha-hacia-atras.png';

const ValidarCodigo = () => {
    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Verificar si ya tiene código
    useEffect(() => {
        const escuelaId = localStorage.getItem("escuelaId");
        if (escuelaId) {
            navigate("/login");
        }
    }, []);

    const validarCodigo = async () => {
        try {
            setError('');
            const response = await axios.post("http://localhost:5099/api/escuela/validar-codigo", codigo, {
                headers: { 'Content-Type': 'application/json' }
            });

            const escuela = response.data;

            localStorage.setItem("escuelaId", escuela.id);
            localStorage.setItem("escuelaNombre", escuela.nombre);
            localStorage.setItem("codigoEscuela", codigo); 

            navigate("/login");
        } catch (err) {
            setError(`Código inválido. Detalles: ${err.message}`);
        }
    };


    return (
        <div className="update-container-wrapper">
            <div className="update-box">
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>

                <h2 className="register-title">Introduce Código</h2>

                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="codigo">Código de escuela</label>
                        <InputText id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                    </div>

                    {error && <Message severity="error" text={error} className="mt-3" />}

                    <Button
                        label="Siguiente"
                        icon="pi pi-arrow-right"
                        className="update-button"
                        onClick={validarCodigo}
                        disabled={!codigo.trim()}
                    />

                    <div className="mt-4">
                        <Button
                            label="¿No tienes código? Generar uno"
                            icon="pi pi-plus"
                            className="p-button-text"
                            onClick={() => navigate("/generar-codigo")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValidarCodigo;
