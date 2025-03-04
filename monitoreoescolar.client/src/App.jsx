import { Routes, Route } from "react-router-dom";
import Login from "./Iniciosesion";
import Registro from "./Registro";
import SubirCalif from "./SubirCalif";
import GenerarReportes from "./GenerarReportes";
import Menu from "./Menu";
import AgregarAlumno from "./AgregarAlumno";
import Notificaciones from "./Notificaciones";
import Padre from "./Padre";
import ActualizarPassword from './ActualizarPassword';
import ListaAlumnos from "./ListaAlumnos";

function App() {
    return (
        <>
            {/* Rutas públicas */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/padre" element={<Padre />} />
                <Route path="/actualizar-password" element={<ActualizarPassword />} />

                {/*  Rutas privadas con el menú persistente */}
                <Route path="/*" element={<DashboardLayout />} />
            </Routes>
        </>
    );
}

//Funcion para que el menu sea visible en todas las pestañas
function DashboardLayout() {
    return (
        <div className="dashboard-container">
            <Menu /> {/* ✅ Asegura que el menú siempre esté presente */}
            <div className="content">
                <Routes>
                    <Route path="/subir-calif" element={<SubirCalif />} />
                    <Route path="/generar-reportes" element={<GenerarReportes />} />
                    <Route path="/agregar-alumno" element={<AgregarAlumno />} />
                    <Route path="/lista-alumnos" element={<ListaAlumnos />} />
                    <Route path="/notificaciones" element={<Notificaciones />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
