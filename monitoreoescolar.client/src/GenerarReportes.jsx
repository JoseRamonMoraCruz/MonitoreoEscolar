import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import "./GenerarReportes.css";
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // o el tema que prefieras
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'; // solo si instalaste primeflex
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FloatLabel } from 'primereact/floatlabel';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';


const GenerarReportes = () => {
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const [reportesList, setReportesList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Estado para edición
    const [editingReport, setEditingReport] = useState(null);
    const [loadingEnviar, setLoadingEnviar] = useState(false);


    const fetchReportes = async () => {
        try {
            const res = await axios.get("http://localhost:5099/api/reportes");
            setReportesList(res.data);
        } catch (err) {
            console.error("Error al cargar reportes:", err);
        }
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [reporteIdAEliminar, setReporteIdAEliminar] = useState(null);

    const mostrarToast = (summary, detail, severity = "success") => {
        toast.current.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };


    const toast = useRef(null);

    // Al hacer clic en editar
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
            await axios.put(`http://localhost:5099/api/reportes/${editingReport.id}`, {
                Fecha: new Date(editingReport.fecha).toISOString(),
                Motivo: editingReport.motivo
            });

            await fetchReportes(); // vuelve a cargar lista desde el backend

            setIsEditModalOpen(false);
            setEditingReport(null);
            mostrarToast("Actualización exitosa", "Reporte actualizado correctamente.", "success");
        } catch (err) {
            console.error(err);
            mostrarToast("Error al actualizar", "No se pudo actualizar el reporte.", "error");

        }
    };

    // Traer la lista de reportes siempre que abra el modal
    useEffect(() => {
        if (isModalOpen) {
            axios.get("http://localhost:5099/api/reportes")
                .then(res => setReportesList(res.data))
                .catch(err => console.error(err));
        }
    }, [isModalOpen]);

    // Eliminar un reporte
    const confirmDelete = (id) => {
        setReporteIdAEliminar(id);
        setShowConfirmDialog(true);
    };

    const deleteReporte = async () => {
        try {
            await axios.delete(`http://localhost:5099/api/reportes/${reporteIdAEliminar}`);
            setReportesList(r => r.filter(x => x.id !== reporteIdAEliminar));
            setShowConfirmDialog(false);
            setReporteIdAEliminar(null);
            mostrarToast("Eliminación exitosa", "El reporte fue eliminado.", "success");
        } catch (err) {
            console.error(err);
            mostrarToast("Error al eliminar", "No se pudo eliminar el reporte.", "error");
        }
    };


    // Estado para el reporte
    const [reporte, setReporte] = useState({
        alumnoId: null,
        fecha: "",
        motivo: "",
        responsableDelReporte: [
            localStorage.getItem("nombre"),
            localStorage.getItem("apellidoPaterno"),
            localStorage.getItem("apellidoMaterno")
        ].filter(Boolean).join(" ")
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
            const response = await axios.get(`http://localhost:5099/api/alumnos/buscar?termino=${inputValue}`);
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

    // Envía el reporte al backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reporte.alumnoId || !reporte.fecha || !reporte.motivo) {
            mostrarToast("Campos incompletos", "Por favor, complete todos los campos.", "error");
            return;
        }

        try {
            setLoadingEnviar(true); // activa spinner

            const response = await axios.post("http://localhost:5099/api/reportes/generar", {
                ...reporte,
                fecha: reporte.fecha?.toISOString()
            });

            mostrarToast("Reporte generado", response.data.mensaje, "success");
            await fetchReportes(); // actualiza la lista

            // Limpia formulario
            setReporte({
                alumnoId: null,
                fecha: "",
                motivo: "",
                ResponsableDelReporte: [
                    localStorage.getItem("nombre"),
                    localStorage.getItem("apellidoPaterno"),
                    localStorage.getItem("apellidoMaterno")
                ].filter(Boolean).join(" ")
            });
            setSelectedAlumno(null);
            setOptions([]);
        } catch (error) {
            console.error("Error al generar reporte:", error);
            mostrarToast("Error al generar", "No se pudo generar el reporte.", "error");
        } finally {
            setLoadingEnviar(false); // desactiva spinner
        }
    };


    // 1. Carga inicial de reportes al entrar a la página
    useEffect(() => {
        fetchReportes();
    }, []);

    // 2. También recarga al abrir el modal
    useEffect(() => {
        if (isModalOpen) {
            fetchReportes();
        }
    }, [isModalOpen]);

    return (
        <div className="generar-reportes-container">
            <Toast ref={toast} />
            <div className="generar-reportes-content">
                <h2 className="generar-reportes-title">📑 Generar Reportes</h2>

                <div className="generar-reportes-btn-container">
                    <Button
                        label="Ver Reportes"
                        icon="pi pi-clipboard"
                        badge={reportesList.length.toString()}
                        badgeClassName="p-badge-danger"
                        className="p-button-outlined p-button-info"
                        onClick={openModal}
                    />
                </div>
                <form className="generar-reportes-form" onSubmit={handleSubmit}>
                    <div className="generar-reportes-row">
                        <div className="generar-reportes-group">
                            <label>👨🏻‍🎓 Nombre del Alumno:</label>
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
                        <div className="generar-reportes-group calendar-wrapper">
                            <label>📆 Fecha:</label>
                            <Calendar
                                name="fecha"
                                value={reporte.fecha ? new Date(reporte.fecha) : null}
                                onChange={(e) => setReporte({ ...reporte, fecha: e.value })}
                                showTime
                                hourFormat="12"
                                dateFormat="mm/dd/yy"
                                placeholder="Seleccione fecha y hora"
                                className="custom-calendar"
                            />
                        </div>
                    </div>
                    <div className="generar-reportes-group">
                        <label>🤔 Motivo del Reporte:</label>
                        <FloatLabel>
                            <InputTextarea
                                id="motivo"
                                value={reporte.motivo}
                                onChange={(e) => setReporte({ ...reporte, motivo: e.target.value })}
                                rows={5}
                                cols={30}
                            />
                        </FloatLabel>
                    </div>
                    <div className="generar-reportes-btn-container">
                        <Button
                            label="Enviar"
                            icon="pi pi-send"
                            loading={loadingEnviar}
                            className="p-button-success"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
            {isModalOpen && (
                <div className="reportes-modal">
                    <div className="reportes-modal-content">
                        <span className="modal-close" onClick={closeModal}>×</span>
                        <h3>Reportes Asignados</h3>
                        <DataTable value={reportesList} className="p-datatable-sm" stripedRows responsiveLayout="scroll">
                            <Column field="nombreCompleto" header="Alumno" />
                            <Column
                                field="fecha"
                                header="Fecha"
                                body={(rowData) => new Date(rowData.fecha).toLocaleString()}
                            />
                            <Column field="motivo" header="Motivo" />
                            <Column field="responsable" header="Responsable" />
                            <Column
                                header="Acciones"
                                body={(rowData) => (
                                    <div className="flex gap-2 justify-content-center">
                                        <Button
                                            icon="pi pi-file-edit"
                                            rounded
                                            outlined
                                            severity="info"
                                            aria-label="Editar"
                                            onClick={() => handleEditReporte(rowData)}
                                            tooltip="Editar"
                                            tooltipOptions={{ position: 'top' }}
                                        />
                                        <Button
                                            icon="pi pi-trash"
                                            rounded
                                            outlined
                                            severity="danger"
                                            aria-label="Eliminar"
                                            onClick={() => confirmDelete(rowData.id)}
                                            tooltip="Eliminar"
                                            tooltipOptions={{ position: 'top' }}
                                        />
                                    </div>
                                )}
                            />
                        </DataTable>
                    </div>
                </div>
            )}
            <Dialog
                header=" Editar Reporte"
                visible={isEditModalOpen}
                position="top"
                style={{ width: '35vw' }}
                onHide={() => setIsEditModalOpen(false)}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <Button
                            label="Guardar"
                            icon="pi pi-check"
                            onClick={handleUpdateReporte}
                            autoFocus
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <label htmlFor="fecha" className="block mb-2 font-semibold">📆 Fecha:</label>
                    <Calendar
                        id="fecha"
                        value={editingReport?.fecha ? new Date(editingReport.fecha) : null}
                        onChange={(e) =>
                            setEditingReport((er) => ({
                                ...er,
                                fecha: e.value
                            }))
                        }
                        showTime
                        hourFormat="12"
                        dateFormat="mm/dd/yy"
                        placeholder="Seleccione fecha y hora"
                        className="mb-3"
                    />

                    <label htmlFor="motivo" className="block mb-2 font-semibold">✏️ Motivo:</label>
                    <InputTextarea
                        id="motivo"
                        value={editingReport?.motivo}
                        onChange={(e) =>
                            setEditingReport((er) => ({ ...er, motivo: e.target.value }))
                        }
                        rows={4}
                        autoResize
                    />
                </div>
            </Dialog>

            <Dialog
                header="¿Confirmar eliminación?"
                visible={showConfirmDialog}
                position="top"
                style={{ width: '30vw' }}
                onHide={() => setShowConfirmDialog(false)}
                draggable={false}
                resizable={false}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setShowConfirmDialog(false)} />
                        <Button label="Sí, eliminar" icon="pi pi-check" severity="danger" onClick={deleteReporte} autoFocus />
                    </div>
                }
            >
                <p>¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.</p>
            </Dialog>
        </div>
    );
};

export default GenerarReportes;