import "./SubirCalif.css";

const SubirCalif = () => {
    return (
        <div className="subir-page-container">

            {/* Contenido principal */}
            <div className="subir-container">
                <div className="subir-content-box">
                    {/* ✅ Encabezado */}
                    <h2 className="subir-title">Subir Calificaciones</h2>

                    {/* ✅ Botones en la parte inferior */}
                    <div className="subir-button-container">
                        <button className="btn choose-file">Elegir Archivo Excel</button>
                        <button className="btn upload-data">Subir Datos</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubirCalif;