import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./TomaAsistencia.css"; // Importamos nuestro CSS personalizado

const BuscadorAlumno = () => {
    return (
        <div className="buscador-alumno-container">
            <TextField
                className="buscador-alumno-input"
                variant="outlined"
                placeholder="Escribe el nombre del alumno"
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon className="icono-lupa" />
                        </InputAdornment>
                    ),
                    classes: { notchedOutline: "no-outline" } // Para aplicar clase al borde
                }}
            />
        </div>
    );
};

export default BuscadorAlumno;
