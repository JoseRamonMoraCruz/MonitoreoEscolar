namespace MonitoreoEscolar.Server.DTOs
{
    public class RegistroRequest
    {
        public string PrimerNombre { get; set; }
        public string? SegundoNombre { get; set; }
        public string ApellidoPaterno { get; set; }
        public string ApellidoMaterno { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }

        public string Contrasena { get; set; }
        public string Tipo_Usuario { get; set; }
    }
}
