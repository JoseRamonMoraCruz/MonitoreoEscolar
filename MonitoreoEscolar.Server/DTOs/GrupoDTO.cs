namespace MonitoreoEscolar.Server.DTOs
{
    public class GrupoDTO
    {
        public int Id { get; set; }
        public int Grado { get; set; } //
        public string Letra { get; set; }
        public string? Carrera { get; set; }
        public string? NombreDocente { get; set; }
    }

}
