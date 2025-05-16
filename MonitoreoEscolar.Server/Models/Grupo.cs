using MonitoreoEscolar.Server.Models;
using System.ComponentModel.DataAnnotations;

public class Grupo
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int Grado { get; set; }

    [Required]
    public string Letra { get; set; } = string.Empty;
    public string? Carrera { get; set; }


    public string NombreGrupo => $"{Grado}{Letra}"; 

    [Required]
    // Nueva propiedad para el docente
    public string NombreDocente { get; set; } = string.Empty;

    public List<Alumno>? Alumnos { get; set; }
}
