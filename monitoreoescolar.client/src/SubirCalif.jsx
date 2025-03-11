import { useState, useRef } from "react";
import axios from "axios";
import "./SubirCalif.css";

const SubirCalif = () => {
    const [archivo, setArchivo] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState("");
    const [datos, setDatos] = useState([]); // Estado para almacenar los datos cargados
    const [cargando, setCargando] = useState(false);
    const fileInputRef = useRef(null);

    //  Función para manejar el archivo seleccionado
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setArchivo(file);
            setNombreArchivo(file.name);
        }
    };

    // Función para subir el archivo y obtener los datos del backend
    const handleUpload = async () => {
        if (!archivo) {
            alert("❌ Selecciona un archivo Excel primero.");
            return;
        }

        const formData = new FormData();
        formData.append("file", archivo);

        //  LOG: Verifica que el archivo se está enviando al backend
        console.log("📂 Archivo enviado:", archivo.name);
        console.log("📦 FormData enviado (Verificando archivo):", formData.get("file"));

        setCargando(true);

        try {
            const response = await axios.post("http://localhost:5099/api/alumnos/subirCalificaciones", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            console.log("✅ Respuesta del backend:", response.data);

            if (response.data && response.data.alumnos) {
                setDatos(response.data.alumnos); //  Guardamos los datos en el estado
            } else {
                console.log("⚠ No se recibieron datos del servidor.");
                alert("⚠ No se recibieron datos válidos del servidor.");
            }
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error.response?.data || error.message);

            if (error.response) {
                console.log("⚠ Código de estado:", error.response.status);
                console.log("⚠ Mensaje del backend:", error.response.data);
                alert(`❌ Error del servidor: ${error.response.data.mensaje || "Error desconocido"}`);
            } else {
                console.log("⚠ No hubo respuesta del servidor.");
                alert("❌ No se pudo conectar con el servidor.");
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="subir-page-container">
            <div className="subir-container">
                <div className="subir-content-box">
                    <h2 className="subir-title">📁 Subir Calificaciones</h2>

                    {/*  Input oculto para seleccionar archivo */}
                    <input
                        type="file"
                        accept=".xlsx"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                    />

                    {/*  Contenedor del botón y el nombre del archivo */}
                    <div className="file-input-container">
                        <button className="btn choose-file" onClick={() => fileInputRef.current.click()}>
                            📄 Elegir Archivo
                        </button>
                        <span className="file-name">{nombreArchivo || "No se ha seleccionado archivo"}</span>
                    </div>

                    {/*  Botón para cargar datos */}
                    {archivo && (
                        <button className="btn upload-data" onClick={handleUpload} disabled={cargando}>
                            {cargando ? "📥 Cargando..." : "📥 Cargar Datos"}
                        </button>
                    )}

                    {/*  Tabla para mostrar los datos cargados */}
                    {datos.length > 0 && (
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
                                {datos.map((alumno, index) => (
                                    <tr key={index}>
                                        <td>{alumno.nombre}</td>
                                        <td>{alumno.materia}</td>
                                        <td>{alumno.calificacion}</td>
                                        <td>{alumno.grupo}</td>
                                        <td>{alumno.parcialUnidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubirCalif;
