namespace MonitoreoEscolar.Server.DTOs
{
    public class ReporteDto
    {
        public string Motivo { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string Responsable { get; set; } = string.Empty;
    }
}
