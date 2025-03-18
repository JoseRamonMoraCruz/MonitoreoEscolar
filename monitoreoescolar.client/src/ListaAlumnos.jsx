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

    const obtenerGrupos = async () => {
        try {
            const response = await axios.get("/api/grupos");
            const gruposOrdenados = response.data.sort((a, b) => {
                // Convertimos a número por si acaso, en caso de que no lo sean
                const gradeA = parseInt(a.grado, 10);
                const gradeB = parseInt(b.grado, 10);
                if (gradeA !== gradeB) {
                    return gradeA - gradeB;
                }
                // Si los grados son iguales, se comparan las letras
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

    const handleChange = (e) => {
        setNuevoGrupo({ ...nuevoGrupo, [e.target.name]: e.target.value });
    };

    const agregarGrupo = async () => {
        if (!nuevoGrupo.grado || !nuevoGrupo.letra) {
            alert("Por favor, selecciona el grado y la letra del grupo.");
            return;
        }
        try {
            await axios.post("/api/grupos/agregar", nuevoGrupo);
            alert("✅ Grupo agregado correctamente.");
            obtenerGrupos();
            cerrarModalGrupo();
        } catch (error) {
            console.error("Error al agregar grupo:", error);
            alert("❌ No se pudo agregar el grupo.");
        }
    };

    // Se modifica para permitir toggle si el término coincide con el grupo o con su grado
    const handleGroupClick = async (grupo) => {
        const groupString = `${grupo.grado}${grupo.letra}`.toLowerCase();
        const normalizedSearch = removeDiacritics(searchTerm.trim().toLowerCase());
        // Si se está buscando y el término NO coincide ni con el identificador completo ni con el grado, no se hace toggle
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

    // Funciones para cerrar el modal de eliminar grupo
    const cerrarModalEliminarGrupo = () => {
        setModalEliminarGrupo(false);
        setGrupoSeleccionado(null);
    };

    // Función para eliminar el grupo
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

    // Funciones para el modal de eliminar alumno (ya existente)
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

    // Función para quitar acentos (similar a RemoveDiacritics en C#)
    const removeDiacritics = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Manejador del input de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtrado de grupos: se incluyen los que tengan coincidencia en el identificador (grado + letra)
    // o bien tengan algún alumno cuyo nombre completo (normalizado) contenga el término.
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
                            // Ahora isGroupSearch será verdadero si el término coincide con el identificador completo o con el grado
                            const isGroupSearch =
                                normalizedSearch === groupString ||
                                normalizedSearch === grupo.grado.toString().toLowerCase();
                            const tableData = searchTerm.trim()
                                ? isGroupSearch
                                    ? // Si se busca el grupo (por identificador completo o solo el grado), se muestran TODOS los alumnos
                                    alumnosPorGrupo[grupo.id] || []
                                    : // Si se busca por alumno, se filtran los alumnos cuyo nombre completo incluya el término
                                    (alumnosPorGrupo[grupo.id] || []).filter((alumno) =>
                                        removeDiacritics((alumno.nombre + " " + alumno.apellidos).toLowerCase()).includes(normalizedSearch)
                                    )
                                : // En modo normal, se muestra la tabla solo si se ha hecho clic para expandir
                                expandedGroup && expandedGroup.id === grupo.id
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
                                                            <td>{alumno.tutor}</td>
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
                                                                    onClick={() =>
                                                                        abrirModalEliminarAlumno(alumno)
                                                                    }
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
                                                            <td>{alumno.tutor}</td>
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
                                                                    onClick={() =>
                                                                        abrirModalEliminarAlumno(alumno)
                                                                    }
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
        </div>
    );
};

export default ListaAlumnos;
