namespace MonitoreoEscolar.Server.DTOs
{
    public class AsistenciaDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public string ApellidoPaterno { get; set; } = string.Empty;
        public string ApellidoMaterno { get; set; } = string.Empty;
        public string Grupo { get; set; } = string.Empty;
        public string? Carrera { get; set; }
        public string? Turno { get; set; }
        public string Entrada { get; set; } = string.Empty; // ej. "08:05 AM"
        public string Salida { get; set; } = string.Empty;  // ej. "--" o "13:10 PM"
    }
}
