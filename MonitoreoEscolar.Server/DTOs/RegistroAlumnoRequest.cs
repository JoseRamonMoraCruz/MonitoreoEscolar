namespace MonitoreoEscolar.Server.DTOs
{
    public class RegistroAlumnoRequest
    {
        public string Nombre { get; set; }
        public string ApellidoPaterno { get; set; }
        public string ApellidoMaterno { get; set; }
        public string Grupo { get; set; }
        public string Domicilio { get; set; }
        public string CURP { get; set; }
        public int EscuelaId { get; set; }
        public int? TutorId { get; set; }

        // Nuevos campos que envías desde el frontend:
        public string? NumeroControl { get; set; }
        public string? Carrera { get; set; }
        public string? Plantel { get; set; }
        public string? Turno { get; set; }
        public string? Generacion { get; set; }
        public string? Ciclo { get; set; }
    }
}
