import { Routes, Route } from "react-router-dom";
import Login from "./Iniciosesion";
import Registro from "./Registro";
import SubirCalif from "./SubirCalif";
import GenerarReportes from "./GenerarReportes";
import Menu from "./Menu";
import AgregarAlumno from "./AgregarAlumno";
import Notificaciones from "./Notificaciones";
import Padre from "./Padre";

function App() {
    return (
        <>
            {/* Rutas públicas */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                {/*  Rutas privadas con el menú persistente */}
                <Route path="/*" element={<DashboardLayout />} />
            </Routes>
        </>
    );
}

//Funcion para que el menu sea visible en todas las pestañas
function DashboardLayout() {
    return (
        <>
            <Menu /> {/* Este menú siempre estará visible */}
            <Routes>
                <Route path="/subir-calif" element={<SubirCalif />} />
                <Route path="/generar-reportes" element={<GenerarReportes />} />
                <Route path="/agregar-alumno" element={<AgregarAlumno />} />
                <Route path="/notificaciones" element={<Notificaciones />} />
                <Route path= "/padre" element={<Padre />} />
            </Routes> 
        </>
    );
}

export default App;


