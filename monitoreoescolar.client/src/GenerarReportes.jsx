import "./GenerarReportes.css";

const GenerarReportes = () => {
    return (
        <div className="page-container">
            <div className="container">
                <div className="content-box">
                    <h2 className="title">Reportes de Conducta</h2>

                    <form className="report-form">
                        <div className="form-group">
                            <label>Nombre del Alumno</label>
                            <input type="text" placeholder="Ingrese el nombre completo" />
                        </div>

                        <div className="form-group">
                            <label>Fecha</label>
                            <input type="date" />
                        </div>

                        <div className="form-group">
                            <label>Motivo</label>
                            <textarea placeholder="Ingrese el motivo del reporte"></textarea>
                        </div>

                        <button className="btn generate-btn">Generar</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GenerarReportes;