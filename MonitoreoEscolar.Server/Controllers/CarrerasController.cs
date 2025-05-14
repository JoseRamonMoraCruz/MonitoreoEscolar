using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;

namespace MonitoreoEscolar.Server.Controllers
{
    [Route("api/carreras")]
    [ApiController]
    public class CarrerasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CarrerasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/carreras
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Carrera>>> GetCarreras()
        {
            return await _context.Carreras
                .OrderBy(c => c.Nombre)
                .ToListAsync();
        }

        // POST: api/carreras/agregar
        [HttpPost("agregar")]
        public async Task<IActionResult> AgregarCarrera([FromBody] Carrera carrera)
        {
            if (string.IsNullOrWhiteSpace(carrera.Nombre))
                return BadRequest(new { mensaje = "El nombre de la carrera es requerido." });

            var existe = await _context.Carreras
                .AnyAsync(c => c.Nombre == carrera.Nombre);
            if (existe)
                return BadRequest(new { mensaje = "La carrera ya existe." });

            _context.Carreras.Add(carrera);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Carrera agregada exitosamente.", carrera.Id });
        }
    }
}
