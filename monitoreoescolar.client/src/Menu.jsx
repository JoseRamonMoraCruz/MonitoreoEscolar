import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";
import "./Menu.css";
import axios from "axios";
import { Toast } from "primereact/toast";


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

    // Toast reference for notifications
    const toast = useRef(null);
    const location = useLocation();


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
                await axios.post("/api/usuarios/actualizar-password", {
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

            await axios.put("/api/usuarios/actualizar-perfil", payload);

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
                <div className="perfil-tab" onClick={() => setVisibleSidebar(true)}>
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
                </ul>
            </nav>

            <Sidebar visible={visibleSidebar} onHide={() => setVisibleSidebar(false)} position="left" className="w-full md:w-20rem lg:w-30rem perfil-sidebar">
                <h2 className="flex align-items-center gap-2 mb-4" style={{ color: "#000" }}>
                    <i className="pi pi-user" style={{ fontSize: '1.5rem', color: '#007ad9' }}></i>
                    <span className="text-xl font-bold">Editar Perfil</span>
                </h2>

                <form onSubmit={handleSubmit}>
                    {["nombre", "apellidoPaterno", "apellidoMaterno", "correo", "telefono"].map(campo => (
                        <div className="perfil-field-group" key={campo}>
                            <label>{campo.charAt(0).toUpperCase() + campo.slice(1)}:</label>
                            <input
                                name={campo}
                                value={editedUser[campo]}
                                onChange={handleInputChange}
                                required
                                type={campo === "correo" ? "email" : "text"}
                            />
                        </div>
                    ))}
                    <div className="perfil-field-group">
                        <label>Nueva contraseña:</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={editedUser.newPassword}
                            onChange={handleInputChange}
                            placeholder="Opcional"
                        />
                    </div>
                    <div className="perfil-field-group">
                        <label>Confirmar contraseña:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={editedUser.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Opcional"
                        />
                    </div>
                    <Button
                        type="submit"
                        label="Actualizar"
                        icon="pi pi-save"
                        severity="success"
                        raised
                        className="w-full mb-3"
                    />
                </form>

                <div className="cerrar-sesion-container">
                    <Button
                        icon="pi pi-sign-out"
                        label="Cerrar Sesión"
                        severity="danger"
                        outlined
                        className="w-full"
                        onClick={() => window.location.href = "/"}
                    />
                </div>
            </Sidebar>
        </>
    );
};

export default Menu;
