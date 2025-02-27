import "./GenerarReportes.css";

const GenerarReportes = () => {
    return (
        <div className="generar-reportes-container">
            <div className="generar-reportes-content">
                <h2 className="generar-reportes-title">Generar Reportes</h2>

                <form className="generar-reportes-form">
                    <div className="generar-reportes-group">
                        <label>Nombre del Alumno</label>
                        <input type="text" placeholder="Ingrese el nombre completo" />
                    </div>

                    <div className="generar-reportes-group">
                        <label>Fecha</label>
                        <input type="date" />
                    </div>

                    <div className="generar-reportes-group">
                        <label>Motivo</label>
                        <textarea placeholder="Ingrese el motivo del reporte"></textarea>
                    </div>

                    <button className="generar-reportes-btn">Generar</button>
                </form>
            </div>
        </div>
    );
};

export default GenerarReportes;