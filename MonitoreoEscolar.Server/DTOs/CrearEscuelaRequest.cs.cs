namespace MonitoreoEscolar.Server.DTOs
{
    public class CrearEscuelaRequest
    {
        public string Nombre { get; set; }
        public string CodigoAcceso { get; set; }  // Este lo espera el modelo
        public string CorreoNotificaciones { get; set; }
        public string CodigoAppGmail { get; set; }
    }
}
