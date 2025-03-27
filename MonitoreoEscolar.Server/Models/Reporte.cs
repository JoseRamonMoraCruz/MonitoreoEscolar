using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonitoreoEscolar.Server.Models
{
    public class Reporte
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        [Required]
        public string Motivo { get; set; } = string.Empty;

        // Clave foránea para asociar el reporte a un alumno
        [Required]
        public int AlumnoId { get; set; }

        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }
    }
}
