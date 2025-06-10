import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// ❌ NO IMPORTES directamente el tema
// import 'primereact/resources/themes/lara-light-indigo/theme.css';

// ✅ Mantén estas tres:
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// ✅ Carga el tema guardado si existe
const temaGuardado = localStorage.getItem('temaPreferido') || 'lara-light-blue';
const enlaceTema = document.getElementById('theme-link');
if (enlaceTema) {
    enlaceTema.href = `https://unpkg.com/primereact/resources/themes/${temaGuardado}/theme.css`;
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);
