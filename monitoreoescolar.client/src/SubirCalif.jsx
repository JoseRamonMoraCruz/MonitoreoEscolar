import "./SubirCalif.css";

const SubirCalif = () => {
    return (
        <div className="page-container">

            {/* Contenido principal */}
            <div className="container">
                <div className="content-box">
                    {/* ✅ Encabezado */}
                    <h2 className="title">Subir Calificaciones</h2>

                    {/* ✅ Botones en la parte inferior */}
                    <div className="button-container">
                        <button className="btn choose-file">Elegir Archivo</button>
                        <button className="btn upload-data">Cargar Datos</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubirCalif;