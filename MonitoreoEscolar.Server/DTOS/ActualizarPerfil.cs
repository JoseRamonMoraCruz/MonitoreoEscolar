using System.ComponentModel.DataAnnotations;

public class ActualizarPerfilRequest
{
    [Required]
    public int Id_Usuario { get; set; }

    [Required]
    public string PrimerNombre { get; set; } = string.Empty;

    public string? SegundoNombre { get; set; }

    [Required]
    public string ApellidoPaterno { get; set; } = string.Empty;

    [Required]
    public string ApellidoMaterno { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Correo { get; set; } = string.Empty;

    [Required]
    public string Telefono { get; set; } = string.Empty;
}
