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
        public string Telefono { get; set; } = string.Empty;

        [Required]
        public string Tipo_Usuario { get; set; } = string.Empty;

        // Solo se usa si el usuario es Padre
        public string? NombreAlumno { get; set; }

    }
}
