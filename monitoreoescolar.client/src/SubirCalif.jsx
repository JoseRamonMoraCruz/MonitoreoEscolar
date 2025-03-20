import { useState, useRef } from "react";
import axios from "axios";
import "./SubirCalif.css";

const SubirCalif = () => {
    const [archivo, setArchivo] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState("");
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setArchivo(file);
            setNombreArchivo(file.name);
        }
    };

    const handleUpload = async () => {
        if (!archivo) {
            alert("❌ Selecciona un archivo Excel primero.");
            return;
        }

        const formData = new FormData();
        formData.append("file", archivo);

        setCargando(true);

        try {
            console.log("📤 Enviando archivo:", archivo.name);

            const response = await axios.post("http://localhost:5099/api/calificaciones/subirCalificaciones", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            console.log("📥 Respuesta del servidor:", response.data);

            if (response.data && response.data.calificaciones) {
                setDatos(response.data.calificaciones);
            } else {
                alert("⚠ No se recibieron datos válidos del servidor.");
            }
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error.response ? error.response.data : error.message);
            alert(`❌ Error al subir el archivo: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };


    return (
        <div className="subir-page-container">
            <div className="subir-container">
                <h2 className="subir-title">📁 Subir Calificaciones</h2>

                <div className="file-input-container">
                    <button className="btn choose-file" onClick={() => fileInputRef.current.click()}>
                        📄 Elegir Archivo
                    </button>
                    <span className="file-name">{nombreArchivo || "No se ha seleccionado archivo"}</span>
                    <input
                        type="file"
                        accept=".xlsx"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                    />
                </div>

                <button className="btn upload-data" onClick={handleUpload} disabled={cargando || !archivo}>
                    {cargando ? "📥 Cargando..." : "📥 Cargar Datos"}
                </button>

                <div className="tabla-container">
                    <table className="subir-table">
                        <thead>
                            <tr>
                                <th>Alumno</th>
                                <th>Materia</th>
                                <th>Calificación</th>
                                <th>Grupo</th>
                                <th>Parcial/Unidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.length > 0 ? (
                                datos.map((alumno, index) => (
                                    <tr key={index}>
                                        <td>{alumno.nombre}</td>
                                        <td>{alumno.materia}</td>
                                        <td>{alumno.calificacionValor || "N/A"}</td>
                                        <td>{alumno.grupo}</td>
                                        <td>{alumno.parcialUnidad || "N/A"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No hay datos cargados aún.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubirCalif;
