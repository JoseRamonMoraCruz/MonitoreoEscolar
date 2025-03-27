using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;

namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/reportes")]
    public class ReportesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("generar")]
        public async Task<IActionResult> GenerarReporte([FromBody] Reporte reporte)
        {
            if (reporte == null)
                return BadRequest(new { mensaje = "Los datos enviados son nulos." });

            // Validar que el alumno existe
            var alumnoExistente = await _context.Alumnos.FindAsync(reporte.AlumnoId);
            if (alumnoExistente == null)
                return NotFound(new { mensaje = "Alumno no encontrado para asignar el reporte." });

            _context.Reportes.Add(reporte);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Reporte generado exitosamente.", reporte });
        }
    }
}
