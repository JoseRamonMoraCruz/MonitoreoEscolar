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
    public string? Carrera { get; set; }

    public string? Plantel { get; set; }

    public string? Turno { get; set; }

    public string? CURP { get; set; }

    public string? NumeroControl { get; set; }

    public string? Ciclo { get; set; }

    public string? Generacion { get; set; } //La generacion del alumno

    // Quitar el [Required] y hacer que TutorId sea nullable:
    public int? TutorId { get; set; }

    [ForeignKey("TutorId")]
    public Usuario? TutorUsuario { get; set; }

    [Required]
    public string Domicilio { get; set; } = string.Empty;
}
