namespace MonitoreoEscolar.Server.DTOs
{
    public class CalificacionAlumnoDto
    {
        public string Materia { get; set; } = string.Empty;
        public decimal Calificacion { get; set; }
        public string Parcial { get; set; } = string.Empty;
    }
}
