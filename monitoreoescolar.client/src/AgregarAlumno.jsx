import "./AgregarAlumno.css";

const AgregarAlumno = () => {
    return (
        <div className="page-container">
            <div className="container">
                <div className="content-box">
                    <h2 className="title">Registra un Alumno</h2>
                    <form>
                        <div className="form-group">
                            <label>Nombre:</label>
                            <input type="text" placeholder="Ingrese el nombre" />
                        </div>

                        <div className="form-group">
                            <label>Apellidos:</label>
                            <input type="text" placeholder="Ingrese los apellidos" />
                        </div>

                        <div className="form-group">
                            <label>Grupo:</label>
                            <input type="text" placeholder="Ingrese el grupo" />
                        </div>

                        <div className="form-group">
                            <label>Nombre del padre/madre o tutor:</label>
                            <input type="text" placeholder="Ingrese el nombre del tutor" />
                        </div>

                        {/* ✅ Apartado para el registro de huella */}
                        <div className="form-group">
                            <label>NOTA: Registra su huella dactilar en el sensor antes de guardar.</label>

                        </div>

                        <button type="button" className="btn save-btn">Guardar</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarAlumno;
