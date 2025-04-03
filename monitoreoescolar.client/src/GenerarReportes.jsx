import { useState } from "react";
import axios from "axios";
import Select from "react-select";
import "./GenerarReportes.css";

const GenerarReportes = () => {
    // Estado para el reporte
    const [reporte, setReporte] = useState({
        alumnoId: null,
        fecha: "",
        motivo: ""
    });

    // Opciones del autocompletado (react-select)
    const [options, setOptions] = useState([]);

    // Valor seleccionado en el Select
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
                <form className="generar-reportes-form" onSubmit={handleSubmit}>
                    <div className="generar-reportes-group">
                        <label>👨🏻‍🎓 Alumno:</label>
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
                        <label>📅 Fecha:</label>
                        <input
                            type="date"
                            name="fecha"
                            value={reporte.fecha}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="generar-reportes-group">
                        <label>📝 Motivo:</label>
                        <textarea
                            name="motivo"
                            value={reporte.motivo}
                            onChange={handleChange}
                            placeholder="Ingrese el motivo del reporte"
                            required
                        />
                    </div>

                    <button className="generar-reportes-btn" type="submit">
                        ➕ Generar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GenerarReportes;
