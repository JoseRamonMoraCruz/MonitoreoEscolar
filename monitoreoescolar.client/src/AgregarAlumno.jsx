import { useState } from "react";
import axios from "axios";
import "./AgregarAlumno.css";
import huellaIcon from "./assets/huella-dactilar.png";
import agregarIcon from "./assets/agregar-alumno.png";

const AgregarAlumno = () => {
    //  Estado para almacenar los datos del alumno
    const [alumno, setAlumno] = useState({
        nombre: "",
        apellidos: "",
        grupo: "",
        tutor: "",
        domicilio: ""
    });

    //  Función para manejar cambios en los inputs
    const handleChange = (e) => {
        setAlumno({
            ...alumno,
            [e.target.name]: e.target.value
        });
    };

    //  Función para enviar los datos al backend
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto del formulario

        try {
            //  Enviar datos a la API
            const response = await axios.post("/api/alumnos/registro", alumno);

            alert(response.data.mensaje); // Mostrar mensaje de éxito
            setAlumno({ nombre: "", apellidos: "", grupo: "", tutor: "", domicilio: "" }); // Limpiar formulario

        } catch (error) {
            console.error("Error al registrar:", error);
            alert("No se pudo registrar el alumno.");
        }
    };

    return (
        <div className="agregar-alumno-container">
            <div className="agregar-alumno-content">
                <h2 className="agregar-alumno-title">📑 Registra un Alumno</h2>
                <form onSubmit={handleSubmit}>
                    <div className="agregar-alumno-group">
                        <label>👨🏻‍🎓 Nombre:</label>
                        <input
                            type="text"
                            name="nombre"
                            value={alumno.nombre}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre"
                            required
                        />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>👨🏻‍🎓 Apellidos:</label>
                        <input
                            type="text"
                            name="apellidos"
                            value={alumno.apellidos}
                            onChange={handleChange}
                            placeholder="Ingrese los apellidos"
                            required
                        />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>📚 Grupo:</label>
                        <input
                            type="text"
                            name="grupo"
                            value={alumno.grupo}
                            onChange={handleChange}
                            placeholder="Ingrese el grupo"
                            required
                        />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>👨🏻‍🦰 Nombre del padre/madre o tutor:</label>
                        <input
                            type="text"
                            name="tutor"
                            value={alumno.tutor}
                            onChange={handleChange}
                            placeholder="Ingrese el nombre del tutor"
                            required
                        />
                    </div>

                    <div className="agregar-alumno-group">
                        <label>🏠 Domicilio:</label>
                        <input
                            type="text"
                            name="domicilio"
                            value={alumno.domicilio}
                            onChange={handleChange}
                            placeholder="Ingrese el domicilio"
                            required
                        />
                    </div>

                    <div className="button-container">
                        <button type="submit" className="agregar-alumno-btn">
                            <img src={agregarIcon} alt="Agregar" className="back-icon" />
                            Agregar Alumno
                        </button>
                        <button type="button" className="capturar-huella-btn">
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
