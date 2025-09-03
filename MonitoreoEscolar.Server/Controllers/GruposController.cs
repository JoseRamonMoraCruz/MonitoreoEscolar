using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.DTOs;
using MonitoreoEscolar.Server.Models;

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

        // ✅ Obtener todos los grupos de una escuela específica
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GrupoDTO>>> GetGrupos([FromQuery] int escuelaId)
        {
            var grupos = await _context.Grupos
                .Where(g => g.EscuelaId == escuelaId)
                .Select(g => new GrupoDTO
                {
                    Id = g.Id,
                    Grado = g.Grado,
                    Letra = g.Letra,
                    Carrera = g.Carrera,
                    NombreDocente = g.NombreDocente
                })
                .ToListAsync();

            return Ok(grupos);
        }

        // ✅ Crear un nuevo grupo asociado a una escuela
        [HttpPost("agregar")]
        public async Task<IActionResult> AgregarGrupo([FromBody] Grupo grupo)
        {
            if (grupo.EscuelaId == null)
                return BadRequest(new { mensaje = "Falta el ID de la escuela." });

            if (string.IsNullOrWhiteSpace(grupo.NombreDocente))
                return BadRequest(new { mensaje = "El nombre del docente es requerido." });

            var grupoExistente = await _context.Grupos
                .FirstOrDefaultAsync(g => g.Grado == grupo.Grado && g.Letra == grupo.Letra && g.EscuelaId == grupo.EscuelaId);

            if (grupoExistente != null)
                return BadRequest(new { mensaje = "El grupo ya está registrado para esta escuela." });

            _context.Grupos.Add(grupo);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Grupo agregado exitosamente." });
        }

        // ✅ Eliminar un grupo SOLO si pertenece a la escuela indicada
        [HttpDelete("eliminar/{id}")]
        public async Task<IActionResult> EliminarGrupo(int id, [FromQuery] int escuelaId)
        {
            var grupo = await _context.Grupos.FirstOrDefaultAsync(g => g.Id == id && g.EscuelaId == escuelaId);
            if (grupo == null)
                return NotFound(new { mensaje = "Grupo no encontrado o no pertenece a tu escuela." });

            _context.Grupos.Remove(grupo);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Grupo eliminado exitosamente." });
        }

        // ✅ Editar solo el nombre del docente (verificando Escuela)
        [HttpPut("editar/{id}")]
        public async Task<IActionResult> EditarNombreDocente(int id, [FromQuery] int escuelaId, [FromBody] Grupo grupoEditado)
        {
            var grupo = await _context.Grupos.FirstOrDefaultAsync(g => g.Id == id && g.EscuelaId == escuelaId);
            if (grupo == null)
                return NotFound(new { mensaje = "Grupo no encontrado o no pertenece a tu escuela." });

            grupo.NombreDocente = grupoEditado.NombreDocente;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Nombre del docente actualizado exitosamente." });
        }

        // ✅ Eliminar (vaciar) el nombre del docente (verificando Escuela)
        [HttpPut("eliminarDocente/{id}")]
        public async Task<IActionResult> EliminarDocente(int id, [FromQuery] int escuelaId)
        {
            var grupo = await _context.Grupos.FirstOrDefaultAsync(g => g.Id == id && g.EscuelaId == escuelaId);
            if (grupo == null)
                return NotFound(new { mensaje = "Grupo no encontrado o no pertenece a tu escuela." });

            grupo.NombreDocente = "";
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Docente eliminado exitosamente." });
        }
    }
}
