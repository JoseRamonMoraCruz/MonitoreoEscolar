import { Routes, Route } from 'react-router-dom';
import Login from './Iniciosesion';
import Registro from './Registro';
import Padre from './Padre'; // Importa el componente Padre

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/padre" element={<Padre />} />  {/* Nueva Ruta para la vista Padre */}
        </Routes>
    );
}

export default App;
