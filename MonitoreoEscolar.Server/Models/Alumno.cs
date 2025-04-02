using MonitoreoEscolar.Server.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Alumno
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    public string Apellidos { get; set; } = string.Empty;

    public string NombreCompleto { get; set; } = string.Empty; // Se genera automáticamente

    public string NombreCompletoNormalizado { get; set; } = string.Empty; // Se genera automáticamente

    [Required]
    public string Grupo { get; set; } = string.Empty;

    // Quitar el [Required] y hacer que TutorId sea nullable:
    public int? TutorId { get; set; }

    [ForeignKey("TutorId")]
    public Usuario? TutorUsuario { get; set; }

    [Required]
    public string Domicilio { get; set; } = string.Empty;
}
