using System.ComponentModel.DataAnnotations;

namespace MonitoreoEscolar.Server.DTOS
{
    // DTO dedicado
    public class ActualizarPerfilRequest
    {
        [Required]
        public int Id_Usuario { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Apellidos { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty;

        [Required]
        public string Telefono { get; set; } = string.Empty;
    }
}
