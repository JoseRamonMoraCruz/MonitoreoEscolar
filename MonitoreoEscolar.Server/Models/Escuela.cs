using System.ComponentModel.DataAnnotations;

namespace MonitoreoEscolar.Server.Models
{
    public class Escuela
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string CodigoAcceso { get; set; } = string.Empty;

        public string CorreoNotificaciones { get; set; } = string.Empty;

        public string CodigoAppGmail { get; set; } = string.Empty;

        public ICollection<Usuario>? Usuarios { get; set; }
        public ICollection<Alumno>? Alumnos { get; set; }
        public ICollection<Grupo>? Grupos { get; set; }

    }
}
