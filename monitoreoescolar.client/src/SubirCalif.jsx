import { useState, useRef, useEffect } from "react";
import reiniciarIcono from "./assets/reiniciar.png";
import axios from "axios";
import "./SubirCalif.css";


const SubirCalif = () => {
    const [archivo, setArchivo] = useState(null);
    const [nombreArchivo, setNombreArchivo] = useState("");
    const [datos, setDatos] = useState([]); //  Aquí guardaremos las calificaciones
    const [cargando, setCargando] = useState(false);
    const fileInputRef = useRef(null);

    //  Nueva función para cargar calificaciones existentes al cargar la página
    useEffect(() => {
        const cargarCalificaciones = async () => {
            try {
                const response = await axios.get("http://localhost:5099/api/calificaciones"); // ⬅️ Endpoint GET para traer datos
                setDatos(response.data); //  Guardamos los datos en el estado
            } catch (error) {
                console.error(" Error cargando calificaciones:", error);
            }
        };

        cargarCalificaciones(); //  Se ejecuta cuando se monta el componente
    }, []);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setArchivo(file);
            setNombreArchivo(file.name);
        }
    };

    const handleUpload = async () => {
        if (!archivo) {
            alert(" Selecciona un archivo Excel primero.");
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

            // ✅ Mostrar solo las calificaciones recién subidas
            if (response.data && response.data.calificaciones) {
                setDatos(response.data.calificaciones);
            } else {
                setDatos([]); // fallback por si no vino nada
            }

            alert(`✅ ${response.data.mensaje}`);

            // 🧼 Limpia el archivo después de subir
            setArchivo(null);
            setNombreArchivo("");
            fileInputRef.current.value = null;

        } catch (error) {
            console.error("❌ Error al subir el archivo:", error.response ? error.response.data : error.message);
            alert(`❌ Error al subir el archivo: ${error.message}`);
        } finally {
            setCargando(false);
        }
    };



   /* // Nueva función para obtener calificaciones desde la API
    const fetchCalificaciones = async () => {
        try {
            const response = await axios.get("http://localhost:5099/api/calificaciones/obtenerCalificaciones");
            setDatos(response.data); // ✅ Actualiza la tabla con los datos de la BD
            console.log("📊 Calificaciones obtenidas:", response.data);
        } catch (error) {
            console.error("⚠ Error al obtener calificaciones:", error);
        }
    };*/

    // Función para limpiar la tabla sin afectar la base de datos
    const handleReset = () => {
        setDatos([]); // Solo limpia la tabla en el frontend
    };

    return (
        <div className="contenedor-subir">
            <div className="caja-subir">
                <h2 className="titulo-subir">📁 Subir Calificaciones</h2>

                <div className="contenedor-superior">
                    <div className="contenedor-archivo">
                        <button className="boton-seleccionar" onClick={() => fileInputRef.current.click()}>
                            📄 Elegir Archivo
                        </button>
                        <span className="nombre-archivo">{nombreArchivo || "No se ha seleccionado archivo"}</span>
                        <input
                            type="file"
                            accept=".xlsx"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* 🔹 Contenedor de los botones */}
                    <div className="contenedor-botones">
                        <button className="boton-reiniciar" onClick={handleReset}>
                            <img src={reiniciarIcono} alt="Reiniciar" className="icono-reiniciar" />
                        </button>
                        <button className="boton-subir" onClick={handleUpload} disabled={cargando || !archivo}>
                            {cargando ? "📥 Cargando..." : "📥 Cargar Datos"}
                        </button>
                    </div>
                </div>

                <div className="contenedor-tabla">
                    <h3>📊 Calificaciones Cargadas</h3>
                    <table className="tabla-subir">
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
                            {datos && datos.length > 0 ? (
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
