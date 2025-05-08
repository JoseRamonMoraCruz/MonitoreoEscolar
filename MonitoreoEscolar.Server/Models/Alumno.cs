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
    public string Apellidos { get; set; } = string.Empty;

    public string NombreCompleto { get; set; } = string.Empty;

    public string NombreCompletoNormalizado { get; set; } = string.Empty; 

    [Required]
    public string Grupo { get; set; } = string.Empty;

    public string? Carrera { get; set; }
    public string? Plantel { get; set; }
    public string? Turno { get; set; }
    public string CURP { get; set; } = string.Empty;
    public string? NumeroControl { get; set; }
    public string? Ciclo { get; set; }
    public string? Generacion { get; set; }

    public string? Ciclo { get; set; }//Cambio de ciclo a periodo

    public string? Generacion { get; set; } //La generacion del alumno

    public int? TutorId { get; set; }

    [ForeignKey("TutorId")]
    public Usuario? TutorUsuario { get; set; }

    [Required]
    public string Domicilio { get; set; } = string.Empty;

    public string CodigoQR { get; set; } = string.Empty;

}
