import { useState, useEffect } from "react"; 
import axios from "axios";
import Select from "react-select";
import "./GenerarReportes.css";


const GenerarReportes = () => {
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const [reportesList, setReportesList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Estado para edición
    const [editingReport, setEditingReport] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Al hacer clic en “✏️”
    const handleEditReporte = (rep) => {
        setEditingReport({
            id: rep.id,
            alumnoId: rep.alumnoId,
            fecha: rep.fecha,
            motivo: rep.motivo
        });
        setIsEditModalOpen(true);
    };

    // Guardar cambios
    const handleUpdateReporte = async () => {
        try {
            await axios.put(`/api/reportes/${editingReport.id}`, {
                AlumnoId: editingReport.alumnoId,
                Fecha: editingReport.fecha,
                Motivo: editingReport.motivo
            });
            // Refresca la lista en pantalla
            setReportesList(list =>
                list.map(r => r.id === editingReport.id ? {
                    ...r,
                    fecha: editingReport.fecha,
                    motivo: editingReport.motivo
                } : r)
            );
            setIsEditModalOpen(false);
            setEditingReport(null);
            alert("Reporte actualizado exitosamente.");
        } catch (err) {
            console.error(err);
            alert("Error al actualizar el reporte.");
        }
    };

    // Traer la lista de reportes siempre que abra el modal
    useEffect(() => {
        if (isModalOpen) {
            axios.get("/api/reportes")
                .then(res => setReportesList(res.data))
                .catch(err => console.error(err));
        }
    }, [isModalOpen]);

    // Eliminar un reporte
    const handleDeleteReporte = async (id) => {
        if (!window.confirm("¿Eliminar este reporte?")) return;
        try {
            await axios.delete(`/api/reportes/${id}`);
            setReportesList(r => r.filter(x => x.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error al eliminar reporte.");
        }
    };

    // Estado para el reporte
    const [reporte, setReporte] = useState({
        alumnoId: null,
        fecha: "",
        motivo: ""
    });

    const [options, setOptions] = useState([]);
    const [selectedAlumno, setSelectedAlumno] = useState(null);

    // Función para hacer la búsqueda de alumnos
    const fetchAlumnos = async (inputValue) => {
        if (!inputValue || inputValue.length < 2) {
            setOptions([]);
            return;
        }
        try {
            const response = await axios.get(`/api/alumnos/buscar?termino=${inputValue}`);
            const optionsData = response.data.map((alumno) => ({
                value: alumno.id,
                label: alumno.nombreCompleto
            }));
            setOptions(optionsData);
        } catch (error) {
            console.error("Error al buscar alumnos:", error);
        }
    };
    // Maneja la selección de un alumno
    const handleChangeSelect = (selectedOption) => {
        setSelectedAlumno(selectedOption);
        setReporte({
            ...reporte,
            alumnoId: selectedOption ? selectedOption.value : null
        });
    };

    // Maneja el texto que se escribe en el campo (retornamos el string para evitar "[object Promise]")
    const handleInputChange = (inputValue, { action }) => {
        if (action === "input-change") {
            fetchAlumnos(inputValue);
            return inputValue;
        }
        return inputValue;
    };

    // Maneja cambios en los campos fecha y motivo
    const handleChange = (e) => {
        setReporte({
            ...reporte,
            [e.target.name]: e.target.value
        });
    };

    // Envía el reporte al backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reporte.alumnoId || !reporte.fecha || !reporte.motivo) {
            alert("Por favor, complete todos los campos.");
            return;
        }
        try {
            const response = await axios.post("/api/reportes/generar", reporte);
            alert(response.data.mensaje);
            // Limpiar formulario
            setReporte({
                alumnoId: null,
                fecha: "",
                motivo: ""
            });
            setSelectedAlumno(null);
            setOptions([]);
        } catch (error) {
            console.error("Error al generar reporte:", error);
            alert("❌ No se pudo generar el reporte.");
        }
    };

    return (
        <div className="generar-reportes-container">
            <div className="generar-reportes-content">
                <h2 className="generar-reportes-title">📑 Generar Reportes</h2>

                <div className="generar-reportes-btn-container">
                    <button type="button" className="ver-reportes-btn" onClick={openModal}>
                        📋 Ver Reportes
                    </button>
                </div>
                <form className="generar-reportes-form" onSubmit={handleSubmit}>
                    <div className="generar-reportes-row">
                        <div className="generar-reportes-group">
                            <label>Nombre del Alumno:</label>
                            <Select
                                classNamePrefix="my-select"
                                value={selectedAlumno}
                                onChange={handleChangeSelect}
                                onInputChange={handleInputChange}
                                options={options}
                                placeholder="Escriba el nombre completo..."
                                noOptionsMessage={() => "No se encontraron coincidencias"}
                            />
                        </div>
                        <div className="generar-reportes-group">
                            <label>Fecha:</label>
                            <input
                                type="datetime-local"
                                name="fecha"
                                value={reporte.fecha}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="generar-reportes-group">
                        <label>Motivo del Reporte:</label>
                        <textarea
                            name="motivo"
                            value={reporte.motivo}
                            onChange={handleChange}
                            placeholder="Ingrese el motivo del reporte"
                            required
                        />
                    </div>

                    <div className="generar-reportes-btn-container">
                        <button className="generar-reportes-btn" type="submit">
                            💾 Enviar
                        </button>
                    </div>
                </form>
            </div>
            {isModalOpen && (
                <div className="reportes-modal">
                    <div className="reportes-modal-content">
                        <span className="modal-close" onClick={closeModal}>×</span>
                        <h3>Reportes Asignados</h3>
                        <table className="reportes-table">
                            <thead>
                                <tr>
                                    <th>Alumno</th><th>Fecha</th><th>Motivo</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportesList.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.nombreCompleto}</td>
                                        <td>{new Date(r.fecha).toLocaleString()}</td>
                                        <td>{r.motivo}</td>
                                        <td>
                                            {<button onClick={() => handleEditReporte(r)}>✏️</button>}
                                            <button onClick={() => handleDeleteReporte(r.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {isEditModalOpen && (
                <div className="reportes-modal">
                    <div className="reportes-modal-content">
                        <span className="modal-close" onClick={() => setIsEditModalOpen(false)}>×</span>
                        <h3>Editar Reporte</h3>

                        <label>Fecha:</label>
                        <input
                            type="datetime-local"
                            value={editingReport.fecha}
                            onChange={e =>
                                setEditingReport(er => ({ ...er, fecha: e.target.value }))
                            }
                        />

                        <label>Motivo:</label>
                        <textarea
                            value={editingReport.motivo}
                            onChange={e =>
                                setEditingReport(er => ({ ...er, motivo: e.target.value }))
                            }
                        />
                        <button onClick={handleUpdateReporte}>💾 Guardar Cambios</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenerarReportes;