import "./AgregarAlumno.css";

const AgregarAlumno = () => {
    return (
        <div className="agregar-alumno-container">
            <div className="agregar-alumno-content">
                <h2 className="agregar-alumno-title">Registra un Alumno</h2>
                <form>
                    <div className="agregar-alumno-group">
                        <label>Nombre:</label>
                        <input type="text" placeholder="Ingrese el nombre" />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>Apellidos:</label>
                        <input type="text" placeholder="Ingrese los apellidos" />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>Grupo:</label>
                        <input type="text" placeholder="Ingrese el grupo" />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>Nombre del padre/madre o tutor:</label>
                        <input type="text" placeholder="Ingrese el nombre del tutor" />
                    </div>

                    <div className="agregar-alumno-group">
                        <label className="nota">
                            NOTA: Registra su huella dactilar en el sensor antes de guardar.
                        </label>
                    </div>

                    <button type="button" className="agregar-alumno-btn">
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgregarAlumno;
