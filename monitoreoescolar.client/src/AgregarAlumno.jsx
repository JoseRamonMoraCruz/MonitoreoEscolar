import { useState, useEffect } from "react";
import axios from "axios";
import "./AgregarAlumno.css";
import huellaIcon from "./assets/huella-dactilar.png";
import agregarIcon from "./assets/agregar-alumno.png";

const AgregarAlumno = () => {
    // Estado para almacenar los datos del alumno
    const [alumno, setAlumno] = useState({
        nombre: "",
        apellidos: "",
        grupo: "",   // Se genera automáticamente (ej: "1A")
        grado: "",   // Para controlar el grado
        letra: "",   // Para controlar la letra (A, B, C, …)
        tutor: "",
        domicilio: "",
        tutorId: null // Nuevo campo para almacenar el Id_Usuario del padre
    });

    // Estado para almacenar la lista de padres disponibles en el sistema
    const [padres, setPadres] = useState([]);

    // Al montar el componente, obtener la lista de padres (tipo "Padre")
    useEffect(() => {
        const fetchPadres = async () => {
            try {
                // Ajusta la URL según tu API real para obtener solo los padres
                const response = await axios.get("/api/usuarios/padres");
                setPadres(response.data);
            } catch (error) {
                console.error("Error al obtener la lista de padres:", error);
            }
        };
        fetchPadres();
    }, []);

    // Maneja cambios en nombre, apellidos, tutor, domicilio, etc.
    const handleChange = (e) => {
        setAlumno({
            ...alumno,
            [e.target.name]: e.target.value
        });
    };

    // Maneja el cambio de Grado (ej: 1, 2, 3, …)
    const handleChangeGrado = (e) => {
        const newGrado = e.target.value;
        setAlumno({
            ...alumno,
            grado: newGrado,
            // Genera el valor de 'grupo' concatenando grado y letra si ambos existen
            grupo: newGrado && alumno.letra ? `${newGrado}${alumno.letra}` : ""
        });
    };

    // Maneja el cambio de Letra (ej: A, B, C, …)
    const handleChangeLetra = (e) => {
        const newLetra = e.target.value;
        setAlumno({
            ...alumno,
            letra: newLetra,
            // Genera el valor de 'grupo' concatenando grado y letra si ambos existen
            grupo: alumno.grado && newLetra ? `${alumno.grado}${newLetra}` : ""
        });
    };

    // Maneja la selección del padre en el <select>
    const handleChangePadre = (e) => {
        // Guardamos el Id_Usuario del padre seleccionado
        const selectedTutorId = e.target.value ? parseInt(e.target.value) : null;
        setAlumno({ ...alumno, tutorId: selectedTutorId });
    };

    // Función para enviar los datos al backend
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el comportamiento por defecto del formulario

        // Verificar que el grupo seleccionado exista
        try {
            const gruposResponse = await axios.get("/api/grupos");
            const gruposExistentes = gruposResponse.data;
            // Buscamos un grupo cuyo grado y letra concuerde con el alumno
            const grupoEncontrado = gruposExistentes.find(
                (g) =>
                    g.grado.toString() === alumno.grado &&
                    g.letra.toUpperCase() === alumno.letra.toUpperCase()
            );

            if (!grupoEncontrado) {
                alert("❌ El grupo seleccionado no ha sido creado. Por favor, cree el grupo antes de registrar al alumno.");
                return;
            }
        } catch (error) {
            console.error("Error al verificar grupos:", error);
            alert("❌ No se pudo verificar la existencia del grupo.");
            return;
        }

        // Si el grupo existe, enviamos los datos del alumno al backend
        try {
            // Enviamos todos los datos, incluyendo tutorId
            const response = await axios.post("/api/alumnos/registro", alumno);
            alert(response.data.mensaje); // Mostrar mensaje de éxito

            // Limpiar formulario
            setAlumno({
                nombre: "",
                apellidos: "",
                grupo: "",
                grado: "",
                letra: "",
                tutor: "",
                domicilio: "",
                tutorId: null
            });
        } catch (error) {
            console.error("Error al registrar:", error);
            alert("❌ No se pudo registrar al alumno.");
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

                    {/* Tutor (string) */}
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

                    {/* NUEVO: Seleccionar padre/tutor (opcional) */}
                    <div className="agregar-alumno-group">
                        <label>Seleccionar padre registrado (opcional):</label>
                        <select
                            name="tutorId"
                            value={alumno.tutorId || ""}
                            onChange={handleChangePadre}
                        >
                            <option value="">-- Ninguno --</option>
                            {padres.map((padre) => (
                                <option key={padre.id_Usuario} value={padre.id_Usuario}>
                                    {padre.nombre} {padre.apellidos} - {padre.correo}
                                </option>
                            ))}
                        </select>
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
