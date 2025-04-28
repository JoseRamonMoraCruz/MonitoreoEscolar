namespace MonitoreoEscolar.Server.DTOs
{
    public class ActualizarPasswordRequest
    {
        public string Correo { get; set; }
        public string NewPassword { get; set; }
    }
}
