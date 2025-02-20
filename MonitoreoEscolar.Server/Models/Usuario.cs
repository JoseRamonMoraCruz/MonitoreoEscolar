using System.ComponentModel.DataAnnotations;

namespace MonitoreoEscolar.Server.Models
{
    public class Usuario
    {
        [Key]
        public int Id_Usuario { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Apellidos { get; set; } = string.Empty;

        [Required]
        public string Contrasena { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty;

        [Required]
        public int Telefono { get; set; }

        [Required]
        public string Tipo_Usuario { get; set; } = string.Empty;
    }
}
