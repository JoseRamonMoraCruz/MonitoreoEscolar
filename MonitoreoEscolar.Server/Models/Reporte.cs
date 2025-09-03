using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonitoreoEscolar.Server.Models
{
    public class Reporte
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Fecha { get; set; }//NOTA MODIFICARLO DE DATETIME A DATE PARA QUE NO SE GUARDE LA HORA

        [Required]
        public string Motivo { get; set; } = string.Empty;

        [Required]
        public string ResponsableDelReporte { get; set; } = string.Empty; // Responsable de quien pone los reportes al alumnado

        // Clave foránea para asociar el reporte a un alumno(se quito required)
        public int AlumnoId { get; set; }

        [ForeignKey("AlumnoId")]
        public Alumno? Alumno { get; set; }
    }
}
