import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ListaAlumnos.css";
import addIcon from "./assets/agregar-grupo.png";
import Select from "react-select";
import deleteIcon from "./assets/borrar.png";
import editIcon from "./assets/editar-informacion.png";
import removeIcon from "./assets/eliminar-informacion.png";
import aceptarIcon from "./assets/aceptar.png";
import rechazarIcon from "./assets/rechazar.png";
import WhatsappIcon from "./assets/whatsapp.png";
import QrIcon from "./assets/codigo-qr.png";

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
        axios.get("http://localhost:5099/api/carreras")
            .then(resp => {
                setCarreraOptions(resp.data.map(c => ({
                    value: c.nombre,
                    label: c.nombre
                })));
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (grupos.length > 0) {
            const fetchAllStudents = async () => {
                const newAlumnosPorGrupo = {};
                for (const grupo of grupos) {
                    const groupString = `${grupo.grado}${grupo.letra}`;
                    try {
                        // Asegúrate de que este endpoint incluya TutorUsuario (usando Include en el backend)
                        const response = await axios.get(`http://localhost:5099/api/alumnos/grupo/${groupString}`);
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

    useEffect(() => {
        if (grupos.length > 0) {
            const fetchAllStudents = async () => {
                const newAlumnosPorGrupo = {};
                for (const grupo of grupos) {
                    const groupString = `${grupo.grado}${grupo.letra}`;
                    try {
                        const response = await axios.get(`http://localhost:5099/api/alumnos/grupo/${groupString}`);
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
            const response = await axios.get(`http://localhost:5099/api/usuarios/autocompletePadres?termino=${inputValue}`);
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

    const handleCarreraChangeEdit = option => {
        setSelectedCarreraEdit(option);
        setAlumnoSeleccionado(prev => ({
            ...prev,
            carrera: option ? option.value : ""
        }));
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
            const response = await axios.get("http://localhost:5099/api/grupos");
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
            alert("❌ Por favor, seleccione un grupo.");
            return;
        }

        // 2) Verificar que ese grupo exista en tu lista de grupos
        const grupoExistente = grupos.find(
            (g) => `${g.grado}${g.letra}` === alumno.grupo
        );
        if (!grupoExistente) {
            alert("❌ El grupo seleccionado no existe.");
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
                `http://localhost:5099/api/alumnos/editar/${alumno.id}`,
                alumnoParaActualizar
            );
            alert(response.data.mensaje);
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
            alert(
                "❌ No se pudo actualizar al alumno. " +
                (error.response?.data?.mensaje || error.message)
            );
        }
    };

    /*FIN DE EDITAR */

    const handleChange = (e) => {
        setNuevoGrupo({ ...nuevoGrupo, [e.target.name]: e.target.value });
    };

    const agregarGrupo = async () => {
        if (!nuevoGrupo.grado || !nuevoGrupo.letra || !nuevoGrupo.nombreDocente) {
            alert("Por favor, complete todos los campos.");
            return;
        }
        try {
            await axios.post("http://localhost:5099/api/grupos/agregar", nuevoGrupo);
            alert("✅ Grupo agregado correctamente.");
            obtenerGrupos();
            cerrarModalGrupo();
        } catch (error) {
            console.error("Error al agregar grupo:", error);
            alert("❌ No se pudo agregar el grupo.");
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
            const response = await axios.get(`http://localhost:5099/api/alumnos/grupo/${groupString}`);
            setAlumnosGrupo(response.data);
            setExpandedGroup(grupo);
        } catch (error) {
            console.error("Error al obtener alumnos del grupo:", error);
            alert("❌ No se pudieron obtener los alumnos de este grupo.");
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
            await axios.delete(`http://localhost:5099/api/grupos/eliminar/${grupoSeleccionado.id}`);
            alert("✅ Grupo eliminado exitosamente.");
            setGrupos(grupos.filter((g) => g.id !== grupoSeleccionado.id));
            if (expandedGroup && expandedGroup.id === grupoSeleccionado.id) {
                setExpandedGroup(null);
                setAlumnosGrupo([]);
            }
            cerrarModalEliminarGrupo();
        } catch (error) {
            console.error("Error al eliminar grupo:", error);
            alert("❌ No se pudo eliminar el grupo.");
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
            await axios.delete(`http://localhost:5099/api/alumnos/eliminar/${alumnoSeleccionado.id}`);
            alert("✅ Alumno eliminado correctamente.");
            setAlumnosGrupo(alumnosGrupo.filter((al) => al.id !== alumnoSeleccionado.id));
            cerrarModalEliminarAlumno();
        } catch (error) {
            console.error("Error al eliminar alumno:", error);
            alert("❌ No se pudo eliminar al alumno.");
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
            alert("❌ Por favor, seleccione el grado y el grupo.");
            return;
        }
        try {
            const response = await axios.put(
                `http://localhost:5099/api/grupos/editar/${grupoDocenteEditado.id}`,
                grupoDocenteEditado
            );
            alert(response.data.mensaje);
            obtenerGrupos();
            cerrarModalEditarDocente();
        } catch (error) {
            console.error(
                "Error al actualizar grupo y docente:",
                error.response?.data || error.message
            );
            alert(
                "❌ No se pudo actualizar el grupo y el docente. " +
                (error.response?.data.mensaje || error.message)
            );
        }
    };
    //FUNCION PARA LA CONFIRMACION DE ELIMINAR DOCENTE
    const confirmarEliminarDocente = async (grupo) => {
        const confirmacion = window.confirm("¿Está seguro que desea eliminar el docente?");
        if (!confirmacion) return;

        try {
            // Llamada al nuevo endpoint para eliminar el docente
            const response = await axios.put(`http://localhost:5099/api/grupos/eliminarDocente/${grupo.id}`);
            alert(response.data.mensaje);
            obtenerGrupos();
            cerrarMenuGrupo();
        } catch (error) {
            console.error("Error al eliminar el docente:", error.response?.data || error.message);
            alert("❌ No se pudo eliminar el docente: " + (error.response?.data.mensaje || error.message));
        }
    };

    //PARA EL QR
    const [qrUrl, setQrUrl] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [nombreArchivoQR, setNombreArchivoQR] = useState("QR_Alumno");

    const mostrarModalQR = async (alumnoId, nombre, apellidoPaterno, apellidoMaterno) => {
        try {
            // 1) Prepara el nombre completo y el nombre de archivo
            const fullName = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
            setNombreCompletoQR(fullName);
            setNombreArchivoQR(`QR_${fullName.replace(/\s+/g, "_")}`);

            const response = await axios.get(`http://localhost:5099/api/alumnos/qr/${alumnoId}`, {
                responseType: "blob"
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
            alert("❌ No se pudo generar el código QR con el nombre.");
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
            <div className="lista-content">
                <div className="lista-search-container">
                    <input
                        type="text"
                        placeholder="Buscar un grupo y alumno por su nombre o por carrera"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button className="lista-search-button">🔍</button>
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
            <button className="boton-agregar" onClick={abrirModalGrupo}
                title="Agregar Grupo"
                aria-label="Agregar Grupo"
            >
                <img src={addIcon} alt="Agregar Grupo" />
            </button>

            {modalGrupo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={cerrarModalGrupo}>
                            ✖
                        </button>
                        <h2 className="modal-title">Agregar Grupo</h2>
                        <div className="form-group">
                            <div className="select-container">
                                <div className="input-group">
                                    <label>Grado:</label>
                                    <select name="grado" value={nuevoGrupo.grado} onChange={handleChange}>
                                        <option value="">Seleccione</option>
                                        {[1, 2, 3, 4, 5, 6].map((grado) => (
                                            <option key={grado} value={grado}>
                                                {grado}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Grupo:</label>
                                    <select name="letra" value={nuevoGrupo.letra} onChange={handleChange}>
                                        <option value="">Seleccione</option>
                                        {["A", "B", "C", "D", "E", "F", "G"].map((letra) => (
                                            <option key={letra} value={letra}>
                                                {letra}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Docente:</label>
                                <input
                                    type="text"
                                    name="nombreDocente"
                                    value={nuevoGrupo.nombreDocente || ""}
                                    onChange={handleChange}
                                    placeholder="Nombre del docente"
                                />
                            </div>
                        </div>
                        <button className="save-button" onClick={agregarGrupo}>
                            Guardar
                        </button>
                    </div>
                </div>
            )}

            {modalEliminarAlumno && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={cerrarModalEliminarAlumno}>
                            &times;
                        </button>
                        <h2>¿Estás seguro?</h2>
                        <p>
                            ¿Quieres eliminar al alumno {alumnoSeleccionado?.nombre}{" "}
                            {alumnoSeleccionado?.apellidoPaterno} {alumnoSeleccionado?.apellidoMaterno}?
                        </p>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={eliminarAlumno}>
                                <img src={aceptarIcon} alt="Aceptar" />
                            </button>
                            <button className="cancel-button" onClick={cerrarModalEliminarAlumno}>
                                <img src={rechazarIcon} alt="Cancelar" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalEliminarGrupo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={cerrarModalEliminarGrupo}>
                            &times;
                        </button>
                        <h2>¿Estás seguro?</h2>
                        <p>
                            ¿Deseas eliminar el grupo {grupoSeleccionado?.grado}
                            {grupoSeleccionado?.letra}
                            {grupoSeleccionado?.nombreDocente &&
                                `, asignado al docente ${grupoSeleccionado.nombreDocente}`}?
                            <br /><br />
                            <strong>Atención:</strong> Los alumnos no se eliminarán de la base de datos. Cuando recrees este grupo, volverán a aparecer asignados.
                        </p>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={eliminarGrupo}>
                                <img src={aceptarIcon} alt="Aceptar" />
                            </button>
                            <button className="cancel-button" onClick={cerrarModalEliminarGrupo}>
                                <img src={rechazarIcon} alt="Cancelar" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EDITAR ALUMNO */}
            {modalEditarAlumno && alumnoSeleccionado && (
                <div className="modal-editar-overlay">
                    <div className="modal-editar-content">
                        <button className="close-button" onClick={cerrarModalEditarAlumno}>✖</button>
                        <h2 className="modal-title">Editar Alumno</h2>

                        <div className="input-container">
                            <label>Nombre:</label>
                            <input
                                type="text"
                                name="nombre"
                                value={alumnoSeleccionado.nombre}
                                onChange={e =>
                                    setAlumnoSeleccionado(prev => ({
                                        ...prev,
                                        nombre: e.target.value
                                    }))
                                }
                            />
                        </div>

                        <div className="input-container">
                            <label>Apellido Paterno:</label>
                            <input
                                type="text"
                                name="apellidoPaterno"
                                value={alumnoSeleccionado.apellidoPaterno}
                                onChange={(e) =>
                                    setAlumnoSeleccionado(prev => ({
                                        ...prev,
                                        alumnoSeleccionado, apellidoPaterno: e.target.value
                                    }))
                                }
                            />
                        </div>

                        <div className="input-container">
                            <label>Apellido Materno:</label>
                            <input
                                type="text"
                                name="apellidoMaterno"
                                value={alumnoSeleccionado.apellidoMaterno}
                                onChange={(e) =>
                                    setAlumnoSeleccionado(prev => ({
                                        ...prev,
                                        alumnoSeleccionado, apellidoMaterno: e.target.value
                                    }))
                                }
                            />
                        </div>
                        <div className="input-container">
                            <label>Grupo:</label>
                            <Select
                                classNamePrefix="my-select"
                                options={groupOptions}
                                value={selectedGroupEdit}
                                onChange={handleGroupChangeSelect}
                                placeholder="Seleccione un grupo..."
                                noOptionsMessage={() => "No hay grupos aún"}
                            />
                        </div>

                        {/* Selección del tutor en el modal de edición */}
                        <div className="input-container">
                            <label>Padre:</label>
                            <Select
                                classNamePrefix="my-select"
                                value={selectedTutorEdit}
                                onChange={handleTutorChangeSelect}
                                onInputChange={handleTutorInputChangeEdit}
                                options={tutorOptionsEdit}
                                placeholder="Escriba el nombre del nuevo padre..."
                                noOptionsMessage={() => "No se encontraron coincidencias"}
                            />
                        </div>

                        <div className="input-container">
                            <label>Domicilio:</label>
                            <input
                                type="text"
                                name="domicilio"
                                value={alumnoSeleccionado.domicilio}
                                onChange={(e) =>
                                    setAlumnoSeleccionado(prev => ({
                                        ...prev,
                                        alumnoSeleccionado, domicilio: e.target.value
                                    }))
                                }
                            />
                        </div>

                        {/* Carrera */}
                        <div className="input-container">
                            <label>Carrera:</label>
                            <select
                                name="carrera"
                                value={alumnoSeleccionado.carrera || ""}
                                onChange={e =>
                                    setAlumnoSeleccionado({
                                        ...alumnoSeleccionado,
                                        carrera: e.target.value
                                    })
                                }
                            >
                                <option value="">Seleccione una carrera</option>
                                <option value="CIENCIA DE DATOS E INFORMACIÓN">CIENCIA DE DATOS E INFORMACIÓN </option>
                                <option value="CONSTRUCCIÓN">CONSTRUCCIÓN</option>
                                <option value="CONTABILIDAD">CONTABILIDAD</option>
                                <option value="LABORATORISTA CLÍNICO">LABORATORISTA CLÍNICO</option>
                                <option value="MANTENIMIENTO AUTOMOTRIZ">MANTENIMIENTO AUTOMOTRIZ</option>
                                <option value="MECATRÓNICA">MECATRÓNICA</option>
                                <option value="PUERICULTURA">PUERICULTURA</option>
                            </select>
                        </div>

                        {/* Número de Control */}
                        <div className="input-container">
                            <label>Número de Control:</label>
                            <input
                                type="text"
                                name="numeroControl"
                                value={alumnoSeleccionado.numeroControl || ""}
                                onChange={(e) =>
                                    setAlumnoSeleccionado(prev => ({
                                        ...prev,
                                        alumnoSeleccionado, numeroControl: e.target.value
                                    }))
                                }
                            />
                        </div>

                        {/* CURP */}
                        <div className="input-container">
                            <label>CURP:</label>
                            <input
                                type="text"
                                name="curp"
                                value={alumnoSeleccionado.curp || ""}
                                onChange={(e) =>
                                    setAlumnoSeleccionado(prev => ({
                                        ...prev,
                                        alumnoSeleccionado, curp: e.target.value
                                    }))
                                }
                            />
                        </div>

                        {/* Turno */}
                        <div className="input-container">
                            <label>Turno:</label>
                            <input
                                type="text"
                                name="turno"
                                value={alumnoSeleccionado.turno || ""}
                                onChange={e =>
                                    setAlumnoSeleccionado({ ...alumnoSeleccionado, turno: e.target.value })
                                }
                            />
                        </div>

                        {/* Generación */}
                        <div className="input-container">
                            <label>Generación:</label>
                            <input
                                type="text"
                                name="generacion"
                                value={alumnoSeleccionado.generacion || ""}
                                onChange={e =>
                                    setAlumnoSeleccionado({ ...alumnoSeleccionado, generacion: e.target.value })
                                }
                            />
                        </div>

                        {/* Periodo Escolar (Ciclo) */}
                        <div className="input-container">
                            <label>Periodo Escolar:</label>
                            <input
                                type="text"
                                name="Ciclo"
                                value={alumnoSeleccionado.ciclo || ""}
                                onChange={e =>
                                    setAlumnoSeleccionado({ ...alumnoSeleccionado, ciclo: e.target.value })
                                }
                            />
                        </div>

                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={() => actualizarAlumno(alumnoSeleccionado)}>
                                <img src={aceptarIcon} alt="Aceptar" />
                            </button>
                            <button className="cancel-button" onClick={cerrarModalEditarAlumno}>
                                <img src={rechazarIcon} alt="Cancelar" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalEditarDocente && grupoDocenteEditado && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={cerrarModalEditarDocente}>
                            ✖
                        </button>
                        <h2 className="modal-title">Editar Docente</h2>
                        <div className="form-group">
                            <div className="select-container">
                                {/* AQUI IRIA SI SE VUELVE  PONER LO DE EDITAR GRUPO*/}
                            </div>
                            <div className="input-container">
                                <label>Nombre del Docente:</label>
                                <input
                                    type="text"
                                    value={grupoDocenteEditado.nombreDocente}
                                    onChange={(e) =>
                                        setGrupoDocenteEditado({
                                            ...grupoDocenteEditado,
                                            nombreDocente: e.target.value,
                                        })
                                    }
                                    placeholder="Nombre del docente"
                                />
                            </div>
                        </div>
                        <div className="modal-buttons" style={{ justifyContent: "center", gap: "20px" }}>
                            <button className="save-button" onClick={actualizarGrupoDocente}>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showQrModal && qrCompositeUrl && (
                <div className="modal-qr">
                    <div className="modal-qr-content">
                        <span className="close" onClick={() => setShowQrModal(false)}>×</span>
                        <h3>Código QR de {nombreCompletoQR}</h3>
                        <img src={qrCompositeUrl} alt="QR con nombre" className="qr-image" />
                        <a
                            href={qrCompositeUrl}
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

export default ListaAlumnos;