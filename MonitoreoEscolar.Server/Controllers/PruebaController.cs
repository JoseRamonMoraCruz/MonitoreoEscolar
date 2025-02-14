using Microsoft.AspNetCore.Mvc;
using MonitoreoEscolar.Server.Data;

[Route("api/[controller]")]
[ApiController]
public class PruebaController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PruebaController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("verificar-conexion")]
    public IActionResult VerificarConexion()
    {
        if (_context.Database.CanConnect())
        {
            return Ok(new { mensaje = "✅ Conexión exitosa a SQL Server" });
        }
        return StatusCode(500, new { mensaje = "❌ No se pudo conectar a SQL Server" });
    }
}
