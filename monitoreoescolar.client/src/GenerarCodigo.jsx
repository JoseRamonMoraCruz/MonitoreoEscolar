import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import AtrasIcon from './assets/flecha-hacia-atras.png';
import './GenerarCodigo.css'; // Reutilizamos tu estilo visual

const GenerarCodigo = () => {
    const [nombreEscuela, setNombreEscuela] = useState('');
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [correo, setCorreo] = useState('');
    const [codigoApp, setCodigoApp] = useState('');
    const stepperRef = useRef(null);
    const toast = useRef(null);
    const navigate = useNavigate();

    const mostrarToast = (mensaje, tipo = 'success') => {
        toast.current.show({
            severity: tipo,
            summary: tipo === 'success' ? 'Éxito' : 'Error',
            detail: mensaje,
            life: 3000
        });
    };

    const generarCodigoLocal = () => {
        const generado = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCodigoGenerado(generado);
    };

    const guardarEscuela = async () => {
        try {
            const usuarioId = localStorage.getItem("idUsuario"); // ⬅️ Nuevo: obtenemos el ID del usuario

            const response = await fetch('http://localhost:5099/api/escuela/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Usuario-Id': usuarioId || "" // ⬅️ Nuevo: lo mandamos en los headers
                },
                body: JSON.stringify({
                    nombre: nombreEscuela,
                    codigoAcceso: codigoGenerado,
                    correoNotificaciones: correo,
                    codigoAppGmail: codigoApp.replace(/\s/g, "")
                })
            });

            if (!response.ok) throw new Error("Error al guardar la escuela");

            const data = await response.json();
            localStorage.setItem("codigoEscuela", data.codigoAcceso);
            localStorage.setItem("escuelaId", data.id);
            localStorage.setItem("escuelaNombre", data.nombre);

            mostrarToast("✅ Escuela registrada correctamente.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            mostrarToast(err.message, 'error');
        }
    };


    return (
        <div className="update-container-wrapper">
            <Toast ref={toast} position="top-center" />
            <div className="update-box">
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>

                <h2 className="register-title">Generar Código Escolar</h2>

                <Stepper ref={stepperRef} linear style={{ marginTop: '30px' }}>
                    {/* PASO 1 - Nombre + Generar código */}
                    <StepperPanel header="Código">
                        <label>Nombre de la escuela:</label>
                        <InputText
                            className="update-input"
                            value={nombreEscuela}
                            onChange={(e) => setNombreEscuela(e.target.value)}
                        />

                        <label>Código generado:</label>
                        <InputText
                            className="update-input"
                            value={codigoGenerado}
                            readOnly
                            placeholder="Haz clic en 'Generar Código'"
                        />

                        <Button
                            label="Generar Código"
                            icon="pi pi-plus"
                            className="update-button"
                            onClick={generarCodigoLocal}
                        />

                        <div className="flex pt-3 justify-content-between">
                            <Button label="Atrás" icon="pi pi-arrow-left" onClick={() => navigate("/validar-codigo")} />
                            <Button label="Siguiente" icon="pi pi-arrow-right" onClick={() => stepperRef.current.nextCallback()} disabled={!codigoGenerado} />
                        </div>
                    </StepperPanel>

                    {/* PASO 2 - Correo + Código App */}
                    <StepperPanel header="Gmail">
                        <label>Correo institucional:</label>
                        <InputText
                            className="update-input"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                        />

                        <label>Código de aplicación:</label>
                        <InputText
                            className="update-input"
                            value={codigoApp}
                            onChange={(e) => setCodigoApp(e.target.value)}
                        />

                        <Button
                            label="Manual para generar código"
                            icon="pi pi-question"
                            className="p-button-text mt-2"
                            onClick={() => window.open('https://support.google.com/mail/answer/185833?hl=es', '_blank')}
                        />

                        <div className="botones-final">
                            <div className="espacio-boton">
                                <Button
                                    label="Atrás"
                                    icon="pi pi-arrow-left"
                                    className="update-button boton-atras"
                                    onClick={() => stepperRef.current.prevCallback()}
                                />
                            </div>
                            <div className="espacio-boton">
                                <Button
                                    label="Finalizar"
                                    icon="pi pi-check"
                                    className="update-button boton-finalizar"
                                    onClick={guardarEscuela}
                                    disabled={!correo || !codigoApp}
                                />
                            </div>
                        </div>
                    </StepperPanel>
                </Stepper>
            </div>
        </div>
    );
};

export default GenerarCodigo;
