import { useState, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import "./AgregarAlumno.css";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dialog } from 'primereact/dialog';
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown"; 
import { Toast } from "primereact/toast";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


const AgregarAlumno = () => {
    // 1) Datos del alumno
    const [alumno, setAlumno] = useState({
        Nombre: "",
        ApellidoPaterno: "",
        ApellidoMaterno: "",
        Grupo: "",
        Grado: "",
        letra: "",
        Domicilio: "",
        CURP: "",
        NumeroControl: "",
        Carrera: "",
        Plantel: "",
        Turno: "",
        Generacion: "",
        Ciclo: "",
        TutorId: null,
    });

    const [loading, setLoading] = useState(false);

    // 2) Autocomplete de tutores
    const [tutorOptions, setTutorOptions] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);

    // 3) Estados para QR
    const [nombreArchivoQR, setNombreArchivoQR] = useState("QR_alumno");
    const [nombreCompletoQR, setNombreCompletoQR] = useState("");
    const [qrCompositeUrl, setQrCompositeUrl] = useState(null);


    // Manejadores de inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAlumno((a) => ({
            ...a,
            [name]: name === "CURP" ? value.toUpperCase() : value,
        }));
    };

    // Grado / letra -> arma Grupo
    const handleChangeGrado = (e) => {
        const newGrado = e.target.value;
        setAlumno((prev) => ({
            ...prev,
            Grado: newGrado,
            Grupo: newGrado && prev.letra ? `${newGrado}${prev.letra}` : ""
        }));
    };
    const handleChangeLetra = (e) => {
        const l = e.target.value;
        setAlumno((a) => ({
            ...a,
            letra: l,
            Grupo: a.Grado && l ? `${a.Grado}${l}` : "",
        }));
    };
    console.log("Grupo generado:", alumno.Grupo);

    // Autocomplete padres
    const fetchTutorOptions = async (input) => {
        if (!input || input.length < 2) return setTutorOptions([]);
        try {
            const response = await axios.get(`http://localhost:5099/api/usuarios/autocompletePadres?termino=${input}`);
            const optionsData = response.data.map((padre) => ({
                value: padre.id_Usuario,
                label: `${padre.nombre} ${padre.apellidoPaterno} ${padre.apellidoMaterno}`
            }));
            setTutorOptions(optionsData);
        } catch (error) {
            console.error("Error al buscar padres:", error);
        }
    };
    const handleTutorInputChange = (input, { action }) => {
        if (action === "input-change") fetchTutorOptions(input);
        return input;
    };
    const handleTutorChangeSelect = (opt) => {
        setSelectedTutor(opt);
        setAlumno((a) => ({ ...a, TutorId: opt ? opt.value : null }));
    };

    // Lista de carreras (puedes modificarla según tus necesidades)
    const carreras = [
        "CIENCIA DE DATOS E INFORMACIÓN",
        "CONSTRUCCIÓN",
        "CONTABILIDAD",
        "LABORATORISTA CLÍNICO",
        "MANTENIMIENTO AUTOMOTRIZ",
        "MECATRÓNICA",
        "PUERICULTURA"
    ];

    // Estado para almacenar la URL del código QR
    const [showQrModal, setShowQrModal] = useState(false);

    const toast = useRef(null);

    // Función para enviar los datos del alumno al backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const gruposResponse = await axios.get("http://localhost:5099/api/grupos");
            const gruposExistentes = gruposResponse.data;
            const grupoEncontrado = gruposExistentes.find(
                (g) => `${g.grado}${g.letra}`.toUpperCase() === alumno.Grupo.toUpperCase()
            );

            if (!grupoEncontrado) {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Grupo no encontrado',
                    detail: 'Debes crear el grupo antes de registrar al alumno.',
                    life: 3000
                });
                return;
            }
        } catch (error) {
            console.error("Error al verificar grupos:", error);
            toast.current.show({
                severity: 'error',
                summary: 'Error al verificar grupo',
                detail: 'No se pudo verificar la existencia del grupo.',
                life: 3000
            });
            return;
        } finally {
            setLoading(false);
        }

        const nombreFull = `${alumno.Nombre} ${alumno.ApellidoPaterno} ${alumno.ApellidoMaterno}`;
        setNombreCompletoQR(nombreFull);
        setNombreArchivoQR(`QR_${nombreFull.replace(/\s+/g, "_")}`);

        try {
            const response = await axios.post("http://localhost:5099/api/alumnos/registro", alumno);
            toast.current.show({
                severity: 'success',
                summary: 'Alumno registrado',
                detail: response.data.mensaje,
                life: 3000
            });

            const alumnoId = response.data.alumno.id;
            const qrResponse = await axios.get(`http://localhost:5099/api/alumnos/qr/${alumnoId}`, {
                responseType: "blob"
            });

            const qrBlob = new Blob([qrResponse.data], { type: "image/png" });
            const qrImageUrl = URL.createObjectURL(qrBlob);
            const img = new Image();
            img.onload = () => {
                const padding = 20;
                const textHeight = 30;
                const canvasWidth = img.width + padding * 2;
                const canvasHeight = img.height + padding * 2 + textHeight;

                const canvas = document.createElement("canvas");
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                const ctx = canvas.getContext("2d");

                // Fondo blanco
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                // Imagen QR
                ctx.drawImage(img, padding, padding);

                // Texto centrado debajo
                ctx.fillStyle = "#000";
                ctx.font = "bold 18px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(nombreFull, canvasWidth / 2, img.height + padding + textHeight * 0.8);

                // Convertir canvas a blob y mostrar
                canvas.toBlob((blob) => {
                    const finalUrl = URL.createObjectURL(blob);
                    setQrCompositeUrl(finalUrl);
                    setShowQrModal(true);

                    // Limpiar después de unos segundos
                    setTimeout(() => {
                        setShowQrModal(false);
                        setQrCompositeUrl(null);
                    }, 10000);
                }, "image/png");
            };
            img.src = qrImageUrl;


            setShowQrModal(true);
            setTimeout(() => {
                setShowQrModal(false);
            }, 10000);


            setAlumno({
                Nombre: "",
                ApellidoPaterno: "",
                ApellidoMaterno: "",
                Grupo: "",
                Grado: "",
                letra: "",
                tutor: "",
                Domicilio: "",
                TutorId: null,
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

            if (error.response?.data?.mensaje) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Registro fallido',
                    detail: error.response.data.mensaje,
                    life: 3000
                });
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error interno',
                    detail: 'Ocurrió un problema al registrar al alumno.',
                    life: 3000
                });
            }
        }
    };

    return (
        <div className="bootstrap-scope">
            <Toast ref={toast} />
            <div className="agregar-alumno-container">
                <div className="agregar-alumno-content">
                    <h2 className="agregar-alumno-title">📑 Registra un Alumno</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <div className="agregar-alumno-group">
                            <label>Nombre del Alumno:</label>
                            <FloatLabel>
                                <InputText
                                    id="nombre"
                                    name="Nombre"
                                    value={alumno.Nombre}
                                    onChange={handleChange}
                                    placeholder="Escribe el nombre del alumno..."
                                    required
                                />
                               
                            </FloatLabel>
                        </div>

                        {/* Apellidos */}
                        <div className="agregar-alumno-double">
                            <div className="agregar-alumno-group">
                                <label>Apellido Paterno:</label>
                                <FloatLabel>
                                    <InputText
                                        id="apellidoPaterno"
                                        name="ApellidoPaterno"
                                        value={alumno.ApellidoPaterno}
                                        placeholder="Escribe el apellido parteno del alumno..."
                                        onChange={handleChange}
                                    />
                                </FloatLabel>
                            </div>
                            <div className="agregar-alumno-group">
                                <label>Apellido Materno:</label>
                                <FloatLabel>
                                    <InputText
                                        id="apellidoMaterno"
                                        name="ApellidoMaterno"
                                        value={alumno.ApellidoMaterno}
                                        placeholder="Escribe el apellido marteno del alumno..."
                                        onChange={handleChange}
                                    />
                                </FloatLabel>
                            </div>
                        </div>

                        {/* Grado y Grupo */}
                        <div className="agregar-alumno-double">
                            <div className="agregar-alumno-group">
                                <label>Grado:</label>
                                <FloatLabel>
                                    <Dropdown
                                        inputId="grado"
                                        value={alumno.Grado}
                                        options={[1, 2, 3, 4, 5, 6]}
                                        onChange={(e) => handleChangeGrado({ target: { name: "Grado", value: e.value } })}
                                        placeholder="Seleccione.."
                                    />
                                </FloatLabel>
                            </div>

                            <div className="agregar-alumno-group">
                                <label>Grupo:</label>
                                <FloatLabel>
                                    <Dropdown
                                        inputId="letra"
                                        value={alumno.letra}
                                        options={["A", "B", "C", "D", "E", "F", "G"]}
                                        onChange={(e) => handleChangeLetra({ target: { name: "letra", value: e.value } })}
                                        placeholder="Seleccione.."
                                    />
                                </FloatLabel>
                            </div>
                        </div>

                        {/* Autocompletado para seleccionar padre/tutor */}
                        <div className="agregar-alumno-group">
                            <label style={{ marginBottom: '10px' }}> Seleccionar padre del alumno:</label>
                            <Select
                                classNamePrefix="my-select"
                                value={selectedTutor}
                                onChange={handleTutorChangeSelect}
                                onInputChange={handleTutorInputChange}
                                options={tutorOptions}
                                placeholder="Escriba nombre del padre..."
                                noOptionsMessage={() => "No hay coincidencias"}
                            />
                        </div>

                        {/* Domicilio */}
                        <div className="agregar-alumno-group">
                            <label>Domicilio:</label>
                            <FloatLabel>
                                <InputText
                                    id="domicilio"
                                    name="Domicilio"
                                    value={alumno.Domicilio}
                                    onChange={handleChange}
                                    placeholder="Escribe el domicilio del alumno..."
                                    required
                                />
                            </FloatLabel>
                        </div>

                        {/* CURP y Número de Control */}
                        <div className="agregar-alumno-double">
                            <div className="agregar-alumno-group">
                                <label>CURP:</label>
                                <FloatLabel>
                                    <InputText
                                        id="curp"
                                        name="CURP"
                                        value={alumno.CURP}
                                        onChange={handleChange}
                                        placeholder="Escribe la CURP del alumno..."
                                    />
                                </FloatLabel>
                            </div>
                            <div className="agregar-alumno-group">
                                <label>Numero de Control:</label>
                                <FloatLabel>
                                    <InputText
                                        id="numeroControl"
                                        name="NumeroControl"
                                        value={alumno.NumeroControl}
                                        onChange={handleChange}
                                        placeholder="Escribe el num. de control del alumno..."
                                    />
                                </FloatLabel>
                            </div>
                        </div>

                        {/* Carrera */}
                        <div className="agregar-alumno-group">
                            <label>Carrera:</label>
                            <FloatLabel>
                                <Dropdown
                                    inputId="carrera"
                                    value={alumno.Carrera}
                                    options={carreras.map(c => ({ label: c, value: c }))}
                                    onChange={(e) => setAlumno({ ...alumno, Carrera: e.value })}
                                    placeholder="Seleccione"
                                />
                            </FloatLabel>
                        </div>

                        {/* Plantel y Turno */}
                        <div className="agregar-alumno-double">
                            <div className="agregar-alumno-group">
                                <label>Plantel:</label>
                                <FloatLabel>
                                    <InputText
                                        id="plantel"
                                        name="Plantel"
                                        value={alumno.Plantel}
                                        onChange={handleChange}
                                        placeholder="Escribe el plantel..."
                                    />
                                </FloatLabel>
                            </div>
                            <div className="agregar-alumno-group">
                                <label>Turno:</label>
                                <FloatLabel>
                                    <InputText
                                        id="turno"
                                        name="Turno"
                                        value={alumno.Turno}
                                        onChange={handleChange}
                                        placeholder="Escribe el turno del alumno..."
                                    />
                                </FloatLabel>
                            </div>
                        </div>

                        {/* Generación */}
                        <div className="agregar-alumno-group">
                            <label>Generacion:</label>
                            <FloatLabel>
                                <InputText
                                    id="generacion"
                                    name="Generacion"
                                    value={alumno.Generacion}
                                    onChange={handleChange}
                                    placeholder="Escribe la generación del alumno..."
                                />
                            </FloatLabel>
                        </div>

                        {/* Ciclo */}
                        <div className="agregar-alumno-group">
                            <label>Periodo Escolar:</label>
                            <FloatLabel>
                                <InputText
                                    id="ciclo"
                                    name="Ciclo"
                                    value={alumno.Ciclo}
                                    onChange={handleChange}
                                    placeholder="Escribe el ciclo escolar del alumno..."
                                />
                            </FloatLabel>
                        </div>

                        {/* Botón Agregar */}
                        <div className="button-container">
                            <Button
                                type="submit"
                                label={loading ? "Registrando..." : "Agregar Alumno"}
                                icon="pi pi-user-plus"
                                iconPos="left"
                                className="p-button-rounded p-button-success p-button-lg"
                                loading={loading}
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal de QR */}
                    <Dialog
                        header={`Código QR de ${nombreCompletoQR}`}
                        visible={showQrModal}
                        style={{ width: '400px' }}
                        onHide={() => setShowQrModal(false)}
                        closable
                        draggable={false}
                        resizable={false}
                            footer={
                                <div className="flex justify-content-end gap-2">
                                    <Button
                                        label="Atrás"
                                        icon="pi pi-times"
                                        severity="secondary"
                                        outlined
                                        onClick={() => setShowQrModal(false)}
                                    />
                                    <a
                                        href={qrCompositeUrl}
                                        download={`${nombreArchivoQR}.png`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Button
                                            label="Descargar QR"
                                            icon="pi pi-download"
                                            severity="primary"
                                        />
                                    </a>
                                </div>
                            }

                    >
                         <div className="flex justify-content-center">
                    <img src={qrCompositeUrl} alt="Código QR con nombre" style={{ width: "100%", maxWidth: "250px", borderRadius: "8px" }} />
                </div>
                    </Dialog>
        </div>
    );
};

export default AgregarAlumno;
