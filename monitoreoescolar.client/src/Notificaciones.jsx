import "./Notificaciones.css";

const Notificaciones = () => {
    return (
        <div className="page-container">
            <div className="container">
                <div className="content-box">
                    <h2 className="title">Notificaciones</h2>

                    {/* Campo de búsqueda con botón */}
                    <div className="search-container">
                        <input type="text" placeholder="Buscar padre de familia" />
                        <button className="search-button">🔍</button>
                    </div>

                    {/* Resultado de búsqueda (simulado) */}
                    <div className="result-container">
                        <p><strong>Julia Marquez Martines</strong> -------------- <strong>443 ***</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notificaciones;