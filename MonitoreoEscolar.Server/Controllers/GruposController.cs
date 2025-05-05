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

        // Obtener todos los grupos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GrupoDTO>>> GetGrupos()
        {
            var grupos = await _context.Grupos
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


        // Crear un nuevo grupo
        [HttpPost("agregar")]
        public async Task<IActionResult> AgregarGrupo([FromBody] Grupo grupo)
        {
            // Validación opcional para el nombre del docente
            if (string.IsNullOrWhiteSpace(grupo.NombreDocente))
            {
                return BadRequest(new { mensaje = "El nombre del docente es requerido." });
            }

            var grupoExistente = await _context.Grupos
                .FirstOrDefaultAsync(g => g.Grado == grupo.Grado && g.Letra == grupo.Letra);

            if (grupoExistente != null)
            {
                return BadRequest(new { mensaje = "El grupo ya está registrado." });
            }

            _context.Grupos.Add(grupo);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Grupo agregado exitosamente." });
        }

        // Endpoint para eliminar un grupo y sus alumnos asociados
        [HttpDelete("eliminar/{id}")]
        public async Task<IActionResult> EliminarGrupo(int id)
        {
            // Buscar el grupo por id
            var grupo = await _context.Grupos.FindAsync(id);
            if (grupo == null)
            {
                return NotFound(new { mensaje = "Grupo no encontrado." });
            }

            // Construir el string que representa el grupo (ejemplo: "1A")
            var grupoString = $"{grupo.Grado}{grupo.Letra}";

            // Buscar todos los alumnos cuyo campo 'Grupo' coincida con el string construido
            var alumnosGrupo = await _context.Alumnos
                .Where(a => a.Grupo == grupoString) 
                .ToListAsync();

            if (alumnosGrupo.Any())
            {
                _context.Alumnos.RemoveRange(alumnosGrupo);
            }

            _context.Grupos.Remove(grupo);
            await _context.SaveChangesAsync();  

            return Ok(new { mensaje = "Grupo eliminado exitosamente." });
        }

        // Endpoint para editar solo el nombre del docente (VA EN GRUPOS CONTROLLER)
        [HttpPut("editar/{id}")]
        public async Task<IActionResult> EditarNombreDocente(int id, [FromBody] Grupo grupoEditado)
        {
            var grupo = await _context.Grupos.FindAsync(id);
            if (grupo == null)
            {
                return NotFound(new { mensaje = "Grupo no encontrado." });
            }

            // Se actualiza solo el nombre del docente, sin modificar el grado o la letra
            grupo.NombreDocente = grupoEditado.NombreDocente;

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Nombre del docente actualizado exitosamente." });
        }

        // Endpoint para eliminar (quitar) el docente de un grupo
        [HttpPut("eliminarDocente/{id}")]
        public async Task<IActionResult> EliminarDocente(int id)
        {
            var grupo = await _context.Grupos.FindAsync(id);
            if (grupo == null)
            {
                return NotFound(new { mensaje = "Grupo no encontrado." });
            }

            // Establece el nombre del docente en cadena vacía para "eliminar" la asignación
            grupo.NombreDocente = "";
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Docente eliminado exitosamente." });
        }

    }

}
