using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MonitoreoEscolar.Server.Models
{
    public class Grupo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int Grado { get; set; } // 1, 2, 3, 4, 5, 6

        [Required]
        public string Letra { get; set; } = string.Empty; // A, B, C

        public string NombreGrupo => $"{Grado}{Letra}"; // Genera el nombre del grupo automáticamente

        public List<Alumno>? Alumnos { get; set; } // Relación con los alumnos
    }
}
