import { Link } from "react-router-dom";
import "./Menu.css"; // Estilos del menú

const Menu = () => {
    return (
        <>
            <nav className="menu">
                <ul>
                    <li><Link to="/subir-calif">Subir calificaciones</Link></li>
                    <li><Link to="/generar-reportes">Reporte de Conducta</Link></li>
                    <li><Link to="/notificaciones">Envio de notificaciones</Link></li>
                    <li><Link to="agregar-alumno">Agregar Alumno</Link></li>
                </ul>
            </nav>
        </>
    );
};

export default Menu;