import { useState } from "react";
import axios from "axios";
import "./AgregarAlumno.css";
import huellaIcon from "./assets/huella-dactilar.png";
import agregarIcon from "./assets/agregar-alumno.png";

const AgregarAlumno = () => {
    // Estado para almacenar los datos del alumno
    const [alumno, setAlumno] = useState({
        nombre: "",
        apellidos: "",
        grupo: "",   // <- Usado para mandar al backend el grupo completo (ej: "1-C")
        grado: "",   // <- Para controlar el grado
        letra: "",   // <- Para controlar la letra (A, B, C...)
        tutor: "",
        domicilio: ""
    });

    // Maneja cambios en nombre, apellidos, tutor, domicilio, etc.
    const handleChange = (e) => {
        setAlumno({
            ...alumno,
            [e.target.name]: e.target.value
        });
    };

    // Maneja el cambio de Grado (ej: 1, 2, 3...)
    const handleChangeGrado = (e) => {
        const newGrado = e.target.value;
        setAlumno({
            ...alumno,
            grado: newGrado,
            // Genera el valor de 'grupo' concatenando grado y letra si ambos existen
            grupo: newGrado && alumno.letra ? `${newGrado}${alumno.letra}` : ""
        });
    };

    // Maneja el cambio de Letra (ej: A, B, C)
    const handleChangeLetra = (e) => {
        const newLetra = e.target.value;
        setAlumno({
            ...alumno,
            letra: newLetra,
            // Genera el valor de 'grupo' concatenando grado y letra si ambos existen
            grupo: alumno.grado && newLetra ? `${alumno.grado}${newLetra}` : ""
        });
    };

    //  Función para enviar los datos al backend
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto del formulario

        try {
            // Enviar datos a la API
            const response = await axios.post("http://localhost:5099/api/alumnos/registro", alumno);

            alert(response.data.mensaje); // Mostrar mensaje de éxito
            // Limpiar formulario
            setAlumno({
                nombre: "",
                apellidos: "",
                grupo: "",
                grado: "",
                letra: "",
                tutor: "",
                domicilio: ""
            });

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
                    {/* Nombre */}
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

                    {/* Apellidos */}
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

                    {/* Grado y Letra (reemplaza el input de grupo) */}
                    <div className="agregar-alumno-group-selects">
                        <div>
                            <label>Grado:</label>
                            <select
                                name="grado"
                                value={alumno.grado}
                                onChange={handleChangeGrado}
                                required
                            >
                                <option value="">Seleccione</option>
                                {[1, 2, 3, 4, 5, 6].map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Grupo:</label>
                            <select
                                name="letra"
                                value={alumno.letra}
                                onChange={handleChangeLetra}
                                required
                            >
                                <option value="">Seleccione</option>
                                {["A", "B", "C", "D", "E", "F", "G"].map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tutor */}
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

                    {/* Domicilio */}
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

                    {/* Botones */}
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
