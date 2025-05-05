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
        public string NombreAsignatura { get; set; }

        public int? Parcial1 { get; set; }
        public int? Parcial2 { get; set; }
        public int? Parcial3 { get; set; }

        public string? Tipo { get; set; } // Columna Y

        public string? Periodo { get; set; } // SEMESTRAL 2 o similar

        public bool? Firmado { get; set; } // Columna S

        public int? AsistenciasTotal { get; set; } // U+V+W+X


        [Required]
        public int CalificacionValor { get; set; }

        [ForeignKey("Grupo")]
        public int GrupoId { get; set; }

        // Relación con Grupo(se quito required)
        public Grupo Grupo { get; set; }

        [Required]
        public string ParcialUnidad { get; set; }

        // Relación con Alumno
        [ForeignKey("Alumno")]
        public int? AlumnoId { get; set; }

        public Alumno Alumno { get; set; }

    }
}

