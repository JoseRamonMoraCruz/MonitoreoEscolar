using Microsoft.AspNetCore.Mvc;
using MonitoreoEscolar.Server.Data;
using System;

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
        try
        {
            Console.WriteLine("🔍 Intentando conectar a SQL Server...");

            if (_context.Database.CanConnect())
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("✅ Conexión exitosa a SQL Server.");
                Console.ResetColor();
                return Ok(new { mensaje = "✅ Conexión exitosa a SQL Server" });
            }

            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("❌ No se pudo conectar a SQL Server.");
            Console.ResetColor();
            return StatusCode(500, new { mensaje = "❌ No se pudo conectar a SQL Server" });
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"❌ ERROR de conexión a SQL Server: {ex.Message}");

            if (ex.InnerException != null)
            {
                Console.WriteLine($"➡️ Detalles internos: {ex.InnerException.Message}");
            }

            Console.WriteLine($"🔍 StackTrace: {ex.StackTrace}");
            Console.ResetColor();

            return StatusCode(500, new
            {
                mensaje = "❌ Error al conectar a SQL Server",
                error = ex.Message,
                detallesInternos = ex.InnerException?.Message,
                stackTrace = ex.StackTrace
            });
        }
    }
}
