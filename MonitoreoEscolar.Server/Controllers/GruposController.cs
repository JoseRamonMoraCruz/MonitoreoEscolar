using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace MonitoreoEscolar.Server.Controllers
{
    [Route("api/grupos")]
    [ApiController]
    public class GruposController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GruposController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Obtener todos los grupos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Grupo>>> GetGrupos()
        {
            return await _context.Grupos.ToListAsync();
        }

        // Crear un nuevo grupo
        [HttpPost("agregar")]
        public async Task<IActionResult> AgregarGrupo([FromBody] Grupo grupo)
        {
            // Verificar si el grupo ya existe
            var grupoExistente = await _context.Grupos
                .FirstOrDefaultAsync(g => g.Grado == grupo.Grado && g.Letra == grupo.Letra);

            if (grupoExistente != null)
            {
                return BadRequest(new { mensaje = "❌ El grupo ya está registrado." });
            }

            _context.Grupos.Add(grupo);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Grupo agregado exitosamente." });
        }
    }
}
