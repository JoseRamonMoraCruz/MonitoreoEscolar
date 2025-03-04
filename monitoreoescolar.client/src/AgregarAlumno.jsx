import "./AgregarAlumno.css";
import huellaIcon from "./assets/huella-dactilar.png";
import agregarIcon from "./assets/agregar-alumno.png";

const AgregarAlumno = () => {
    return (
        <div className="agregar-alumno-container">
            <div className="agregar-alumno-content">
                <h2 className="agregar-alumno-title">📑 Registra un Alumno</h2>
                <form>
                    <div className="agregar-alumno-group">
                        <label>👨🏻‍🎓 Nombre:</label>
                        <input type="text" placeholder="Ingrese el nombre" />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>👨🏻‍🎓 Apellidos:</label>
                        <input type="text" placeholder="Ingrese los apellidos" />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>📚 Grupo:</label>
                        <input type="text" placeholder="Ingrese el grupo" />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>👨🏻‍🦰 Nombre del padre/madre o tutor:</label>
                        <input type="text" placeholder="Ingrese el nombre del tutor" />
                    </div>

                    {/* 🔹 Nuevo campo de domicilio */}
                    <div className="agregar-alumno-group">
                        <label>🏠 Domicilio:</label>
                        <input type="text" placeholder="Ingrese el domicilio" />
                    </div>

                    <div className="button-container">
                        <button className="agregar-alumno-btn">
                            <img src={agregarIcon} alt="Agregar" className="back-icon" />
                            Agregar Alumno
                        </button>
                        <button className="capturar-huella-btn">
                            <img src={huellaIcon} alt="Huella" className="back-icon" />
                            Registrar Huella
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgregarAlumno;