using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MonitoreoEscolar.Server.Models
{
    public class Carrera
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;

        // Relación opcional con grupos
        public List<Grupo>? Grupos { get; set; }
    }
}
