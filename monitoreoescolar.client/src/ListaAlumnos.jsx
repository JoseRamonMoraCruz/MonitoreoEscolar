import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ListaAlumnos.css";
import Select from "react-select";
import deleteIcon from "./assets/borrar.png";
import editIcon from "./assets/editar-informacion.png";
import removeIcon from "./assets/eliminar-informacion.png";
import WhatsappIcon from "./assets/whatsapp.png";
import QrIcon from "./assets/codigo-qr.png";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const ListaAlumnos = () => {
    const [grupos, setGrupos] = useState([]);
    const [modalGrupo, setModalGrupo] = useState(false);
    const [nuevoGrupo, setNuevoGrupo] = useState({ grado: "", letra: "", nombreDocente: "" });
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [alumnosGrupo, setAlumnosGrupo] = useState([]);
    const [modalEliminarAlumno, setModalEliminarAlumno] = useState(false);
    const [modalEditarAlumno, setModalEditarAlumno] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

    // Estados para el modal de eliminar grupo
    const [modalEliminarGrupo, setModalEliminarGrupo] = useState(false);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

    // Estados para la búsqueda
    const [searchTerm, setSearchTerm] = useState("");
    // Para almacenar todos los alumnos de cada grupo (clave: grupo.id)
    const [alumnosPorGrupo, setAlumnosPorGrupo] = useState({});

    // Estados para el autocompletado en el modal de edición del tutor
    const [tutorOptionsEdit, setTutorOptionsEdit] = useState([]);
    const [selectedTutorEdit, setSelectedTutorEdit] = useState(null);

    // Estados para el menú de edición del grupo (solo para editar el nombre del docente)
    const [menuGrupo, setMenuGrupo] = useState(null);
    const [modalEditarDocente, setModalEditarDocente] = useState(false);
    const [grupoDocenteEditado, setGrupoDocenteEditado] = useState(null);
    const menuRef = useRef(null);
    // Estados para el select de grupos en edición
    const [groupOptions, setGroupOptions] = useState([]);
    const [selectedGroupEdit, setSelectedGroupEdit] = useState(null);

    // Carreras para el Select de edición
    const [carreraOptions, setCarreraOptions] = useState([]);
    const [selectedCarreraEdit, setSelectedCarreraEdit] = useState(null); 

    // junto a tus useState existentes
    const [qrCompositeUrl, setQrCompositeUrl] = useState(null);
    const [nombreCompletoQR, setNombreCompletoQR] = useState("");

    // Estado para el modal de confirmación de eliminación de docente
    const [showConfirmEliminarDocente, setShowConfirmEliminarDocente] = useState(false);
    const [grupoDocenteAEliminar, setGrupoDocenteAEliminar] = useState(null);
    const toast = useRef(null);

    const mostrarToast = (summary, detail, severity = "success") => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000,
        });
    };

    useEffect(() => {
        obtenerGrupos();
    }, []);

    // 1) Efecto para armar las opciones de <Select> de grupos
    useEffect(() => {
        if (grupos.length > 0) {
            const opciones = grupos.map(g => ({
                value: `${g.grado}${g.letra}`,
                label: `${g.grado}${g.letra}`
            }));
            setGroupOptions(opciones);
        }
    }, [grupos]);

    useEffect(() => {
        if (grupos.length > 0) {
            const fetchAllStudents = async () => {
                const newAlumnosPorGrupo = {};
                for (const grupo of grupos) {
                    const groupString = `${grupo.grado}${grupo.letra}`;
                    try {
                        const response = await axios.get(`/api/alumnos/grupo/${groupString}`);
                        newAlumnosPorGrupo[grupo.id] = response.data;
                    } catch (error) {
                        console.error("Error al obtener alumnos para el grupo", grupo, error);
                        newAlumnosPorGrupo[grupo.id] = [];
                    }
                }
                setAlumnosPorGrupo(newAlumnosPorGrupo);
            };
            fetchAllStudents();
        }
    }, [grupos]);

    //Es pa ver si el usuario hizo click afuera se cierre el menu de los puntitos
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Verifica si el menú está abierto y si el click ocurrió fuera del contenedor
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                cerrarMenuGrupo();
            }
        };
        if (menuGrupo) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Limpia el listener al desmontar o al cambiar el estado
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuGrupo]);

    const fetchTutorOptionsEdit = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) {
            setTutorOptionsEdit([]);
            return;
        }
        try {
            const response = await axios.get(`/api/usuarios/autocompletePadres?termino=${inputValue}`);
            const optionsData = response.data.map((padre) => ({
                value: padre.id_Usuario,
                label: `${padre.nombre} ${padre.apellidoPaterno} ${padre.apellidoMaterno}`
            }));
            setTutorOptionsEdit(optionsData);
        } catch (error) {
            console.error("Error al buscar padres (modal edición):", error);
        }
    };
    const handleTutorInputChangeEdit = (inputValue, { action }) => {
        if (action === "input-change") {
            fetchTutorOptionsEdit(inputValue);
            return inputValue;
        }
        return inputValue;
    };

    const handleTutorChangeSelect = (selectedOption) => {
        setSelectedTutorEdit(selectedOption);
        setAlumnoSeleccionado((prev) => ({
            ...prev,
            tutorId: selectedOption ? selectedOption.value : null
        }));
    };

    const handleGroupChangeSelect = option => {
        setSelectedGroupEdit(option);
        setAlumnoSeleccionado(prev => ({
            ...prev,

            grupo: option.value
        }));
    };
    const obtenerGrupos = async () => {
        try {
            const response = await axios.get("/api/grupos");
            const gruposOrdenados = response.data.sort((a, b) => {
                const gradeA = parseInt(a.grado, 10);
                const gradeB = parseInt(b.grado, 10);
                if (gradeA !== gradeB) return gradeA - gradeB;
                if (a.letra < b.letra) return -1;
                if (a.letra > b.letra) return 1;
                return 0;
            });
            setGrupos(gruposOrdenados);
        } catch (error) {
            console.error("Error al obtener grupos:", error);
        }
    };

    const abrirModalGrupo = () => setModalGrupo(true);
    const cerrarModalGrupo = () => setModalGrupo(false);

    /* EDITAR */
    const abrirModalEditarAlumno = alumno => {
        const grupoStr = alumno.grupo ?? alumno.Grupo ?? "";
        // 1) Inyecta TODOS los campos que luego vas a editar
        setAlumnoSeleccionado({
            ...alumno,
            grupo: grupoStr,
            carrera: alumno.carrera ?? "",
            numeroControl: alumno.numeroControl ?? "",
            curp: alumno.curp ?? ""

        });

        // 2) Inicializa cada Select con su opción correspondiente
        setSelectedGroupEdit(
            grupoStr ? { value: grupoStr, label: grupoStr } : null
        );
        setSelectedCarreraEdit(
            alumno.carrera
                ? { value: alumno.carrera, label: alumno.carrera }
                : null
        );
        setSelectedTutorEdit(
            alumno.tutorUsuario
                ? {
                    value: alumno.tutorUsuario.id_Usuario,
                    label: `${alumno.tutorUsuario.nombre} ${alumno.tutorUsuario.apellidopaterno} ${alumno.tutorUsuario.apellidomaterno}`
                }
                : null
        );

        // Inicializa el autocompletado si ya existe tutor asignado
        if (alumno.tutorId && alumno.TutorUsuario) {
            setSelectedTutorEdit({
                value: alumno.tutorId,
                label: `${alumno.TutorUsuario.nombre} ${alumno.TutorUsuario.apellidoPaterno} - ${alumno.TutorUsuario.apellidoMaterno}`
            });
        } else {
            setSelectedTutorEdit(null);
        }
        setModalEditarAlumno(true);

        // 3) Finalmente abre el modal UNA vez
        setModalEditarAlumno(true);
    };

    const cerrarModalEditarAlumno = () => {
        setModalEditarAlumno(false);
        setAlumnoSeleccionado(null);
    };

    const actualizarAlumno = async (alumno) => {
        // 1) Validar que ya se haya seleccionado un grupo
        if (!alumno.grupo) {
            mostrarToast("Campos incompletos", "Por favor, seleccione un grupo.", "warn");
            return;
        }

        // 2) Verificar que ese grupo exista en tu lista de grupos
        const grupoExistente = grupos.find(
            (g) => `${g.grado}${g.letra}` === alumno.grupo
        );
        if (!grupoExistente) {
            mostrarToast("Grupo inválido", "El grupo seleccionado no existe.", "error");
            return;
        }

        try {
            // 3) Excluir el objeto TutorUsuario (si viene cargado) y armar el payload
            // eslint-disable-next-line no-unused-vars
            const { tutorUsuario: _unused, ...alumnoSinTutor } = alumno;

            const alumnoParaActualizar = {
                ...alumnoSinTutor,
                Grupo: alumno.grupo
            };
            // 4) Llamada al API
            const response = await axios.put(
                `/api/alumnos/editar/${alumno.id}`,
                alumnoParaActualizar
            );
            mostrarToast("Alumno actualizado", response.data.mensaje, "success");
            setAlumnosGrupo((prev) =>
                prev.map((al) =>
                    al.id === alumno.id ? alumnoParaActualizar : al
                )
            );

            // 6) Cerrar el modal
            cerrarModalEditarAlumno();
        } catch (error) {
            console.error(
                "Error al actualizar alumno:",
                error.response?.data || error.message
            );
            mostrarToast("Error", `No se pudo actualizar al alumno. ${error.response?.data?.mensaje || error.message}`, "error");
        }
    };

    /*FIN DE EDITAR */

    const handleChange = (e) => {
        setNuevoGrupo({ ...nuevoGrupo, [e.target.name]: e.target.value });
    };

    const agregarGrupo = async () => {
        if (!nuevoGrupo.grado || !nuevoGrupo.letra || !nuevoGrupo.nombreDocente) {
            mostrarToast("Campos incompletos", "Por favor, complete todos los campos.", "warn");
            return;
        }
        try {
            await axios.post("/api/grupos/agregar", nuevoGrupo);
            mostrarToast("Grupo agregado", "Grupo agregado correctamente.", "success");
            obtenerGrupos();
            cerrarModalGrupo();
        } catch (error) {
            console.error("Error al agregar grupo:", error);
            mostrarToast("Error", "No se pudo agregar el grupo.", "error");
        }
    };

    const handleGroupClick = async (grupo) => {
        const groupString = `${grupo.grado}${grupo.letra}`.toLowerCase();
        const normalizedSearch = removeDiacritics(searchTerm.trim().toLowerCase());
        if (searchTerm.trim() !== "" && normalizedSearch !== groupString && normalizedSearch !== grupo.grado.toString().toLowerCase())
            return;

        if (expandedGroup && expandedGroup.id === grupo.id) {
            setExpandedGroup(null);
            setAlumnosGrupo([]);
            return;
        }
        try {
            const response = await axios.get(`/api/alumnos/grupo/${groupString}`);
            setAlumnosGrupo(response.data);
            setExpandedGroup(grupo);
        } catch (error) {
            console.error("Error al obtener alumnos del grupo:", error);
            mostrarToast("Error", "No se pudieron obtener los alumnos de este grupo.", "error");
        }
    };

    // Función para abrir el modal de eliminar grupo
    const handleDeleteClick = (e, grupo) => {
        e.stopPropagation();
        setGrupoSeleccionado(grupo);
        setModalEliminarGrupo(true);
    };

    const cerrarModalEliminarGrupo = () => {
        setModalEliminarGrupo(false);
        setGrupoSeleccionado(null);
    };

    const eliminarGrupo = async () => {
        if (!grupoSeleccionado) return;
        try {
            await axios.delete(`/api/grupos/eliminar/${grupoSeleccionado.id}`);
            mostrarToast("Grupo eliminado", "Grupo eliminado exitosamente.", "success");
            setGrupos(grupos.filter((g) => g.id !== grupoSeleccionado.id));
            if (expandedGroup && expandedGroup.id === grupoSeleccionado.id) {
                setExpandedGroup(null);
                setAlumnosGrupo([]);
            }
            cerrarModalEliminarGrupo();
        } catch (error) {
            console.error("Error al eliminar grupo:", error);
            mostrarToast("Error", "No se pudo eliminar el grupo.", "error");
        }
    };

    // Funciones para el modal de eliminar alumno
    const abrirModalEliminarAlumno = (alumno) => {
        setAlumnoSeleccionado(alumno);
        setModalEliminarAlumno(true);
    };

    const cerrarModalEliminarAlumno = () => {
        setModalEliminarAlumno(false);
        setAlumnoSeleccionado(null);
    };

    const eliminarAlumno = async () => {
        if (!alumnoSeleccionado) return;
        try {
            await axios.delete(`/api/alumnos/eliminar/${alumnoSeleccionado.id}`);
            mostrarToast("Alumno eliminado", "El alumno fue eliminado correctamente.", "success");
            setAlumnosGrupo(alumnosGrupo.filter((al) => al.id !== alumnoSeleccionado.id));
            cerrarModalEliminarAlumno();
        } catch (error) {
            console.error("Error al eliminar alumno:", error);
            mostrarToast("Error", "No se pudo eliminar al alumno.", "error");
        }
    };

    // Función para quitar acentos
    const removeDiacritics = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const normalizedSearch = removeDiacritics(searchTerm.trim().toLowerCase());
    const gruposFiltrados = searchTerm.trim()
        ? grupos.filter((grupo) => {
            const groupString = `${grupo.grado}${grupo.letra}`.toLowerCase();
            const matchGroup = groupString.includes(normalizedSearch);
            const matchAlumno = (alumnosPorGrupo[grupo.id] || []).some((alumno) =>
                removeDiacritics((alumno.nombre + " " + alumno.apellidoPaterno + " " + alumno.apellidoMaterno + " " + alumno.carrera).toLowerCase()).includes(normalizedSearch)
            );
            return matchGroup || matchAlumno;
        })
        : grupos;

    // Abre el menú de edición para el grupo seleccionado
    const abrirMenuGrupo = (grupo, e) => {
        e.stopPropagation();
        setMenuGrupo(grupo);
    };

    // Cierra el menú de edición
    const cerrarMenuGrupo = () => {
        setMenuGrupo(null);
    };

    // Abre el modal para editar el nombre del docente utilizando el grupo seleccionado del menú
    const abrirModalEditarDocente = (grupo) => {
        setGrupoDocenteEditado(grupo);
        setModalEditarDocente(true);
        cerrarMenuGrupo();
    };

    const cerrarModalEditarDocente = () => {
        setModalEditarDocente(false);
        setGrupoDocenteEditado(null);
    };

    // Función para editar el grupo
    const actualizarGrupoDocente = async () => {
        if (!grupoDocenteEditado.grado || !grupoDocenteEditado.letra) {
            mostrarToast("Campos incompletos", "Seleccione el grado y el grupo.", "warn");
            return;
        }
        try {
            const response = await axios.put(
                `/api/grupos/editar/${grupoDocenteEditado.id}`,
                grupoDocenteEditado
            );
            mostrarToast("Grupo actualizado", response.data.mensaje, "success");
            obtenerGrupos();
            cerrarModalEditarDocente();
        } catch (error) {
            console.error(
                "Error al actualizar grupo y docente:",
                error.response?.data || error.message
            );
            mostrarToast("Error", `No se pudo actualizar el grupo y el docente. ${error.response?.data?.mensaje || error.message}`, "error");
        }
    };
    //FUNCION PARA LA CONFIRMACION DE ELIMINAR DOCENTE
    const confirmarEliminarDocente = (grupo) => {
        setGrupoDocenteAEliminar(grupo);
        setShowConfirmEliminarDocente(true);
    };
    const eliminarDocenteDelGrupo = async () => {
        if (!grupoDocenteAEliminar) return;

        try {
            // Llamada al nuevo endpoint para eliminar el docente
            const response = await axios.put(`/api/grupos/eliminarDocente/${grupoDocenteAEliminar.id}`);
            mostrarToast("Docente eliminado", response.data.mensaje, "success");
            obtenerGrupos();
            cerrarMenuGrupo();

            setShowConfirmEliminarDocente(false);

        } catch (error) {
            console.error("Error al eliminar el docente:", error.response?.data || error.message);
            mostrarToast("Error", `No se pudo eliminar el docente: ${error.response?.data?.mensaje || error.message}`, "error");
        }
    };

    //PARA EL QR
    const [showQrModal, setShowQrModal] = useState(false);
    const [nombreArchivoQR, setNombreArchivoQR] = useState("QR_Alumno");

    const mostrarModalQR = async (alumnoId, nombre, apellidoPaterno, apellidoMaterno) => {
        try {
            // 1) Prepara el nombre completo y el nombre de archivo
            const fullName = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
            setNombreCompletoQR(fullName);
            setNombreArchivoQR(`QR_${fullName.replace(/\s+/g, "_")}`);

            // 2) Descarga el blob PNG original
            const response = await axios.get(`/api/alumnos/qr/${alumnoId}`, {
                responseType: "blob",
            });
            const rawBlob = new Blob([response.data], { type: "image/png" });
            const rawUrl = URL.createObjectURL(rawBlob);

            // 3) Carga la imagen en un elemento <img> para poder dibujarla en un canvas
            const img = new Image();
            img.onload = () => {
                const padding = 20;
                const textH = 30;
                const cw = img.width + padding * 2;
                const ch = img.height + padding * 2 + textH;
                const canvas = document.createElement("canvas");
                canvas.width = cw;
                canvas.height = ch;
                const ctx = canvas.getContext("2d");

                // 4) Dibuja fondo blanco
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, cw, ch);

                // 5) Dibuja el QR
                ctx.drawImage(img, padding, padding);

                // 6) Dibuja el nombre centrado debajo del QR
                ctx.fillStyle = "#000";
                ctx.font = "bold 18px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(fullName, cw / 2, img.height + padding + textH * 0.8);

                // 7) Convierte el canvas a blob y genera la URL final
                canvas.toBlob((blob) => {
                    const compositeUrl = URL.createObjectURL(blob);
                    setQrCompositeUrl(compositeUrl);
                    setShowQrModal(true);
                    setTimeout(() => {
                        URL.revokeObjectURL(compositeUrl);
                        setShowQrModal(false);
                        setQrCompositeUrl(null);
                    }, 10000);
                }, "image/png");
            };

            img.src = rawUrl;
        } catch (error) {
            console.error("Error al generar QR compuesto:", error);
            mostrarToast("Error", "No se pudo generar el código QR con el nombre.", "error");
        }
    };

    // Constante para la parte del whats
    const abrirWhatsApp = (telefono) => {
        const mensaje = `Hola!, nos comunicamos desde la escuela de tu hij@ por el siguiente asunto:\n\nEl asunto es......`; // Mensaje predeterminado
        const mensajeCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/${telefono}?text=${mensajeCodificado}`, "_blank");
    };

    return (
        <div className="buscador-alumno-container">
            <Toast ref={toast} />
            <div className="lista-content">
                <div className="busqueda-alumnos-prime-wrapper">
                    <InputText
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Buscar un grupo y alumno por su nombre o por carrera"
                        className="busqueda-alumnos-prime-input"
                    />
                    <Button
                        icon="pi pi-search"
                        severity="info"
                        rounded
                        className="busqueda-alumnos-prime-btn"
                    />
                </div>
                <div className="lista-header">
                    <h2 className="lista-title">Lista de Grupos</h2>
                </div>
                <div className="grupos-container">
                    {grupos.length === 0 ? (
                        <p>No hay grupos registrados.</p>
                    ) : (
                        gruposFiltrados.map((grupo) => {
                            const groupString = `${grupo.grado}${grupo.letra}`.toLowerCase();
                            const isGroupSearch =
                                normalizedSearch === groupString ||
                                normalizedSearch === grupo.grado.toString().toLowerCase();
                            const tableData = searchTerm.trim()
                                ? isGroupSearch
                                    ? alumnosPorGrupo[grupo.id] || []
                                    : (alumnosPorGrupo[grupo.id] || []).filter((alumno) =>
                                        removeDiacritics((alumno.nombre + " " + alumno.apellidoPaterno + " " + alumno.apellidoMaterno + " " + alumno.carrera).toLowerCase()).includes(normalizedSearch)
                                    )
                                : expandedGroup && expandedGroup.id === grupo.id
                                    ? alumnosGrupo
                                    : null;
                            return (
                                <div
                                    key={grupo.id}
                                    className="grupo-card"
                                    onClick={() => handleGroupClick(grupo)}
                                >
                                    <div className="grupo-header">
                                        <h3>
                                            <div className="grupo">{grupo.grado}{grupo.letra}</div>
                                            <div className="docente">{grupo.nombreDocente && <p>Docente: {grupo.nombreDocente}</p>}</div>
                                        </h3>

                                        <div className="acciones-grupo" style={{ display: "flex", gap: "10px" }}>
                                            <span
                                                style={{ cursor: "pointer", fontSize: "24px" }}
                                                onClick={(e) => abrirMenuGrupo(grupo, e)}
                                            >
                                                ⋮
                                            </span>
                                            <img
                                                src={deleteIcon}
                                                alt="Eliminar Grupo"
                                                className="delete-icon"
                                                onClick={(e) => handleDeleteClick(e, grupo)}
                                                title="Eliminar Grupo"
                                                aria-label="Eliminar Grupo"
                                            />
                                        </div>

                                        {/* Menú desplegable para el grupo */}
                                        {menuGrupo && menuGrupo.id === grupo.id && (
                                            <div ref={menuRef} className="menu-editar-grupo">
                                                <p className="opcion-menu" onClick={() => {
                                                    abrirModalEditarDocente(grupo);
                                                    cerrarMenuGrupo();
                                                }}>
                                                    Editar Docente
                                                </p>
                                                <p className="opcion-menu eliminar" onClick={() => confirmarEliminarDocente(grupo)}>
                                                    Eliminar Docente
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {tableData ? (
                                        tableData.length === 0 ? (
                                            <p>No hay alumnos registrados en este grupo.</p>
                                        ) : (
                                            <div className="tabla-wrapper">
                                                <table className="tabla-alumnos">
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre Alumno</th>
                                                            <th>Padre</th>
                                                            <th>Domicilio</th>
                                                            <th>Carrera</th>
                                                            <th>No. Control</th>
                                                            <th>Curp</th>
                                                            <th>Turno</th>
                                                            <th>Generación</th>
                                                            <th>Periodo</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>{ /*ELIMINAR POR SI LAS DUDAS POR SI NO FUNCIONA*/}
                                                        {tableData.map((alumno) => {
                                                            console.log("ALUMNO:", alumno);
                                                            return (
                                                                <tr key={alumno.id}>
                                                                    <td className="alumno-con-qr">
                                                                        <img
                                                                            src={QrIcon}
                                                                            alt="QR"
                                                                            className="icono-qr"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                mostrarModalQR(alumno.id, alumno.nombre, alumno.apellidoPaterno, alumno.apellidoMaterno);
                                                                            }}
                                                                            title="Ver código QR"
                                                                            aria-label="Ver código QR"
                                                                        />
                                                                        <span>
                                                                            {alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                                                                        </span>
                                                                    </td>
                                                                    <td className="padre-whatsapp">
                                                                        {alumno.tutorUsuario?.telefono && (
                                                                            <img
                                                                                src={WhatsappIcon}
                                                                                alt="WhatsApp"
                                                                                className="accion-icon whatsapp"
                                                                                onClick={() => abrirWhatsApp(alumno.tutorUsuario.telefono)}
                                                                                title="Enviar WhatsApp"
                                                                                aria-label="Enviar WhatsApp"
                                                                            />
                                                                        )}
                                                                        {alumno.tutorUsuario
                                                                            ? `${alumno.tutorUsuario.nombre} ${alumno.tutorUsuario.apellidopaterno} ${alumno.tutorUsuario.apellidomaterno}`
                                                                            : "Sin Tutor"}

                                                                    </td>
                                                                    <td>{alumno.domicilio}</td>
                                                                    <td>{alumno.carrera}</td>
                                                                    <td>{alumno.numeroControl}</td>
                                                                    <td>{alumno.curp}</td>
                                                                    <td>{alumno.turno}</td>
                                                                    <td>{alumno.generacion}</td>
                                                                    <td>{alumno.ciclo}</td>
                                                                    <td className="acciones">
                                                                        <img
                                                                            src={editIcon}
                                                                            alt="Editar"
                                                                            className="accion-icon editar"
                                                                            onClick={() => abrirModalEditarAlumno(alumno)}
                                                                            title="Editar Alumno"
                                                                            aria-label="Editar Alumno"
                                                                        />
                                                                        <img
                                                                            src={removeIcon}
                                                                            alt="Eliminar"
                                                                            className="accion-icon eliminar"
                                                                            onClick={() => abrirModalEliminarAlumno(alumno)}
                                                                            title="Eliminar Alumno"
                                                                            aria-label="Eliminar Alumno"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    ) : (
                                        expandedGroup &&
                                        expandedGroup.id === grupo.id &&
                                        (alumnosGrupo.length === 0 ? (
                                            <p>No hay alumnos registrados en este grupo.</p>
                                        ) : (
                                            <div className="tabla-wrapper">
                                                <table className="tabla-alumnos">
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre Alumno</th>
                                                            <th>Padre</th>
                                                            <th>Domicilio</th>
                                                            <th>Carrera</th>
                                                            <th>No. Control</th>
                                                            <th>Curp</th>
                                                            <th>Turno</th>
                                                            <th>Generación</th>
                                                            <th>Periodo</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {alumnosGrupo.map((alumno) => (
                                                            <tr key={alumno.id}>
                                                                <td className="alumno-con-qr">
                                                                    <img
                                                                        src={QrIcon}
                                                                        alt="QR"
                                                                        className="icono-qr"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            mostrarModalQR(alumno.id, alumno.nombre, alumno.apellidoPaterno, alumno.apellidoMaterno);
                                                                        }}
                                                                        title="Ver código QR"
                                                                        aria-label="Ver código QR"
                                                                    />
                                                                    <span>
                                                                        {alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                                                                    </span>
                                                                </td>


                                                                {/*SECCION DE LA PARTE DEL WHATS, SI NO FUNCIONA DEBERIAS ELIMINARLO*/}
                                                                <td className="padre-whatsapp">
                                                                    {alumno.tutorUsuario?.telefono && (
                                                                        <img
                                                                            src={WhatsappIcon}
                                                                            alt="WhatsApp"
                                                                            className="accion-icon whatsapp"
                                                                            onClick={() => abrirWhatsApp(alumno.tutorUsuario.telefono)}
                                                                            title="Enviar WhatsApp"
                                                                            aria-label="Enviar WhatsApp"
                                                                        />
                                                                    )}
                                                                    {alumno.tutorUsuario
                                                                        ? `${alumno.tutorUsuario.nombre} ${alumno.tutorUsuario.apellidopaterno} ${alumno.tutorUsuario.apellidomaterno}`
                                                                        : "Sin Tutor"}
                                                                </td>
                                                                <td>{alumno.domicilio}</td>
                                                                <td>{alumno.carrera}</td>
                                                                <td>{alumno.numeroControl}</td>
                                                                <td>{alumno.curp}</td>
                                                                <td>{alumno.turno}</td>
                                                                <td>{alumno.generacion}</td>
                                                                <td>{alumno.ciclo}</td>
                                                                <td className="acciones">
                                                                    <img
                                                                        src={editIcon}
                                                                        alt="Editar"
                                                                        className="accion-icon editar"
                                                                        title="Editar Alumno"
                                                                        aria-label="Editar Alumno"
                                                                    />
                                                                    <img
                                                                        src={removeIcon}
                                                                        alt="Eliminar"
                                                                        className="accion-icon eliminar"
                                                                        onClick={() => abrirModalEliminarAlumno(alumno)}
                                                                        title="Eliminar Alumno"
                                                                        aria-label="Eliminar Alumno"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <Button
                icon="pi pi-plus"
                rounded
                outlined
                severity="help"
                aria-label="Agregar"
                className="boton-agregar"
                onClick={abrirModalGrupo}
            />

            <Dialog
                header="📚 Agregar Grupo"
                visible={modalGrupo}
                style={{ width: '30vw' }}
                onHide={cerrarModalGrupo}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={cerrarModalGrupo}
                        />
                        <Button
                            label="Guardar"
                            icon="pi pi-check"
                            severity="success"
                            onClick={agregarGrupo}
                            autoFocus
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="grid formgrid">
                        <div className="col-6">
                            <label>Grado:</label>
                            <select
                                name="grado"
                                value={nuevoGrupo.grado}
                                onChange={handleChange}
                                className="p-inputtext"
                            >
                                <option value="">Seleccione</option>
                                {[1, 2, 3, 4, 5, 6].map((grado) => (
                                    <option key={grado} value={grado}>
                                        {grado}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-6">
                            <label>Grupo:</label>
                            <select
                                name="letra"
                                value={nuevoGrupo.letra}
                                onChange={handleChange}
                                className="p-inputtext"
                            >
                                <option value="">Seleccione</option>
                                {["A", "B", "C", "D", "E", "F", "G"].map((letra) => (
                                    <option key={letra} value={letra}>
                                        {letra}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="field mt-3">
                        <label>Docente:</label>
                        <InputText
                            name="nombreDocente"
                            value={nuevoGrupo.nombreDocente || ""}
                            onChange={handleChange}
                            placeholder="Nombre del docente"
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                header="¿Confirmar eliminación del alumno?"
                visible={modalEliminarAlumno}
                position="top"
                style={{ width: '30vw' }}
                onHide={cerrarModalEliminarAlumno}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={cerrarModalEliminarAlumno}
                        />
                        <Button
                            label="Sí, eliminar"
                            icon="pi pi-check"
                            severity="danger"
                            onClick={eliminarAlumno}
                            autoFocus
                        />
                    </div>
                }
            >
                <p>
                    ¿Quieres eliminar al alumno <strong>{alumnoSeleccionado?.nombre} {alumnoSeleccionado?.apellidoPaterno} {alumnoSeleccionado?.apellidoMaterno}</strong>?
                </p>
            </Dialog>


            <Dialog
                header="¿Confirmar eliminación del grupo?"
                visible={modalEliminarGrupo}
                position="top"
                style={{ width: '30vw' }}
                onHide={cerrarModalEliminarGrupo}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={cerrarModalEliminarGrupo}
                        />
                        <Button
                            label="Sí, eliminar"
                            icon="pi pi-check"
                            severity="danger"
                            onClick={eliminarGrupo}
                            autoFocus
                        />
                    </div>
                }
            >
                <p>
                    ¿Deseas eliminar el grupo <strong>{grupoSeleccionado?.grado}{grupoSeleccionado?.letra}</strong>
                    {grupoSeleccionado?.nombreDocente && (
                        <> asignado al docente <strong>{grupoSeleccionado.nombreDocente}</strong></>
                    )}?
                    <br /><br />
                    <strong>Atención:</strong> Los alumnos no se eliminarán de la base de datos. Cuando recrees este grupo, volverán a aparecer asignados.
                </p>
            </Dialog>


            {/* MODAL DE EDITAR ALUMNO */}
            <Dialog
                header="✏️ Editar Alumno"
                visible={modalEditarAlumno}
                style={{ width: '35vw' }}
                onHide={cerrarModalEditarAlumno}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={cerrarModalEditarAlumno}
                        />
                        <Button
                            label="Guardar"
                            icon="pi pi-check"
                            onClick={() => actualizarAlumno(alumnoSeleccionado)}
                            autoFocus
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <label className="font-semibold">Nombre:</label>
                    <InputText
                        value={alumnoSeleccionado?.nombre || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, nombre: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">Apellido Paterno:</label>
                    <InputText
                        value={alumnoSeleccionado?.apellidoPaterno || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, apellidoPaterno: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">Apellido Materno:</label>
                    <InputText
                        value={alumnoSeleccionado?.apellidoMaterno || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, apellidoMaterno: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">Grupo:</label>
                    <Select
                        classNamePrefix="my-select"
                        options={groupOptions}
                        value={selectedGroupEdit}
                        onChange={handleGroupChangeSelect}
                        placeholder="Seleccione un grupo..."
                        noOptionsMessage={() => "No hay grupos aún"}
                    />

                    <label className="font-semibold mt-3">Padre:</label>
                    <Select
                        classNamePrefix="my-select"
                        value={selectedTutorEdit}
                        onChange={handleTutorChangeSelect}
                        onInputChange={handleTutorInputChangeEdit}
                        options={tutorOptionsEdit}
                        placeholder="Escriba el nombre del nuevo padre..."
                        noOptionsMessage={() => "No se encontraron coincidencias"}
                    />

                    <label className="font-semibold mt-3">Domicilio:</label>
                    <InputText
                        value={alumnoSeleccionado?.domicilio || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, domicilio: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">Carrera:</label>
                    <select
                        value={alumnoSeleccionado?.carrera || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, carrera: e.target.value }))}
                        className="p-inputtext mb-2"
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

                    <label className="font-semibold">Número de Control:</label>
                    <InputText
                        value={alumnoSeleccionado?.numeroControl || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, numeroControl: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">CURP:</label>
                    <InputText
                        value={alumnoSeleccionado?.curp || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, curp: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">Turno:</label>
                    <InputText
                        value={alumnoSeleccionado?.turno || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, turno: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">Generación:</label>
                    <InputText
                        value={alumnoSeleccionado?.generacion || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, generacion: e.target.value }))}
                        className="mb-2"
                    />

                    <label className="font-semibold">Periodo Escolar:</label>
                    <InputText
                        value={alumnoSeleccionado?.ciclo || ""}
                        onChange={e => setAlumnoSeleccionado(prev => ({ ...prev, ciclo: e.target.value }))}
                        className="mb-2"
                    />
                </div>
            </Dialog>

            <Dialog
                header="✏️ Editar Docente"
                visible={modalEditarDocente}
                style={{ width: '30vw' }}
                onHide={cerrarModalEditarDocente}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={cerrarModalEditarDocente}
                        />
                        <Button
                            label="Guardar Cambios"
                            icon="pi pi-check"
                            onClick={actualizarGrupoDocente}
                            severity="success"
                            autoFocus
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <label className="font-semibold">Nombre del Docente:</label>
                    <InputText
                        value={grupoDocenteEditado?.nombreDocente || ""}
                        onChange={(e) =>
                            setGrupoDocenteEditado({
                                ...grupoDocenteEditado,
                                nombreDocente: e.target.value,
                            })
                        }
                        placeholder="Nombre del docente"
                    />
                </div>
            </Dialog>

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
                    <img
                        src={qrCompositeUrl}
                        alt="Código QR con nombre"
                        style={{ width: "100%", maxWidth: "250px", borderRadius: "8px" }}
                    />
                </div>
            </Dialog>
            <Dialog
                header="❗ Confirmar eliminación"
                visible={showConfirmEliminarDocente}
                position="top"
                style={{ width: '30vw' }}
                onHide={() => setShowConfirmEliminarDocente(false)}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setShowConfirmEliminarDocente(false)}
                        />
                        <Button
                            label="Sí, eliminar"
                            icon="pi pi-check"
                            severity="danger"
                            onClick={eliminarDocenteDelGrupo}
                            autoFocus
                        />
                    </div>
                }
            >
                <p>
                    ¿Estás seguro de que deseas eliminar al docente del grupo{" "}
                    <strong>{grupoDocenteAEliminar?.grado}{grupoDocenteAEliminar?.letra}</strong>?
                    <br />
                    Esta acción no elimina el grupo ni los alumnos.
                </p>
            </Dialog>

        </div>
    );
};

export default ListaAlumnos;