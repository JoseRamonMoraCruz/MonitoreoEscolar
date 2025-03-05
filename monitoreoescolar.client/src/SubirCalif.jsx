import { useRef } from "react";
import "./SubirCalif.css";

const SubirCalif = () => {
    const fileInputRef = useRef(null);

    //  Función para abrir el explorador de archivos
    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="subir-page-container">

            {/* Contenido principal */}
            <div className="subir-container">
                <div className="subir-content-box">
                    {/*  Encabezado */}
                    <h2 className="subir-title">📁 Subir Calificaciones</h2>

                    {/*  Input oculto para seleccionar archivos */}
                    <input
                        type="file"
                        accept=".xlsx"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                    />

                    {/*  Botones en la parte inferior */}
                    <div className="subir-button-container">
                        <button className="btn choose-file" onClick={handleFileSelect}>
                            🗄 Elegir Archivo Excel
                        </button>
                        <button className="btn upload-data">📈 Subir Datos</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubirCalif;
