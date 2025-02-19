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
            {/* Rutas  para Login y Registro (Inicialmente estas ser�n las �nicas visibles) */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
            </Routes>

            {/* Rutas para el sistema (Se activar�n despu�s del login) */}
            {/* De momento no se mostrar�n porque a�n no se ha implementado el login */}
            {/* <Menu /> 
            <Routes>
                <Route path="/subir-calif" element={<SubirCalif />} />
                <Route path="/generar-reportes" element={<GenerarReportes />} />
                <Route path="/agregar-alumno" element={<AgregarAlumno />} />
                <Route path="/notificaciones" element={<Notificaciones />} />
                <Route path= "/padre" element={<Padre />} />"
            </Routes> */}
        </>
    );
}

export default App;

