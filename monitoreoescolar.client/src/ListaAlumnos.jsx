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

    useEffect(() => {
        obtenerGrupos();
    }, []);

    const obtenerGrupos = async () => {
        try {
            const response = await axios.get("http://localhost:5099/api/grupos");
            setGrupos(response.data);
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
        if (expandedGroup && expandedGroup.id === grupo.id) {
            setExpandedGroup(null);
            setAlumnosGrupo([]);
            return;
        }
        try {
            const groupString = `${grupo.grado}${grupo.letra}`;
            // Llamada al endpoint que obtiene alumnos de ese grupo
            const response = await axios.get(`http://localhost:5099/api/alumnos/grupo/${groupString}`);
            setAlumnosGrupo(response.data);
            setExpandedGroup(grupo);
        } catch (error) {
            console.error("Error al obtener alumnos del grupo:", error);
            alert("❌ No se pudieron obtener los alumnos de este grupo.");
        }
    };

    const handleDeleteClick = async (e, grupo) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(`¿Deseas eliminar el grupo ${grupo.grado}${grupo.letra}?`);
        if (confirmDelete) {
            try {
                await axios.delete(`/api/grupos/eliminar/${grupo.id}`);
                alert("✅ Grupo eliminado exitosamente.");
                setGrupos(grupos.filter(g => g.id !== grupo.id));
                if (expandedGroup && expandedGroup.id === grupo.id) {
                    setExpandedGroup(null);
                    setAlumnosGrupo([]);
                }
            } catch (error) {
                console.error("Error al eliminar grupo:", error);
                alert("❌ No se pudo eliminar el grupo.");
            }
        }
    };
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
            setAlumnosGrupo(alumnosGrupo.filter(al => al.id !== alumnoSeleccionado.id));
            cerrarModalEliminarAlumno();
        } catch (error) {
            console.error("Error al eliminar alumno:", error);
            alert("❌ No se pudo eliminar al alumno.");
        }
    };
    return (
        <div className="lista-container">
            <div className="lista-content">
                <div className="lista-header">
                    <h2 className="lista-title">Lista de Grupos</h2>
                </div>

                <div className="lista-search-container">
                    <input type="text" placeholder="Buscar grupo" />
                    <button className="lista-search-button">🔍</button>
                </div>

                <div className="grupos-container">
                    {grupos.length === 0 ? (
                        <p>No hay grupos registrados.</p>
                    ) : (
                        grupos.map((grupo) => (
                            <div key={grupo.id} className="grupo-card" onClick={() => handleGroupClick(grupo)}>
                                <div className="grupo-header">
                                    <h3>{grupo.grado}{grupo.letra}</h3>
                                    <img src={deleteIcon} alt="Eliminar Grupo" className="delete-icon" onClick={(e) => handleDeleteClick(e, grupo)} />
                                </div>

                                {expandedGroup && expandedGroup.id === grupo.id && (
                                    alumnosGrupo.length === 0 ? (
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
                                                        <td>{alumno.nombre} {alumno.apellidos}</td>
                                                        <td>{alumno.tutor}</td>
                                                        <td>{alumno.domicilio}</td>
                                                        <td className="acciones">
                                                            <img src={editIcon} alt="Editar" className="accion-icon editar" />
                                                            <img src={removeIcon} alt="Eliminar" className="accion-icon eliminar"
                                                                onClick={() => abrirModalEliminarAlumno(alumno)}/>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button className="boton-agregar" onClick={abrirModalGrupo}>
                <img src={addIcon} alt="Agregar Grupo" />
            </button>

            {modalGrupo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={cerrarModalGrupo}>✖</button>
                        <h2 className="modal-title">Agregar Grupo</h2>
                        <div className="select-container">
                            <div>
                                <label>Grado:</label>
                                <select name="grado" value={nuevoGrupo.grado} onChange={handleChange}>
                                    <option value="">Seleccione</option>
                                    {[1, 2, 3, 4, 5, 6].map((grado) => (
                                        <option key={grado} value={grado}>{grado}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Grupo:</label>
                                <select name="letra" value={nuevoGrupo.letra} onChange={handleChange}>
                                    <option value="">Seleccione</option>
                                    {["A", "B", "C", "D", "E", "F"].map((letra) => (
                                        <option key={letra} value={letra}>{letra}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button className="save-button" onClick={agregarGrupo}>Guardar</button>
                    </div>
                </div>
            )}
            {modalEliminarAlumno && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>¿Estás seguro?</h2>
                        <p>¿Quieres eliminar al alumno {alumnoSeleccionado?.nombre} {alumnoSeleccionado?.apellidos}?</p>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={eliminarAlumno}>
                                <img src={aceptarIcon} alt="Aceptar" /> Sí, eliminar
                            </button>
                            <button className="cancel-button" onClick={cerrarModalEliminarAlumno}>
                                <img src={rechazarIcon} alt="Cancelar" /> Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaAlumnos;
