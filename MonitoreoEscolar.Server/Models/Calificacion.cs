using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MonitoreoEscolar.Server.Models
{
    public class Calificacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; }

        [Required]
        public string Materia { get; set; }

        [Required]
        public int CalificacionValor { get; set; }

        [ForeignKey("Grupo")]
        public int GrupoId { get; set; }

        // Relación con Grupo
        [Required]
        public Grupo Grupo { get; set; }

        [Required]
        public string ParcialUnidad { get; set; }

        // Relación con Alumno
        [ForeignKey("Alumno")]
        public int? AlumnoId { get; set; }

        public Alumno Alumno { get; set; }

    }
}

