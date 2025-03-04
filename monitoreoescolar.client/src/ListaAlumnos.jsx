import { useState } from "react";
import "./ListaAlumnos.css"; // Estilos
import axios from "axios";
import editIcon from "./assets/editar-informacion.png"; // Ícono de editar (azul)
import deleteIcon from "./assets/eliminar-informacion.png"; // Ícono de eliminar (rojo)

const ListaAlumnos = () => {
    const [nombre, setNombre] = useState("");
    const [resultados, setResultados] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const buscarAlumno = async () => {
        if (nombre.trim() === "") {
            alert("Por favor ingrese un nombre para buscar.");
            return;
        }

        setCargando(true);
        setMensaje("");
        setResultados([]);

        try {
            const response = await axios.get("http://localhost:5099/api/alumnos/buscar", {
                params: { nombre: nombre.trim() }
            });

            setResultados(response.data);
        } catch (error) {
            console.error("Error al buscar:", error);
            setMensaje(error.response?.data?.mensaje || "Error al buscar.");
        } finally {
            setCargando(false);
        }
    };

    //  Función para Editar Alumno (simulación)
    const editarAlumno = (id) => {
        alert(`Editar alumno con ID: ${id}`);
        // Aquí puedes redirigir a una página de edición o abrir un modal
    };

    //  Función para Eliminar Alumno
    const eliminarAlumno = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este alumno?")) {
            try {
                await axios.delete(`http://localhost:5099/api/alumnos/eliminar/${id}`);
                alert("Alumno eliminado correctamente.");
                buscarAlumno(); // Actualizar la lista después de eliminar
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
                        placeholder="Buscar alumno"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                    <button className="lista-search-button" onClick={buscarAlumno}>🔍</button>
                </div>

                {cargando && <p>Cargando...</p>}
                {mensaje && <p>{mensaje}</p>}

                {/* Tabla de alumnos */}
                {resultados.length > 0 && (
                    <table className="lista-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Grupo</th>
                                <th>Tutor</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map((alumno, index) => (
                                <tr key={index}>
                                    <td>{alumno.nombre} {alumno.primerApellido} {alumno.segundoApellido}</td>
                                    <td>{alumno.grupo}</td>
                                    <td>{alumno.tutor}</td>
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
