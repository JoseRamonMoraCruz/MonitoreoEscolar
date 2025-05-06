using MonitoreoEscolar.Server.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Alumno
{
    [Key]
    public int Id { get; set; }

    // Nombres
    [Required]
    public string PrimerNombre { get; set; } = string.Empty;

    public string? SegundoNombre { get; set; }

    [Required]
    public string ApellidoPaterno { get; set; } = string.Empty;

    [Required]
    public string ApellidoMaterno { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string NombreCompletoNormalizado { get; set; } = string.Empty;

    // Dirección estructurada
    [Required]
    public string Domicilio { get; set; } = string.Empty;

    // Datos escolares
    [Required]
    public string Grado { get; set; } = string.Empty;
    [Required]
    public string Letra { get; set; } = string.Empty;

    public string? Carrera { get; set; }
    public string? Plantel { get; set; }
    public string? Turno { get; set; }
    public string CURP { get; set; } = string.Empty;
    public string? NumeroControl { get; set; }
    public string? Ciclo { get; set; }
    public string? Generacion { get; set; }

    // Relación con tutor
    public int? TutorId { get; set; }

    [ForeignKey("TutorId")]
    public Usuario? TutorUsuario { get; set; }
}
