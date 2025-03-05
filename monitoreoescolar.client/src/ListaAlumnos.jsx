import { useState, useEffect } from "react";
import axios from "axios";
import "./ListaAlumnos.css"; // Estilos
import editIcon from "./assets/editar-informacion.png"; // Ícono de editar (azul)
import deleteIcon from "./assets/eliminar-informacion.png"; // Ícono de eliminar (rojo)

const ListaAlumnos = () => {
    const [nombre, setNombre] = useState("");
    const [alumnos, setAlumnos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    //  Obtener lista de alumnos al cargar la página
    useEffect(() => {
        obtenerAlumnos();
    }, []);

    const obtenerAlumnos = async () => {
        setCargando(true);
        try {
            const response = await axios.get("http://localhost:5099/api/alumnos/lista");
            setAlumnos(response.data);
            setMensaje(response.data.length === 0 ? "No hay alumnos registrados." : "");
        } catch (error) {
            console.error("Error al obtener alumnos:", error);
            setMensaje("No se pudo obtener la lista de alumnos.");
        } finally {
            setCargando(false);
        }
    };

    //  Función para buscar alumnos
    const buscarAlumno = () => {
        if (nombre.trim() === "") {
            obtenerAlumnos();
            return;
        }

        const alumnosFiltrados = alumnos.filter(alumno =>
            alumno.nombreCompleto.toLowerCase().includes(nombre.toLowerCase())
        );
        setAlumnos(alumnosFiltrados);
        setMensaje(alumnosFiltrados.length === 0 ? "No se encontraron coincidencias." : "");
    };

    //  Función para Editar Alumno (simulación)
    const editarAlumno = (id) => {
        alert(`Editar alumno con ID: ${id}`);
    };

    // 🔹 Función para Eliminar Alumno
    const eliminarAlumno = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este alumno?")) {
            try {
                await axios.delete(`/api/alumnos/eliminar/${id}`);
                alert("Alumno eliminado correctamente.");
                obtenerAlumnos(); // Actualizar la lista después de eliminar
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No se pudo eliminar el alumno.");
            }
        }
    };

    return (
        <div className="lista-container">
            <div className="lista-content">
                <h2 className="lista-title">Lista de Alumnos</h2>

                {/* Barra de búsqueda */}
                <div className="lista-search-container">
                    <input
                        type="text"
                        placeholder="Buscar alumno por nombre completo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                    <button className="lista-search-button" onClick={buscarAlumno}>🔍</button>
                </div>

                {cargando && <p>Cargando...</p>}
                {mensaje && <p>{mensaje}</p>}

                {/* Tabla de alumnos con todos los datos */}
                {alumnos.length > 0 && (
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
                            {alumnos.map((alumno) => (
                                <tr key={alumno.id}>
                                    <td>{alumno.id}</td>
                                    <td>{alumno.nombreCompleto}</td>
                                    <td>{alumno.grupo}</td>
                                    <td>{alumno.tutor}</td>
                                    <td>{alumno.domicilio}</td>
                                    <td className="lista-icons">
                                        <img src={editIcon} alt="Editar" className="icono-accion edit" onClick={() => editarAlumno(alumno.id)} />
                                        <img src={deleteIcon} alt="Eliminar" className="icono-accion delete" onClick={() => eliminarAlumno(alumno.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ListaAlumnos;