namespace MonitoreoEscolar.Server.DTOs
{
    public class EditarReporteDTO
    {
        public DateTime Fecha { get; set; }
        public string Motivo { get; set; } = string.Empty;
    }
}
