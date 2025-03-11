import { useState, useEffect } from "react";
import axios from "axios";
import "./ListaAlumnos.css";
import addIcon from "./assets/agregar-grupo.png"; // Ícono de agregar grupo

const ListaAlumnos = () => {
    const [grupos, setGrupos] = useState([]);
    const [modalGrupo, setModalGrupo] = useState(false);
    const [nuevoGrupo, setNuevoGrupo] = useState({ grado: "", letra: "" });

    // NUEVO: Estados y función para expandir la lista de alumnos
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [alumnosGrupo, setAlumnosGrupo] = useState([]);

    useEffect(() => {
        obtenerGrupos();
    }, []);

    const obtenerGrupos = async () => {
        try {
            const response = await axios.get("/api/grupos");
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
            await axios.post("/api/grupos/agregar", nuevoGrupo);
            alert("✅ Grupo agregado correctamente.");
            obtenerGrupos();
            cerrarModalGrupo();
        } catch (error) {
            console.error("Error al agregar grupo:", error);
            alert("❌ No se pudo agregar el grupo.");
        }
    };

    // NUEVO: Función para manejar el clic en una carta de grupo
    const handleGroupClick = async (grupo) => {
        // Si el grupo clicado ya está expandido, lo contraemos
        if (expandedGroup && expandedGroup.id === grupo.id) {
            setExpandedGroup(null);
            setAlumnosGrupo([]);
            return;
        }
        try {
            // Construimos el string del grupo, ej: "1-A"
            const groupString = `${grupo.grado}${grupo.letra}`;
            // Llamada al endpoint que obtiene alumnos de ese grupo
            const response = await axios.get(`/api/alumnos/grupo/${groupString}`);
            setAlumnosGrupo(response.data);
            setExpandedGroup(grupo);
        } catch (error) {
            console.error("Error al obtener alumnos del grupo:", error);
            alert("❌ No se pudieron obtener los alumnos de este grupo.");
        }
    };

    return (
        <div className="lista-container">
            {/* Contenido principal */}
            <div className="lista-content">
                {/* Encabezado */}
                <div className="lista-header">
                    <h2 className="lista-title">Lista de Grupos</h2>
                </div>

                {/* Barra de búsqueda */}
                <div className="lista-search-container">
                    <input type="text" placeholder="Buscar grupo" />
                    <button className="lista-search-button">
                        🔍
                    </button>
                </div>

                {/* Contenedor de grupos */}
                <div className="grupos-container">
                    {grupos.length === 0 ? (
                        <p>No hay grupos registrados.</p>
                    ) : (
                        grupos.map((grupo) => (
                            <div
                                key={grupo.id}
                                className="grupo-card"
                                onClick={() => handleGroupClick(grupo)}
                            >
                                {/* Cabecera de la carta: muestra el grupo y la cantidad de alumnos (si está expandida) */}
                                <div className="grupo-header">
                                    <h3>{grupo.grado}{grupo.letra}</h3>
                                    {/* Si este grupo está expandido, se muestra la cantidad; de lo contrario, se deja vacío */}
                                    {expandedGroup && expandedGroup.id === grupo.id && (
                                        <p>{alumnosGrupo.length} {alumnosGrupo.length === 1 ? "alumno" : "alumnos"}</p>
                                    )}
                                </div>
                                {/* Se despliega la tabla solo si este grupo está expandido */}
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alumnosGrupo.map((alumno) => (
                                                    <tr key={alumno.id}>
                                                        <td>{alumno.nombre} {alumno.apellidos}</td>
                                                        <td>{alumno.tutor}</td>
                                                        <td>{alumno.domicilio}</td>
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

            {/* Botón flotante para agregar grupo */}
            <button className="boton-agregar" onClick={abrirModalGrupo}>
                <img src={addIcon} alt="Agregar Grupo" />
            </button>

            {/* Modal para Agregar Grupo */}
            {modalGrupo && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={cerrarModalGrupo}>✖</button>

                        {/* Aquí el título */}
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
        </div>
    );
};

export default ListaAlumnos;
