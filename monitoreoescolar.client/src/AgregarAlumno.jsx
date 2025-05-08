import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import "./AgregarAlumno.css";
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
        CURP: "",
        NumeroControl: "",
        Carrera: "",
        Plantel: "",
        Turno: "",
        CURP: "",
        NumeroControl: "",
        Generacion: "",
        Ciclo: "",
        TutorId: null
    });

    //Variable para el nombre de la imagen del qr
    const [nombreArchivoQR, setNombreArchivoQR] = useState("QR_alumno");


    const [tutorOptions, setTutorOptions] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);


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
            Grado: newGrado,
            Grupo: newGrado && alumno.letra ? `${newGrado}${alumno.letra}` : ""
        });
    };

    // Maneja el cambio de Letra 
    const handleChangeLetra = (e) => {
        const newLetra = e.target.value;
        setAlumno({
            ...alumno,
            letra: newLetra,
            Grupo: alumno.Grado && newLetra ? `${alumno.Grado}${newLetra}` : ""
        });
    };

    // Función para buscar padres en base al término ingresado (autocompletado)
    const fetchTutorOptions = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) {
            setTutorOptions([]);
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5099/api/usuarios/autocompletePadres?termino=${inputValue}`);
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


    // Estado para almacenar la URL del código QR
    const [qrUrl, setQrUrl] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);

    // Función para enviar los datos del alumno al backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar que el grupo seleccionado exista
        try {
            const gruposResponse = await axios.get("http://localhost:5099/api/grupos");
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

        setNombreArchivoQR(
            `QR_${(alumno.nombre + "_" + alumno.apellidos).replace(/\s+/g, "_")}`
        );


        // Registrar al alumno
        try {
            const response = await axios.post("http://localhost:5099/api/alumnos/registro", alumno);
            alert(response.data.mensaje);

            // Obtener el ID del nuevo alumno
            const alumnoId = response.data.alumno.id;

            // Obtener el QR desde el backend
            const qrResponse = await axios.get(`http://localhost:5099/api/alumnos/qr/${alumnoId}`, {
                responseType: "blob"
            });
            const qrBlob = new Blob([qrResponse.data], { type: "image/png" });
            const qrImageUrl = URL.createObjectURL(qrBlob);
            setQrUrl(qrImageUrl);
            setShowQrModal(true);

            // Ocultar automáticamente el modal tras 10 segundos
            setTimeout(() => {
                setShowQrModal(false);
                setQrUrl(null);
            }, 10000);

            // Limpiar formulario
            setAlumno({
                nombre: "",
                apellidos: "",
                grupo: "",
                grado: "",
                letra: "",
                tutor: "",
                domicilio: "",
                tutorId: null,
                CURP: "",
                NumeroControl: "",
                Carrera: "",
                Plantel: "",
                Turno: "",
                Generacion: "",
                Ciclo: ""
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
                        {/* Primer Nombre */}
                        <div className="agregar-alumno-group">
                            <label>Primer Nombre:</label>
                            <input
                                type="text"
                                name="PrimerNombre"
                                value={alumno.PrimerNombre}
                                onChange={handleChange}
                                placeholder="Ingrese el primer nombre"
                                required
                            />
                        </div>

                        {/* Otros Nombre */}
                        <div className="agregar-alumno-group">
                            <label>Mas Nombres:</label>
                            <input
                                type="text"
                                name="SegundoNombre"
                                value={alumno.SegundoNombre}
                                onChange={handleChange}
                                placeholder="Si tiene mas de un nombre ingrese los datos"
                            />
                        </div>

                        {/* Apellido Paterno */}
                        <div className="agregar-alumno-group">
                            <label>Apellido Paterno:</label>
                            <input
                                type="text"
                                name="ApellidoPaterno"
                                value={alumno.ApellidoPaterno}
                                onChange={handleChange}
                                placeholder="Ingrese el apellido paterno"
                                required
                            />
                        </div>

                        {/* Apellido Materno */}
                        <div className="agregar-alumno-group">
                            <label>Apellido Materno:</label>
                            <input
                                type="text"
                                name="ApellidoMaterno"
                                value={alumno.ApellidoMaterno}
                                onChange={handleChange}
                                placeholder="Ingrese el apellido materno"
                                required
                            />
                        </div>


                        {/* Grado y Letra para armar Grupo */}
                        <div className="agregar-alumno-group-selects">
                            <div>
                                <label>Grado:</label>
                                <select
                                    name="Grado"
                                    value={alumno.Grado}
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
                                    name="letra" // no se guarda en backend, solo ayuda a formar Grupo
                                    value={alumno.letra || ""}
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

                        {/* Grupo (campo final armado automáticamente) */}
                        <input type="hidden" name="Grupo" value={alumno.Grupo} />

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
                      
                        {/* Botones */}
                        <div className="button-container">
                            <button type="submit" className="agregar-alumno-btn">
                                <img src={agregarIcon} alt="Agregar" className="back-icon" />
                                Agregar Alumno
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* Modal de QR */}
            {showQrModal && (
                <div className="modal-qr">
                    <div className="modal-qr-content">
                        <span className="close" onClick={() => setShowQrModal(false)}>×</span>
                        <h3>Código QR del alumno registrado</h3>
                        <img src={qrUrl} alt="Código QR" className="qr-image" />
                        <a
                            href={qrUrl}
                            download={`${nombreArchivoQR}.png`}
                            className="qr-download-btn"
                        >
                            Descargar QR
                        </a>

                    </div>
                </div>
            )}

        </div>
    );
};
export default AgregarAlumno;