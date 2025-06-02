import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import './index.css';
import App from './App.jsx'; 
// Estilos de PrimeReact (IMPORTANTE)
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Puedes cambiar el tema
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// PrimeFlex (ya lo tienes instalado)
import 'primeflex/primeflex.css';


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>  
            <App />
        </BrowserRouter>
    </StrictMode>
);

