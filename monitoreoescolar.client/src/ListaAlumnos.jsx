import { useState, useEffect } from "react";
import axios from "axios";
import "./ListaAlumnos.css";
import addIcon from "./assets/agregar-grupo.png";
import deleteIcon from "./assets/borrar.png";
import editIcon from "./assets/editar-informacion.png";
import removeIcon from "./assets/eliminar-informacion.png";
import aceptarIcon from "./assets/aceptar.png"; // Ícono de aceptar
import rechazarIcon from "./assets/rechazar.png"; // Ícono de rechazar

const ListaAlumnos = () => {
    const [grupos, setGrupos] = useState([]);
    const [modalGrupo, setModalGrupo] = useState(false);
    const [nuevoGrupo, setNuevoGrupo] = useState({ grado: "", letra: "" });
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

    useEffect(() => {
        obtenerGrupos();
    }, []);

    useEffect(() => {
        // Una vez que tenemos los grupos, obtenemos los alumnos de cada grupo
        if (grupos.length > 0) {
            const fetchAllStudents = async () => {
                const newAlumnosPorGrupo = {};
                for (const grupo of grupos) {
                    const groupString = `${grupo.grado}${grupo.letra}`;
                    try {
                        // Asegúrate de que este endpoint incluya el TutorUsuario (usando Include en el backend)
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

    const obtenerGrupos = async () => {
        try {
            const response = await axios.get("http://localhost:5099/api/grupos");
            const gruposOrdenados = response.data.sort((a, b) => {
                const gradeA = parseInt(a.grado, 10);
                const gradeB = parseInt(b.grado, 10);
                if (gradeA !== gradeB) {
                    return gradeA - gradeB;
                }
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
            const alumnoParaActualizar = {
                ...alumno,
                Grupo: `${alumno.grado}${alumno.grupo}`,
            };

            const response = await axios.put(
                `http://localhost:5099/api/alumnos/editar/${alumno.id}`,
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
        if (!nuevoGrupo.grado || !nuevoGrupo.letra) {
            alert("Por favor, selecciona el grado y la letra del grupo.");
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
                removeDiacritics((alumno.nombre + " " + alumno.apellidos).toLowerCase()).includes(normalizedSearch)
            );
            return matchGroup || matchAlumno;
        })
        : grupos;

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
                                            {grupo.grado}
                                            {grupo.letra}
                                        </h3>
                                        <img
                                            src={deleteIcon}
                                            alt="Eliminar Grupo"
                                            className="delete-icon"
                                            onClick={(e) => handleDeleteClick(e, grupo)}
                                        />
                                    </div>
                                    {tableData ? (
                                        tableData.length === 0 ? (
                                            <p>No hay alumnos registrados en este grupo.</p>
                                        ) : (
                                            <table className="tabla-alumnos">
                                                <thead>
                                                    <tr>
                                                        <th>Nombre Completo</th>
                                                        <th>Tutor</th>
                                                        <th>Domicilio</th>
                                                        <th>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableData.map((alumno) => (
                                                        <tr key={alumno.id}>
                                                            <td>
                                                                {alumno.nombre} {alumno.apellidos}
                                                            </td>
                                                            <td>
                                                                {alumno.tutorUsuario
                                                                    ? `${alumno.tutorUsuario.Nombre} ${alumno.tutorUsuario.Apellidos}`
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
                                                    ))}
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
                                                        <th>Nombre Completo</th>
                                                        <th>Tutor</th>
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
                                                            <td>
                                                                {alumno.tutorUsuario
                                                                    ? `${alumno.tutorUsuario.Nombre} ${alumno.tutorUsuario.Apellidos}`
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
                        <div className="select-container">
                            <div>
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
                            <div>
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
                            {grupoSeleccionado?.letra}?
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

            {/* MODAL DE EDITAR */}
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

                        {/* En edición, si requieres mostrar el tutor asociado, puedes hacerlo de forma similar */}
                        <div className="input-container">
                            <label>Tutor:</label>
                            <input
                                type="text"
                                name="tutor"
                                value={
                                    alumnoSeleccionado.tutorUsuario
                                        ? `${alumnoSeleccionado.tutorUsuario.Nombre} ${alumnoSeleccionado.tutorUsuario.Apellidos}`
                                        : ""
                                }
                                readOnly
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
        </div>
    );
};

export default ListaAlumnos;
