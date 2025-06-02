import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ActualizarPassword.css';
import { useNavigate } from 'react-router-dom';
import AtrasIcon from './assets/flecha-hacia-atras.png';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';

function ActualizarPassword() {
    const [correo, setCorreo] = useState('');
    const [codigo, setCodigo] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [contador, setContador] = useState(0);
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const navigate = useNavigate();
    const stepperRef = useRef(null);
    const toast = useRef(null);

    const [loadingEnviar, setLoadingEnviar] = useState(false);
    const [loadingConfirmar, setLoadingConfirmar] = useState(false);
    const [loadingActualizar, setLoadingActualizar] = useState(false);
    const [segundosRestantes, setSegundosRestantes] = useState(3);

    useEffect(() => {
        if (contador > 0) {
            const timer = setTimeout(() => setContador(contador - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [contador]);

    const mostrarError = (mensaje) => {
        toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: mensaje,
            life: 3000
        });
    };

    const mostrarRedireccion = () => {
        setSegundosRestantes(3); // reinicia a 3 cada vez que se llama

        toast.current.show({
            sticky: true,
            content: (
                <div
                    className="flex flex-column align-items-start text-white"
                    style={{
                        flex: 1,
                        backgroundColor: 'green',
                        borderRadius: '10px',
                        padding: '1rem',
                        boxShadow: '0 4px 12px darkgreen',
                        width: '100%',
                    }}
                >
                    <div className="flex align-items-center gap-2 mb-2">
                        <span className="font-bold text-white">Sistema Escolar</span>
                    </div>
                    <div className="font-medium text-lg mb-3 text-white">
                        Contraseña actualizada exitosamente. Redirigiendo en {segundosRestantes} segundos...
                    </div>
                   
                </div>
            )
        });

        const interval = setInterval(() => {
            setSegundosRestantes(prev => {
                if (prev === 1) {
                    clearInterval(interval);
                    toast.current.clear();
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="update-container-wrapper">
            <Toast ref={toast} position="top-center" />
            <div className="update-box">
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src={AtrasIcon} alt="Volver" className="back-icon" />
                </button>

                <h2 className="register-title">Actualizar Contraseña</h2>

                <Stepper ref={stepperRef} linear style={{ marginTop: '30px' }}>
                    {/* PASO 1 */}
                    <StepperPanel header="Correo">
                        <label>Ingresa el Correo Electrónico:</label>
                        <InputText
                            type="email"
                            className="update-input w-full"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                        <Button
                            label="Enviar"
                            icon="pi pi-arrow-right"
                            className="update-button"
                            loading={loadingEnviar}
                            onClick={async () => {
                                try {
                                    setLoadingEnviar(true);
                                    await axios.post('http://localhost:5099/api/usuarios/enviar-codigo', { correo });
                                    setContador(15);
                                    stepperRef.current.nextCallback();
                                } catch (err) {
                                    mostrarError(err.response?.data?.mensaje || "Error al enviar código.");
                                } finally {
                                    setLoadingEnviar(false);
                                }
                            }}
                        />
                    </StepperPanel>

                    {/* PASO 2 */}
                    <StepperPanel header="Código">
                        <label>Ingresa código de verificación:</label>
                        <InputText
                            value={codigo}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d{0,6}$/.test(val)) setCodigo(val);
                            }}
                            maxLength={6}
                            className="update-input"
                            placeholder="######"
                        />

                        {codigo && codigo.length < 6 && (
                            <p className="error-message">El código debe tener 6 dígitos.</p>
                        )}

                        {contador > 0 ? (
                            <p>Reenviar código en: <span style={{ color: 'red' }}>{contador}s</span></p>
                        ) : (
                            <Button
                                label="Reenviar Código"
                                className="update-button"
                                onClick={async () => {
                                    await axios.post('http://localhost:5099/api/usuarios/enviar-codigo', { correo });
                                    setContador(15);
                                }}
                            />
                        )}

                        <div className="flex pt-3 justify-content-between">
                            <Button label="Atrás" icon="pi pi-arrow-left" onClick={() => stepperRef.current.prevCallback()} />
                            <Button
                                label="Confirmar Código"
                                icon="pi pi-check"
                                loading={loadingConfirmar}
                                disabled={codigo.length !== 6}
                                onClick={async () => {
                                    try {
                                        setLoadingConfirmar(true);
                                        await axios.post('http://localhost:5099/api/usuarios/validar-codigo', {
                                            correo,
                                            codigo: codigo.replace(/\s/g, '')
                                        });
                                        stepperRef.current.nextCallback();
                                    } catch (err) {
                                        mostrarError(err.response?.data?.mensaje || "Error al validar código.");
                                    } finally {
                                        setLoadingConfirmar(false);
                                    }
                                }}
                            />
                        </div>
                    </StepperPanel>

                    {/* PASO 3 */}
                    <StepperPanel header="Nueva Contraseña">
                        <label>Nueva contraseña:</label>

                        <Password
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            toggleMask
                            feedback
                            className="update-input full-width-password"
                            header={<div className="font-bold mb-3">Elige una contraseña segura</div>}
                            footer={
                                <>
                                    <Divider />
                                    <p className="mt-2">Sugerencias</p>
                                    <ul className="pl-2 ml-2 mt-0 line-height-3">
                                        <li>Al menos una minúscula</li>
                                        <li>Al menos una mayúscula</li>
                                        <li>Al menos un número</li>
                                        <li>Mínimo 8 caracteres</li>
                                    </ul>
                                </>
                            }
                        />

                        <label>Confirmar contraseña:</label>
                        <Password
                            value={confirmarPassword}
                            onChange={(e) => setConfirmarPassword(e.target.value)}
                            toggleMask
                            className="update-input full-width-password"
                        />

                        {confirmarPassword && newPassword !== confirmarPassword && (
                            <p className="error-message">❌ Las contraseñas no coinciden.</p>
                        )}

                        <div className="flex pt-3 justify-content-between">
                            <Button label="Atrás" icon="pi pi-arrow-left" onClick={() => stepperRef.current.prevCallback()} />
                            <Button
                                label="Actualizar Contraseña"
                                icon="pi pi-check"
                                loading={loadingActualizar}
                                disabled={!newPassword || newPassword !== confirmarPassword}
                                onClick={async () => {
                                    try {
                                        setLoadingActualizar(true);
                                        await axios.post('http://localhost:5099/api/usuarios/actualizar-password', {
                                            correo,
                                            newPassword
                                        });
                                        mostrarRedireccion();
                                    } catch (err) {
                                        mostrarError(err.response?.data?.mensaje || "Error al actualizar contraseña.");
                                    } finally {
                                        setLoadingActualizar(false);
                                    }
                                }}
                            />
                        </div>
                    </StepperPanel>
                </Stepper>
            </div>
        </div>
    );
}

export default ActualizarPassword;
