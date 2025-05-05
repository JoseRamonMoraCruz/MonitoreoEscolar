import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import "./AgregarAlumno.css";
import huellaIcon from "./assets/huella-dactilar.png";
import agregarIcon from "./assets/agregar-alumno.png";

const AgregarAlumno = () => {
    // Estado para almacenar los datos del alumno
    const [alumno, setAlumno] = useState({
        nombre: "",
        apellidos: "",
        grupo: "",
        grado: "",
        letra: "",
        tutor: "",
        domicilio: "",
        tutorId: null,
        huellaCodigo: "",
        CURP: "",
        NumeroControl: "",
        Carrera: "",
        Plantel: "",
        Turno: "",
        Generacion: "",
        Ciclo: ""
    });


    const [tutorOptions, setTutorOptions] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);

    // Estado para mostrar el modal
    const [showModal, setShowModal] = useState(false);

    // Estado para mostrar el status y el código de la huella
    const [huellaStatus, setHuellaStatus] = useState("");
    const [huellaCodigo, setHuellaCodigo] = useState("");

    const handleOpenModal = () => {
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
    };
    // Simular la captura de huella (esto debe reemplazarse con la lógica de un lector real)
    const handleCaptureHuella = () => {
        setHuellaStatus("Huella capturada correctamente");
        setHuellaCodigo("9377378382929938-ab10-48bf"); // Simula un código de huella
        setShowModal(false); // Cierra el modal cuando se captura la huella
        setAlumno({ ...alumno, huellaCodigo: "9377378382929938-ab10-48bf" }); // Refleja el código en el campo
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Convertir CURP a mayúsculas automáticamente
        const valorFinal = name === "CURP" ? value.toUpperCase() : value;

        setAlumno({
            ...alumno,
            [name]: valorFinal
        });
    };


    const handleChangeGrado = (e) => {
        const newGrado = e.target.value;
        setAlumno({
            ...alumno,
            grado: newGrado,
            grupo: newGrado && alumno.letra ? `${newGrado}${alumno.letra}` : ""
        });
    };

    // Maneja el cambio de Letra 
    const handleChangeLetra = (e) => {
        const newLetra = e.target.value;
        setAlumno({
            ...alumno,
            letra: newLetra,
            grupo: alumno.grado && newLetra ? `${alumno.grado}${newLetra}` : ""
        });
    };

    // Función para buscar padres en base al término ingresado (autocompletado)
    const fetchTutorOptions = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) {
            setTutorOptions([]);
            return;
        }
        try {
            const response = await axios.get(`/api/usuarios/autocompletePadres?termino=${inputValue}`);
            const optionsData = response.data.map((padre) => ({
                value: padre.id_Usuario,
                label: `${padre.nombre} ${padre.apellidos} - ${padre.correo}`
            }));
            setTutorOptions(optionsData);
        } catch (error) {
            console.error("Error al buscar padres:", error);
        }
    };

    // Maneja el cambio de texto en el autocompletado
    const handleTutorInputChange = (inputValue, { action }) => {
        if (action === "input-change") {
            fetchTutorOptions(inputValue);
            return inputValue;
        }
        return inputValue;
    };

    // Maneja la selección del tutor en el autocompletado
    const handleTutorChangeSelect = (selectedOption) => {
        setSelectedTutor(selectedOption);
        setAlumno({ ...alumno, tutorId: selectedOption ? selectedOption.value : null });
    };

    // Función para enviar los datos del alumno al backend
    const handleSubmit = async (e) => {

        e.preventDefault();

        // Verificar que el grupo seleccionado exista
        try {
            const gruposResponse = await axios.get("/api/grupos");
            const gruposExistentes = gruposResponse.data;
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

        try {
            const response = await axios.post("/api/alumnos/registro", alumno);
            alert(response.data.mensaje);

            // Limpiar formulario
            setAlumno({
                nombre: "",
                apellidos: "",
                grupo: "",
                grado: "",
                letra: "",
                tutor: "",
                domicilio: "",
                CURP: "",
                NumeroControl: "",
                Plantel: "",
                Turno: "",
                Generacion: "",
                tutorId: null,
                huellaCodigo: "" // Limpiar el campo de huella
            });
            setSelectedTutor(null);
            setTutorOptions([]);
        } catch (error) {
            console.error("Error al registrar:", error);
            alert("❌ No se pudo registrar al alumno.");
        }
    };

    return (
        <div className="bootstrap-scope">
            <div className="agregar-alumno-container">
                <div className="agregar-alumno-content">
                    <h2 className="agregar-alumno-title">📑 Registra un Alumno</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <div className="agregar-alumno-group">
                            <label> Nombre:</label>
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
                            <label> Apellidos:</label>
                            <input
                                type="text"
                                name="apellidos"
                                value={alumno.apellidos}
                                onChange={handleChange}
                                placeholder="Ingrese los apellidos"
                                required
                            />
                        </div>
                        {/* Grado y Letra */}
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
                        {/* Autocompletado para seleccionar padre/tutor */}
                        <div className="agregar-alumno-group">
                            <label> Seleccionar padre del alumno:</label>
                            <Select
                                classNamePrefix="my-select"
                                value={selectedTutor}
                                onChange={handleTutorChangeSelect}
                                onInputChange={handleTutorInputChange}
                                options={tutorOptions}
                                placeholder="Escriba el nombre del padre..."
                                noOptionsMessage={() => "No se encontraron coincidencias"}
                            />
                        </div>
                        {/* Domicilio */}
                        <div className="agregar-alumno-group">
                            <label> Domicilio:</label>
                            <input
                                type="text"
                                name="domicilio"
                                value={alumno.domicilio}
                                onChange={handleChange}
                                placeholder="Ingrese el domicilio"
                                required
                            />
                        </div>
                      
                            {/* CURP */}
                            <div className="agregar-alumno-group">
                                <label> CURP:</label>
                                <input
                                    type="text"
                                    name="CURP"
                                    value={alumno.CURP}
                                    onChange={handleChange}
                                    placeholder="CURP del alumno"
                                />
                            </div>

                            {/* Número de Control */}
                            <div className="agregar-alumno-group">
                                <label> Número de Control:</label>
                                <input
                                    type="text"
                                    name="NumeroControl"
                                    value={alumno.NumeroControl}
                                    onChange={handleChange}
                                    placeholder="Número de control del alumno"
                                />
                            </div>

                            {/* Carrera */}
                        <div className="agregar-alumno-group">
                            <label> Carrera:</label>
                            <select
                                name="Carrera"
                                value={alumno.Carrera}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione una carrera</option>
                                <option value="CIENCIA DE DATOS E INFORMACIÓN">CIENCIA DE DATOS E INFORMACIÓN</option>
                                <option value="CONSTRUCCIÓN">CONSTRUCCIÓN</option>
                                <option value="CONTABILIDAD">CONTABILIDAD</option>
                                <option value="LABORATORISTA CLÍNICO">LABORATORISTA CLÍNICO</option>
                                <option value="MANTENIMIENTO AUTOMOTRIZ">MANTENIMIENTO AUTOMOTRIZ</option>
                                <option value="MECATRÓNICA">MECATRÓNICA</option>
                                <option value="PUERICULTURA">PUERICULTURA</option>
                            </select>
                        </div>


                            {/* Plantel */}
                            <div className="agregar-alumno-group">
                                <label> Plantel:</label>
                                <input
                                    type="text"
                                    name="Plantel"
                                    value={alumno.Plantel}
                                    onChange={handleChange}
                                    placeholder="Plantel asignado"
                                />
                            </div>

                            {/* Turno */}
                            <div className="agregar-alumno-group">
                                <label> Turno:</label>
                                <input
                                    type="text"
                                    name="Turno"
                                    value={alumno.Turno}
                                    onChange={handleChange}
                                    placeholder="Turno (Matutino/Vespertino)"
                                />
                            </div>

                            {/* Generación */}
                            <div className="agregar-alumno-group">
                                <label> Generación:</label>
                                <input
                                    type="text"
                                    name="Generacion"
                                    value={alumno.Generacion}
                                    onChange={handleChange}
                                    placeholder="Generación del alumno"
                                />
                        </div>
                        
                            {/* Perdiodo Escolar */}
                            <div className="agregar-alumno-group">
                                <label> Periodo Escolar:</label>
                            <select
                                name="Ciclo"
                                value={alumno.Ciclo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un periodo</option>
                                <option value="SEMESTRAL 1 - 2024">SEMESTRAL 1 - 2024</option>
                                <option value="SEMESTRAL 2 - 2024">SEMESTRAL 2 - 2024</option>
                                <option value="SEMESTRAL 1 - 2025">SEMESTRAL 1 - 2025</option>
                                <option value="SEMESTRAL 2 - 2025">SEMESTRAL 2 - 2025</option>
                            </select>

                        </div>
                        {/* Campo de huella digital */}
                        <div className="agregar-alumno-group">
                            <label> Huella Digital:</label>
                            <input
                                type="text"
                                name="huellaCodigo"
                                value={alumno.huellaCodigo}
                                onChange={handleChange}
                                placeholder="Huella Digital del Alumno"
                                required
                            />

                        </div>
                        {/* Botones */}
                        <div className="button-container">
                            <button type="submit" className="agregar-alumno-btn">
                                <img src={agregarIcon} alt="Agregar" className="back-icon" />
                                Agregar Alumno
                            </button>
                            <button type="button" className="capturar-huella-btn" onClick={handleOpenModal}>
                                <img src={huellaIcon} alt="Huella" className="back-icon" />
                                Registrar Huella
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Modal de huella */}
            {showModal && (
                <div className="modal-huella">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>X</span>
                        <div className="huella-info">
                            <img src={huellaIcon} alt="Huella" />
                            <p>Sensor Conectado</p>
                            <p>Status: {huellaStatus}</p>
                            <p>Codigo de Huella: {huellaCodigo}</p>
                        </div>
                        <button onClick={handleCaptureHuella}>Capturar Huella</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AgregarAlumno;