    import { useState, useEffect, useRef } from "react";
    import axios from "axios";
    import "./ListaAlumnos.css";
    import addIcon from "./assets/agregar-grupo.png";
    import Select from "react-select"; // Importamos react-select
    import deleteIcon from "./assets/borrar.png";
    import editIcon from "./assets/editar-informacion.png";
    import removeIcon from "./assets/eliminar-informacion.png";
    import aceptarIcon from "./assets/aceptar.png"; // Ícono de aceptar
    import rechazarIcon from "./assets/rechazar.png"; // Ícono de rechazar
    import WhatsappIcon from "./assets/whatsapp.png";


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
        const [menuGrupo, setMenuGrupo] = useState(null); // Guardará el grupo que tenga abierto el menú
        const [modalEditarDocente, setModalEditarDocente] = useState(false);
        const [grupoDocenteEditado, setGrupoDocenteEditado] = useState(null);
        const menuRef = useRef(null); // Referencia para el menú

        useEffect(() => {
            obtenerGrupos();
        }, []);

        useEffect(() => {
            if (grupos.length > 0) {
                const fetchAllStudents = async () => {
                    const newAlumnosPorGrupo = {};
                    for (const grupo of grupos) {
                        const groupString = `${grupo.grado}${grupo.letra}`;
                        try {
                            // Asegúrate de que este endpoint incluya TutorUsuario (usando Include en el backend)
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

            // Si el menú está abierto, agrega el event listener
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
                    label: `${padre.nombre} ${padre.apellidos} - ${padre.correo}`
                }));
                setTutorOptionsEdit(optionsData);
            } catch (error) {
                console.error("Error al buscar padres (modal edición):", error);
            }
        };
        const handleTutorInputChangeEdit = (inputValue, { action }) => {
            if (action === "input-change") {
                fetchTutorOptionsEdit(inputValue);
                return inputValue; // Retorna el valor escrito para que se muestre correctamente
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
        const abrirModalEditarAlumno = (alumno) => {
            let grado = "";
            let grupo = "";
            if (alumno.Grupo) {
                const matchGrade = alumno.Grupo.match(/\d+/);
                const matchGroup = alumno.Grupo.match(/[A-Za-z]+/);
                grado = matchGrade ? matchGrade[0] : "";
                grupo = matchGroup ? matchGroup[0] : "";
            } else {
                grado = alumno.grado || "";
                grupo = alumno.grupo || "";
            }
            setAlumnoSeleccionado({ ...alumno, grado, grupo });
            // Inicializa el autocompletado si ya existe tutor asignado
            if (alumno.tutorId && alumno.TutorUsuario) {
                setSelectedTutorEdit({
                    value: alumno.tutorId,
                    label: `${alumno.TutorUsuario.nombre} ${alumno.TutorUsuario.apellidos} - ${alumno.TutorUsuario.correo}`
                });
            } else {
                setSelectedTutorEdit(null);
            }
            setModalEditarAlumno(true);
        };

        const cerrarModalEditarAlumno = () => {
            setModalEditarAlumno(false);
            setAlumnoSeleccionado(null);
        };

        const actualizarAlumno = async (alumno) => {
            if (!alumno.grado || !alumno.grupo) {
                alert("❌ Por favor, seleccione el grado y el grupo.");
                return;
            }
            const grupoExistente = grupos.find(
                (g) =>
                    g.grado.toString() === alumno.grado.toString() &&
                    g.letra.toLowerCase() === alumno.grupo.toLowerCase()
            );
            if (!grupoExistente) {
                alert("❌ El grupo seleccionado no existe.");
                return;
            }

            try {
                // Desestructuramos para excluir TutorUsuario
                const { tutorUsuario: _unused, ...alumnoSinTutor } = alumno;
                const alumnoParaActualizar = {
                    ...alumnoSinTutor,
                    Grupo: `${alumno.grado}${alumno.grupo}`,
                };

                const response = await axios.put(
                    `/api/alumnos/editar/${alumno.id}`,
                    alumnoParaActualizar
                );

                alert(response.data.mensaje);
                setAlumnosGrupo(
                    alumnosGrupo.map((al) =>
                        al.id === alumno.id ? alumnoParaActualizar : al
                    )
                );
                cerrarModalEditarAlumno();
            } catch (error) {
                console.error(
                    "Error al actualizar alumno:",
                    error.response?.data || error.message
                );
                alert(
                    "❌ No se pudo actualizar al alumno. " +
                    (error.response?.data.mensaje || error.message)
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
                await axios.post("/api/grupos/agregar", nuevoGrupo);
                alert("✅ Grupo agregado correctamente.");
                obtenerGrupos(); // Actualiza la lista de grupos
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
                const response = await axios.get(`/api/alumnos/grupo/${groupString}`);
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
                await axios.delete(`/api/grupos/eliminar/${grupoSeleccionado.id}`);
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
                await axios.delete(`/api/alumnos/eliminar/${alumnoSeleccionado.id}`);
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
                    removeDiacritics((alumno.nombre + " " + alumno.apellidos).toLowerCase()).includes(normalizedSearch)
                );
                return matchGroup || matchAlumno;
            })
            : grupos;

        // Abre el menú de edición para el grupo seleccionado
        const abrirMenuGrupo = (grupo, e) => {
            e.stopPropagation(); // Evita que se active otro evento (por ejemplo, la expansión de la carta)
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
            // Puedes agregar validaciones adicionales si es necesario
            if (!grupoDocenteEditado.grado || !grupoDocenteEditado.letra) {
                alert("❌ Por favor, seleccione el grado y el grupo.");
                return;
            }
            try {
                const response = await axios.put(
                    `/api/grupos/editar/${grupoDocenteEditado.id}`,
                    grupoDocenteEditado
                );
                alert(response.data.mensaje);
                obtenerGrupos(); // Actualiza la lista de grupos
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
                const response = await axios.put(`/api/grupos/eliminarDocente/${grupo.id}`);
                alert(response.data.mensaje);
                obtenerGrupos(); // Actualiza la lista de grupos
                cerrarMenuGrupo();
            } catch (error) {
                console.error("Error al eliminar el docente:", error.response?.data || error.message);
                alert("❌ No se pudo eliminar el docente: " + (error.response?.data.mensaje || error.message));
            }
        };

        // Constante para la parte del whats
        const abrirWhatsApp = (telefono) => {
            window.open(`https://wa.me/${telefono}?text=`,"_blank");
        };

        return (
            <div className="lista-container">
                <div className="lista-content">
                    <div className="lista-search-container">
                        <input
                            type="text"
                            placeholder="Buscar un grupo o alumno por su nombre"
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
                                            removeDiacritics((alumno.nombre + " " + alumno.apellidos).toLowerCase()).includes(normalizedSearch)
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
                                                {grupo.grado}{grupo.letra}
                                            </h3>
                                            {grupo.nombreDocente && <p>Docente: {grupo.nombreDocente}</p>}
                                            <div className="acciones-grupo" style={{ display: "flex", gap: "10px" }}>
                                                {/* Icono para mostrar el menú (puedes reemplazar el contenido por una imagen si la tienes) */}
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
                                                />
                                            </div>
                                            {/* Menú desplegable para el grupo */}
                                            {menuGrupo && menuGrupo.id === grupo.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="menu-editar-grupo"
                                                    style={{
                                                        position: "absolute",
                                                        background: "#fff",
                                                        boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
                                                        borderRadius: "5px",
                                                        padding: "5px 10px",
                                                        zIndex: "1100",
                                                        right: "10px", // Ajusta según la posición deseada
                                                        top: "30px",   // Ajusta según la posición deseada
                                                    }}
                                                >
                                                    <p
                                                        style={{ cursor: "pointer", margin: 0, padding: "5px 0" }}
                                                        onClick={() => {
                                                            abrirModalEditarDocente(grupo);
                                                            cerrarMenuGrupo();
                                                        }}
                                                    >
                                                        Editar Grupo
                                                    </p>
                                                    <p
                                                        style={{ cursor: "pointer", margin: 0, padding: "5px 0", color: "red" }}
                                                        onClick={() => confirmarEliminarDocente(grupo)}
                                                    >
                                                        Eliminar Docente
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {tableData ? (
                                            tableData.length === 0 ? (
                                                <p>No hay alumnos registrados en este grupo.</p>
                                            ) : (
                                                <table className="tabla-alumnos">
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre Alumno</th>
                                                            <th>Padre</th>
                                                            <th>Domicilio</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                        <tbody>{ /*ELIMINAR POR SI LAS DUDAS POR SI NO FUNCIONA*/}
                                                            {tableData.map((alumno) => {
                                                                console.log("ALUMNO:", alumno); // 👈 Esto muestra en consola los datos recibidos
                                                                return (
                                                                    <tr key={alumno.id}>
                                                                        <td>
                                                                            {alumno.nombre} {alumno.apellidos}
                                                                        </td>
                                                                        <td className="padre-whatsapp">
                                                                            {alumno.tutorUsuario?.telefono && (
                                                                                <img
                                                                                    src={WhatsappIcon}
                                                                                    alt="WhatsApp"
                                                                                    className="accion-icon whatsapp"
                                                                                    onClick={() => abrirWhatsApp(alumno.tutorUsuario.telefono)}
                                                                                />
                                                                            )}
                                                                            {alumno.tutorUsuario
                                                                                ? `${alumno.tutorUsuario.nombre} ${alumno.tutorUsuario.apellidos}`
                                                                                : "Sin Tutor"}
                                                                        </td>
                                                                        <td>{alumno.domicilio}</td>
                                                                        <td className="acciones">
                                                                            <img
                                                                                src={editIcon}
                                                                                alt="Editar"
                                                                                className="accion-icon editar"
                                                                                onClick={() => abrirModalEditarAlumno(alumno)}
                                                                            />
                                                                            <img
                                                                                src={removeIcon}
                                                                                alt="Eliminar"
                                                                                className="accion-icon eliminar"
                                                                                onClick={() => abrirModalEliminarAlumno(alumno)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                </table>
                                            )
                                        ) : (
                                            expandedGroup &&
                                            expandedGroup.id === grupo.id &&
                                            (alumnosGrupo.length === 0 ? (
                                                <p>No hay alumnos registrados en este grupo.</p>
                                            ) : (
                                                <table className="tabla-alumnos">
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre Alumno</th>
                                                            <th>Padre</th>
                                                            <th>Domicilio</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {alumnosGrupo.map((alumno) => (
                                                            <tr key={alumno.id}>
                                                                <td>
                                                                    {alumno.nombre} {alumno.apellidos}
                                                                </td>
                                                                {/*SECCION DE LA PARTE DEL WHATS, SI NO FUNCIONA DEBERIAS ELIMINARLO*/ }
                                                                <td className="padre-whatsapp">
                                                                    {alumno.tutorUsuario?.telefono && (
                                                                        <img
                                                                            src={WhatsappIcon}
                                                                            alt="WhatsApp"
                                                                            className="accion-icon whatsapp"
                                                                            onClick={() => abrirWhatsApp(alumno.tutorUsuario.telefono)}
                                                                        />
                                                                    )}
                                                                    {alumno.tutorUsuario
                                                                        ? `${alumno.tutorUsuario.nombre} ${alumno.tutorUsuario.apellidos}`
                                                                        : "Sin Tutor"}
                                                                </td>
                                                                <td>{alumno.domicilio}</td>
                                                                <td className="acciones">
                                                                    <img
                                                                        src={editIcon}
                                                                        alt="Editar"
                                                                        className="accion-icon editar"
                                                                    />
                                                                    <img
                                                                        src={removeIcon}
                                                                        alt="Eliminar"
                                                                        className="accion-icon eliminar"
                                                                        onClick={() => abrirModalEliminarAlumno(alumno)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ))
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <button className="boton-agregar" onClick={abrirModalGrupo}>
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
                                            {["A", "B", "C", "D", "E", "F"].map((letra) => (
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
                                {alumnoSeleccionado?.apellidos}?
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
                                <strong>Atención:</strong> Al eliminar este grupo se eliminarán todos los alumnos asociados.
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
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-button" onClick={cerrarModalEditarAlumno}>✖</button>
                            <h2 className="modal-title">Editar Alumno</h2>

                            <div className="input-container">
                                <label>Nombre:</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={alumnoSeleccionado.nombre}
                                    onChange={(e) => setAlumnoSeleccionado({ ...alumnoSeleccionado, nombre: e.target.value })}
                                />
                            </div>

                            <div className="input-container">
                                <label>Apellidos:</label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={alumnoSeleccionado.apellidos}
                                    onChange={(e) => setAlumnoSeleccionado({ ...alumnoSeleccionado, apellidos: e.target.value })}
                                />
                            </div>

                            <div className="select-container">
                                <div>
                                    <label>Grado:</label>
                                    <select
                                        name="grado"
                                        value={alumnoSeleccionado.grado}
                                        onChange={(e) => setAlumnoSeleccionado({ ...alumnoSeleccionado, grado: e.target.value })}
                                    >
                                        <option value="">Seleccione</option>
                                        {[1, 2, 3, 4, 5, 6].map((grado) => (
                                            <option key={grado} value={grado}>{grado}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Grupo:</label>
                                    <select
                                        name="grupo"
                                        value={alumnoSeleccionado.grupo}
                                        onChange={(e) => setAlumnoSeleccionado({ ...alumnoSeleccionado, grupo: e.target.value })}
                                    >
                                        <option value="">Seleccione</option>
                                        {["A", "B", "C", "D", "E", "F"].map((letra) => (
                                            <option key={letra} value={letra}>{letra}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Selección del tutor en el modal de edición */}
                            <div className="input-container">
                                <label>Tutor:</label>
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
                                    onChange={(e) => setAlumnoSeleccionado({ ...alumnoSeleccionado, domicilio: e.target.value })}
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
                            <h2 className="modal-title">Editar Grupo</h2>
                            <div className="form-group">
                                <div className="select-container">
                                    <div className="input-group">
                                        <label>Grado:</label>
                                        <select
                                            name="grado"
                                            value={grupoDocenteEditado.grado}
                                            onChange={(e) =>
                                                setGrupoDocenteEditado({
                                                    ...grupoDocenteEditado,
                                                    grado: e.target.value,
                                                })
                                            }
                                        >
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
                                        <select
                                            name="letra"
                                            value={grupoDocenteEditado.letra}
                                            onChange={(e) =>
                                                setGrupoDocenteEditado({
                                                    ...grupoDocenteEditado,
                                                    letra: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Seleccione</option>
                                            {["A", "B", "C", "D", "E", "F"].map((letra) => (
                                                <option key={letra} value={letra}>
                                                    {letra}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
            </div>
        );
    };

    export default ListaAlumnos;
