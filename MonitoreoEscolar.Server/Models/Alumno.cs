using System.ComponentModel.DataAnnotations;

namespace MonitoreoEscolar.Server.Models
{
    public class Alumno
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public string Apellidos { get; set; } = string.Empty;

        public string NombreCompleto { get; set; } = string.Empty;//  Se genera automáticamente

        public string NombreCompletoNormalizado { get; set; } = string.Empty; //  Se genera automáticamente

        [Required]
        public string Grupo { get; set; } = string.Empty;

        [Required]
        public string Tutor { get; set; } = string.Empty;

        [Required]
        public string Domicilio { get; set; } = string.Empty;
    }
}
