import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";
import "./Menu.css";
import axios from "axios";
import { Toast } from "primereact/toast";
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { cambiarTema } from './themeSwitcher';


const Menu = () => {
    const [editedUser, setEditedUser] = useState({
        id_Usuario: "",
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        correo: "",
        telefono: "",
        newPassword: "",
        confirmPassword: ""
    });
    // State to control the visibility of the sidebar
    const [visibleSidebar, setVisibleSidebar] = useState(false);
    const [codigoEscuela, setCodigoEscuela] = useState(localStorage.getItem("codigoEscuela") || "No asignado");

    // Toast reference for notifications
    const toast = useRef(null);
    const location = useLocation();

    // justo dentro del componente Menu:
    const [modoOscuro, setModoOscuro] = useState(
        localStorage.getItem('temaPreferido')?.includes('dark')
    );

    const toggleTema = () => {
        const nuevoTema = modoOscuro ? 'lara-light-blue' : 'lara-dark-indigo';
        cambiarTema(nuevoTema);
        setModoOscuro(!modoOscuro);
    };
    useEffect(() => {
        setEditedUser({
            id_Usuario: localStorage.getItem("idUsuario") || "",
            nombre: localStorage.getItem("nombre") || "",
            apellidoPaterno: localStorage.getItem("apellidoPaterno") || "",
            apellidoMaterno: localStorage.getItem("apellidoMaterno") || "",
            correo: localStorage.getItem("correo") || "",
            telefono: localStorage.getItem("telefono") || "",
            newPassword: "",
            confirmPassword: ""
        });

        setCodigoEscuela(localStorage.getItem("codigoEscuela") || "No asignado");
    }, []);


    const handleInputChange = e => {
        const { name, value } = e.target;
        setEditedUser(u => ({ ...u, [name]: value }));
    };

    const toastShownRef = useRef(false);

    useEffect(() => {
        if (location.state?.mensajeBienvenida && !toastShownRef.current) {
            toast.current?.show({
                severity: 'success',
                summary: 'Inicio de sesión',
                detail: location.state.mensajeBienvenida,
                life: 3000
            });

            toastShownRef.current = true;

            // Borra el estado de navegación sin recargar
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleSubmit = async e => {
        e.preventDefault();

        if (editedUser.newPassword && editedUser.newPassword !== editedUser.confirmPassword) {
            toast.current?.show({
                severity: "warn",
                summary: "Contraseñas no coinciden",
                detail: "Debes ingresar contraseñas iguales.",
                life: 3000
            });
            return;
        }

        try {
            if (editedUser.newPassword) {
                await axios.post("http://localhost:5099/api/usuarios/actualizar-password", {
                    correo: editedUser.correo,
                    NewPassword: editedUser.newPassword
                });
            }

            const payload = {
                Id_Usuario: editedUser.id_Usuario,
                Nombre: editedUser.nombre,
                ApellidoPaterno: editedUser.apellidoPaterno,
                ApellidoMaterno: editedUser.apellidoMaterno,
                Correo: editedUser.correo,
                Telefono: editedUser.telefono
            };

            await axios.put("http://localhost:5099/api/usuarios/actualizar-perfil", payload);

            localStorage.setItem("nombre", editedUser.nombre);
            localStorage.setItem("apellidoPaterno", editedUser.apellidoPaterno);
            localStorage.setItem("apellidoMaterno", editedUser.apellidoMaterno);
            localStorage.setItem("correo", editedUser.correo);
            localStorage.setItem("telefono", editedUser.telefono);

            setVisibleSidebar(false);
            toast.current?.show({
                severity: "success",
                summary: "Perfil actualizado",
                detail: "Tus datos se guardaron correctamente.",
                life: 3000
            });
        } catch {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo actualizar el perfil.",
                life: 3000
            });
        }
    };

    const items = [
        {
            label: 'Perfil',
            template: () => (
                <div className="perfil-tab" onClick={() => {
                    setCodigoEscuela(localStorage.getItem("codigoEscuela") || "No asignado");
                    setVisibleSidebar(true);
                }}>
                    <div className="perfil-icono-circular">
                        <i className="pi pi-user perfil-icono-interno"></i>
                    </div>
                    <span className="perfil-tab-texto">Perfil</span>
                </div>
            )
        }
    ];

    return (
        <>
            <Toast ref={toast} />
            <nav className="menu">
                <TabMenu model={items} className="custom-tabmenu" />
                <ul className="menu-links">
                    <li><Link to="/subir-calif">Subir Calificaciones</Link></li>
                    <li><Link to="/generar-reportes">Reporte de Conducta</Link></li>
                    <li><Link to="/toma-de-asistencia">Toma de Asistencias</Link></li>
                    <li><Link to="/agregar-alumno">Agregar Alumno</Link></li>
                    <li><Link to="/lista-alumnos">Lista de Grupos</Link></li>
                    <Button
                        label={modoOscuro ? "" : ""}
                        icon={modoOscuro ? "pi pi-sun" : "pi pi-moon"}
                        severity="secondary"
                        onClick={toggleTema}
                        className="ml-2"
                    />
                </ul>
            </nav>

            <Sidebar visible={visibleSidebar} onHide={() => setVisibleSidebar(false)} position="left" className="w-full md:w-20rem lg:w-30rem perfil-sidebar">
                <h2 className="flex align-items-center gap-2 mb-4" style={{ color: "#000" }}>
                    <i className="pi pi-user" style={{ fontSize: '1.5rem', color: '#007ad9' }}></i>
                    <span className="text-xl font-bold">Editar Perfil</span>
                </h2>

                <div className="flex align-items-center gap-2 mb-4">
                    <span className="text-sm text-700">Código Escuela:</span>
                    <span className="font-bold text-primary">{codigoEscuela}</span>
                    <Button icon="pi pi-copy" rounded text severity="secondary" onClick={() => {
                        navigator.clipboard.writeText(localStorage.getItem("codigoEscuela") || "");
                        toast.current?.show({
                            severity: "info",
                            summary: "Copiado",
                            detail: "Código de escuela copiado al portapapeles",
                            life: 2000
                        });
                    }} />
                </div>

                <form onSubmit={handleSubmit} className="p-fluid">
                    <Divider align="left">
                        <span className="text-lg font-medium text-900">
                            <i className="pi pi-user-edit" style={{ marginRight: '6px' }}></i>
                            Información Personal
                        </span>
                    </Divider>

                    <div className="field">
                        <label htmlFor="nombre">Nombre</label>
                        <InputText id="nombre" name="nombre" value={editedUser.nombre} onChange={handleInputChange} />
                    </div>

                    <div className="field">
                        <label htmlFor="apellidoPaterno">Apellido Paterno</label>
                        <InputText id="apellidoPaterno" name="apellidoPaterno" value={editedUser.apellidoPaterno} onChange={handleInputChange} />
                    </div>

                    <div className="field">
                        <label htmlFor="apellidoMaterno">Apellido Materno</label>
                        <InputText id="apellidoMaterno" name="apellidoMaterno" value={editedUser.apellidoMaterno} onChange={handleInputChange} />
                    </div>

                    <Divider align="left">
                        <span className="text-lg font-medium text-900">
                            <i className="pi pi-envelope" style={{ marginRight: '6px' }}></i>
                            Contacto
                        </span>
                    </Divider>

                    <div className="field">
                        <label htmlFor="correo">Correo Electrónico</label>
                        <InputText id="correo" name="correo" value={editedUser.correo} onChange={handleInputChange} type="email" />
                    </div>

                    <div className="field">
                        <label htmlFor="telefono">Teléfono</label>
                        <InputText id="telefono" name="telefono" value={editedUser.telefono} onChange={handleInputChange} />
                    </div>

                    <Divider align="left">
                        <span className="text-lg font-medium text-900">
                            <i className="pi pi-lock" style={{ marginRight: '6px' }}></i>
                            Cambiar Contraseña (opcional)
                        </span>
                    </Divider>

                    <div className="field">
                        <label htmlFor="newPassword">Nueva Contraseña</label>
                        <InputText id="newPassword" name="newPassword" value={editedUser.newPassword} onChange={handleInputChange} type="password" />
                    </div>

                    <div className="field">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <InputText id="confirmPassword" name="confirmPassword" value={editedUser.confirmPassword} onChange={handleInputChange} type="password" />
                    </div>

                    <div className="flex flex-column gap-2 mt-4">
                        <Button type="submit" label="Actualizar Perfil" icon="pi pi-save" severity="success" className="w-full" />
                        <Button
                            label="Cerrar Sesión"
                            icon="pi pi-sign-out"
                            severity="danger"
                            outlined
                            className="w-full"
                            onClick={() => {
                                localStorage.clear(); // Limpia todo, incluyendo escuelaId y codigoEscuela
                                window.location.href = "/"; // Redirige al inicio
                            }}
                        />
                    </div>
                </form>
            </Sidebar>
        </>
    );
};

export default Menu;
