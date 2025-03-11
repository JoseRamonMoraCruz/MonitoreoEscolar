using System.ComponentModel.DataAnnotations;

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

        [Required]
        public string Grupo { get; set; }

        [Required]
        public string ParcialUnidad { get; set; }
    }
}

