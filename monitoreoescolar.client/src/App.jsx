import { Routes, Route } from "react-router-dom";
import Login from "./Iniciosesion";
import Registro from "./Registro";
import SubirCalif from "./SubirCalif";
import GenerarReportes from "./GenerarReportes";
import Menu from "./Menu";
import AgregarAlumno from "./AgregarAlumno";
import Padre from "./Padre";
import ActualizarPassword from './ActualizarPassword';
import ListaAlumnos from "./ListaAlumnos";
import TomaAsistencia from "./TomaAsistencia";


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
        <div className="dashboard-layout">
            <Menu />
            <div className="main-content">
                <Routes>
                    <Route path="/subir-calif" element={<SubirCalif />} />
                    <Route path="/generar-reportes" element={<GenerarReportes />} />
                    <Route path="/toma-de-asistencia" element={<TomaAsistencia />} />
                    <Route path="/agregar-alumno" element={<AgregarAlumno />} />
                    <Route path="/lista-alumnos" element={<ListaAlumnos />} />
                    <Route path="/TomaDeAsistencia" element={<TomaAsistencia />} />
                </Routes>
            </div>
        </div>
    );
}



export default App;
