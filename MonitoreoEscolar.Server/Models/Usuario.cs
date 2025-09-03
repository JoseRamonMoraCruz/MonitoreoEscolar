using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
        public string ApellidoPaterno { get; set; } = string.Empty;

        [Required]
        public string ApellidoMaterno { get; set; } = string.Empty;

        [Required]
        public string Contrasena { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty; 

        [Required]
        public string Telefono { get; set; } = string.Empty;

        [Required]
        public string Tipo_Usuario { get; set; } = string.Empty;

        public string? CodigoVerificacion { get; set; }
        public DateTime? FechaExpiracionCodigo { get; set; }

        [JsonIgnore]
        public ICollection<Alumno> Alumnos { get; set; } = new List<Alumno>();

        public int? EscuelaId { get; set; }

        [ForeignKey("EscuelaId")]
        public Escuela? Escuela { get; set; }

    }
}
