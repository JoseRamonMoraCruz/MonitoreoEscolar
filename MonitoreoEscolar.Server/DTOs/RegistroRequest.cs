namespace MonitoreoEscolar.Server.DTOs
{
    public class RegistroRequest
    {
        public string Nombre { get; set; }
        public string Apellidos { get; set; }
        public string Contrasena { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public string Tipo_Usuario { get; set; }
    }
}
