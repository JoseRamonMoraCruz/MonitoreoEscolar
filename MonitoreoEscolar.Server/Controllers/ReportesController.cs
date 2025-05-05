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

        // GET: api/reportes
        [HttpGet]
        public async Task<IActionResult> ObtenerReportes()
        {
            var list = await _context.Reportes
                .Include(r => r.Alumno)
                .ToListAsync();

            var dto = list.Select(r => new {
                id = r.Id,
                alumnoId = r.AlumnoId,
                nombreCompleto = r.Alumno.Nombre + " " + r.Alumno.Apellidos,
                fecha = r.Fecha,
                motivo = r.Motivo
            });

            return Ok(dto);
        }

        // DELETE: api/reportes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarReporte(int id)
        {
            var rep = await _context.Reportes.FindAsync(id);
            if (rep == null) return NotFound(new { mensaje = "Reporte no encontrado." });

            _context.Reportes.Remove(rep);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Reporte eliminado exitosamente." });
        }

        // PUT: api/reportes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarReporte(int id, [FromBody] Reporte request)
        {
            var rep = await _context.Reportes.FindAsync(id);
            if (rep == null)
                return NotFound(new { mensaje = "Reporte no encontrado." });

            // Actualiza sólo los campos editables
            rep.Fecha = request.Fecha;
            rep.Motivo = request.Motivo;

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Reporte actualizado exitosamente.", reporte = rep });
        }
    }
}
