import "./Notificaciones.css";

const Notificaciones = () => {
    return (
        <div className="notificaciones-container">
            <div className="notificaciones-content">
                <h2 className="notificaciones-title">Notificaciones</h2>

                <div className="notificaciones-search-container">
                    <input type="text" placeholder="Buscar padre de familia" />
                    <button className="notificaciones-search-button">🔍</button>
                </div>

                <div className="notificaciones-result-container">
                    <p><strong>Julia Marquez Martines</strong> -------------- <strong>443 ***</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Notificaciones;
