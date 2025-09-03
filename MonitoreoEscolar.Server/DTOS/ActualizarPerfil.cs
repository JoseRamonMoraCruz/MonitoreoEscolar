using System.ComponentModel.DataAnnotations;

public class ActualizarPerfilRequest
{
    [Required]
    public int Id_Usuario { get; set; }

    [Required]
    public string Nombre { get; set; } = string.Empty;


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