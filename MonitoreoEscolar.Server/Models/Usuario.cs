using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

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

        // Colección de alumnos asociados (opcional, pero recomendable)
        [JsonIgnore]
        public ICollection<Alumno> Alumnos { get; set; } = new List<Alumno>();
    }
}
