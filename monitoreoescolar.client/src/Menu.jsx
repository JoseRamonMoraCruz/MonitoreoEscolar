import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";
import perfil from "./assets/perfil.png";

const Menu = () => {
    // Datos del usuario para el modal de perfil
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
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Al montar, leemos del localStorage y mostramos el toast
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
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleInputChange = e => {
        const { name, value } = e.target;
        setEditedUser(u => ({ ...u, [name]: value }));
    };
    const handleSubmit = async e => {
        e.preventDefault();
        // lógica de actualización aquí…
        setShowModal(false);
    };

    return (
        <nav className="menu">
            <div className="logo-section">
                <img
                    src={perfil}
                    alt="Perfil"
                    className="logo"
                    onClick={handleOpenModal}
                />
            </div>

            <ul className="menu-links">
                <li><Link to="/subir-calif">Subir Calificaciones</Link></li>
                <li><Link to="/generar-reportes">Reporte de Conducta</Link></li>
                <li><Link to="/toma-de-asistencia">Toma de Asistencias</Link></li>
                <li><Link to="/agregar-alumno">Agregar Alumno</Link></li>
                <li><Link to="/lista-alumnos">Lista de Grupos</Link></li>
                <li><Link to="/">Cerrar Sesión</Link></li>
            </ul>

            {showModal && (
                <div className="perfil-modal">
                    <div className="perfil-modal-content">
                        <span className="perfil-modal-close" onClick={handleCloseModal}>X</span>
                        <h3 className="perfil-modal-h3">👤 Editar Perfil</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="perfil-field-group">
                                <label>Nombre:</label>
                                <input name="nombre" value={editedUser.nombre} onChange={handleInputChange} required />
                            </div>
                            <div className="perfil-field-group">
                                <label>Apellido Paterno:</label>
                                <input name="apellidoPaterno" value={editedUser.apellidoPaterno} onChange={handleInputChange} required />
                            </div>
                            <div className="perfil-field-group">
                                <label>Apellido Materno:</label>
                                <input name="apellidoMaterno" value={editedUser.apellidoMaterno} onChange={handleInputChange} required />
                            </div>
                            <div className="perfil-field-group">
                                <label>Correo:</label>
                                <input type="email" name="correo" value={editedUser.correo} onChange={handleInputChange} required />
                            </div>
                            <div className="perfil-field-group">
                                <label>Teléfono:</label>
                                <input name="telefono" value={editedUser.telefono} onChange={handleInputChange} required />
                            </div>
                            <div className="perfil-field-group">
                                <label>Nueva contraseña <small>(opcional)</small>:</label>
                                <input type="password" name="newPassword" value={editedUser.newPassword} onChange={handleInputChange} placeholder="Dejar vacío si no cambia" />
                            </div>
                            <div className="perfil-field-group">
                                <label>Confirmar contraseña:</label>
                                <input type="password" name="confirmPassword" value={editedUser.confirmPassword} onChange={handleInputChange} placeholder="Repite la nueva contraseña" />
                            </div>
                            <button type="submit">Actualizar</button>
                        </form>
                    </div>
                </div>
            )}
            {showToast && (
                <div className="welcome-toast">
                    ¡Bienvenido, <strong>{editedUser.nombre}</strong>!
                </div>
            )}
        </nav>
    );
};

export default Menu;