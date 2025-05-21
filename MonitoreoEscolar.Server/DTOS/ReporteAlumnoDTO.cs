namespace MonitoreoEscolar.Server.DTOs
{
    public class ReporteAlumnoDTO
    {
        public int AlumnoId { get; set; }
        public string NombreAlumno { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;
        public DateTime FechaGeneracion { get; set; }

        public List<CalificacionAlumnoDto> Calificaciones { get; set; }
            = new List<CalificacionAlumnoDto>();
        public List<AsistenciaDTO> Asistencias { get; set; }
            = new List<AsistenciaDTO>();
        public List<ReporteDto> Reportes { get; set; }
            = new List<ReporteDto>();
    }
}
