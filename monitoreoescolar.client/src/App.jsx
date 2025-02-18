import { Routes, Route } from "react-router-dom";
import Login from "./Iniciosesion";
import Registro from "./Registro";
{/* 
import SubirCalif from "./SubirCalif";
import GenerarReportes from "./GenerarReportes";
import Menu from "./Menu";
import AgregarAlumno from "./AgregarAlumno";
import Notificaciones from "./Notificaciones"; */}

function App() {
    return (
        <>
            {/* Rutas para Login y Registro (Inicialmente estas serán las únicas visibles) */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
            </Routes>

            {/* Rutas para el sistema (Se activarán después del login) */}
            {/* De momento no se mostrarán porque aún no se ha implementado el login */}
            {/* <Menu /> 
            <Routes>
                <Route path="/subir-calif" element={<SubirCalif />} />
                <Route path="/generar-reportes" element={<GenerarReportes />} />
                <Route path="/agregar-alumno" element={<AgregarAlumno />} />
                <Route path="/notificaciones" element={<Notificaciones />} />
            </Routes> */}
        </>
    );
}

export default App;

