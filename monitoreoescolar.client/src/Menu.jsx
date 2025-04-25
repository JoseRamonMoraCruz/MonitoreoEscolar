import { Link } from "react-router-dom";
import "./Menu.css";
import Logo from "./assets/logo.png";

const Menu = () => {
    return (
        <nav className="menu">
            <div className="logo-section">
                <img src={Logo} alt="Logo" className="logo" />
            </div>
            <ul className="menu-links">
                <li><Link to="/subir-calif">Subir Calificaciones</Link></li>
                <li><Link to="/generar-reportes">Reporte de Conducta</Link></li>
                <li><Link to="/notificaciones">Envío de Notificaciones</Link></li>
                <li><Link to="/agregar-alumno">Agregar Alumno</Link></li>
                <li><Link to="/lista-alumnos">Lista de Grupos</Link></li>
                <li><Link to="/">Cerrar Sesión</Link></li>
            </ul>
        </nav>
    );
};

export default Menu;