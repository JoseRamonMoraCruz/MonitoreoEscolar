import { useState, useEffect } from "react";
import axios from "axios";
import "./ListaAlumnos.css";
import editIcon from "./assets/editar-informacion.png"; // Ícono de editar
import deleteIcon from "./assets/eliminar-informacion.png"; // Ícono de eliminar
import aceptarIcon from "./assets/aceptar.png"; // Ícono de aceptar
import rechazarIcon from "./assets/rechazar.png"; // Ícono de rechazar

const ListaAlumnos = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [nombre, setNombre] = useState("");

    // Estado para el modal de edición
    const [modalVisible, setModalVisible] = useState(false);
    const [alumnoActual, setAlumnoActual] = useState({
        id: "",
        nombre: "",
        apellidos: "",
        grupo: "",
        tutor: "",
        domicilio: ""
    });

    // Estado para la ventana de confirmación de eliminación
    const [modalEliminar, setModalEliminar] = useState(false);
    const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);

    useEffect(() => {
        obtenerAlumnos();
    }, []);

    const obtenerAlumnos = async () => {
        setCargando(true);
        try {
            const response = await axios.get("/api/alumnos");
            setAlumnos(response.data);
            setMensaje(response.data.length === 0 ? "No hay alumnos registrados." : "");
        } catch (error) {
            console.error("Error al obtener alumnos:", error);
            setMensaje("No se pudo obtener la lista de alumnos.");
        } finally {
            setCargando(false);
        }
    };

    const buscarAlumno = () => {
        if (nombre.trim() === "") {
            setMensaje("");
            return;
        }

        const filtrados = alumnos.filter(alumno =>
            alumno.nombreCompleto.toLowerCase().includes(nombre.toLowerCase())
        );

        setMensaje(filtrados.length === 0 ? "No se encontraron coincidencias." : "");
    };

    const confirmarEliminar = (id) => {
        setAlumnoAEliminar(id);
        setModalEliminar(true);
    };

    const eliminarAlumno = async () => {
        if (!alumnoAEliminar) return;

        try {
            await axios.delete(`/api/alumnos/eliminar/${alumnoAEliminar}`);
            alert("✅ Alumno eliminado correctamente.");
            obtenerAlumnos();
            setModalEliminar(false);
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("❌ No se pudo eliminar el alumno.");
        }
    };

    const abrirModalEdicion = (alumno) => {
        setAlumnoActual(alumno);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const handleChange = (e) => {
        setAlumnoActual({
            ...alumnoActual,
            [e.target.name]: e.target.value
        });
    };

    const guardarEdicion = async () => {
        try {
            await axios.put(`/api/alumnos/editar/${alumnoActual.id}`, alumnoActual);
            alert("✅ Alumno actualizado correctamente.");
            obtenerAlumnos();
            cerrarModal();
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("❌ No se pudo actualizar el alumno.");
        }
    };

    return (
        <div className="lista-container">
            <div className="lista-content">
                <h2 className="lista-title">Lista de Alumnos</h2>

                {/* 🔍 Barra de búsqueda */}
                <div className="lista-search-container">
                    <input
                        type="text"
                        placeholder="Buscar alumno por nombre completo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && buscarAlumno()}
                    />
                    <button className="lista-search-button" onClick={buscarAlumno}>🔍</button>
                </div>

                {cargando && <p>Cargando...</p>}
                {mensaje && <p>{mensaje}</p>}

                <table className="lista-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Grupo</th>
                            <th>Tutor</th>
                            <th>Domicilio</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>No hay alumnos registrados.</td>
                            </tr>
                        ) : (
                            alumnos.map((alumno) => (
                                <tr key={alumno.id}>
                                    <td>{alumno.id}</td>
                                    <td>{alumno.nombreCompleto}</td>
                                    <td>{alumno.grupo}</td>
                                    <td>{alumno.tutor}</td>
                                    <td>{alumno.domicilio}</td>
                                    <td className="lista-icons">
                                        <img src={editIcon} alt="Editar" className="icono-accion edit" onClick={() => abrirModalEdicion(alumno)} />
                                        <img src={deleteIcon} alt="Eliminar" className="icono-accion delete" onClick={() => confirmarEliminar(alumno.id)} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de edición */}
            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={cerrarModal}>✖</button>
                        <h2>Editar Alumno</h2>

                        <label>Nombre:</label>
                        <input type="text" name="nombre" value={alumnoActual.nombre} onChange={handleChange} />

                        <label>Apellidos:</label>
                        <input type="text" name="apellidos" value={alumnoActual.apellidos} onChange={handleChange} />

                        <label>Grupo:</label>
                        <input type="text" name="grupo" value={alumnoActual.grupo} onChange={handleChange} />

                        <label>Tutor:</label>
                        <input type="text" name="tutor" value={alumnoActual.tutor} onChange={handleChange} />

                        <label>Domicilio:</label>
                        <input type="text" name="domicilio" value={alumnoActual.domicilio} onChange={handleChange} />

                        <button className="save-button" onClick={guardarEdicion}>Guardar</button>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {modalEliminar && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setModalEliminar(false)}>✖</button>
                        <h2>¿Estás seguro de eliminar este alumno?</h2>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={eliminarAlumno}>
                                <img src={aceptarIcon} alt="Aceptar" /> 
                            </button>
                            <button className="cancel-button" onClick={() => setModalEliminar(false)}>
                                <img src={rechazarIcon} alt="Rechazar" /> 
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaAlumnos;
