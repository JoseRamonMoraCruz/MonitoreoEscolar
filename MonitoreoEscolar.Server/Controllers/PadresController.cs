using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;

namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/padres")]
    public class PadresController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PadresController(ApplicationDbContext context)
        {
            _context = context;
        }

        
        // ENDPOINT PARA OBTENER LOS REPORTES DE UN HIJO
        [HttpGet("obtener-reportes-hijo/{alumnoId}")]
        public async Task<IActionResult> ObtenerReportesDeHijo(int alumnoId)
        {
            var alumnoExiste = await _context.Alumnos.AnyAsync(a => a.Id == alumnoId);
            if (!alumnoExiste)
            {
                return NotFound("El alumno no fue encontrado.");
            }

            var reportes = await _context.Reportes
                .Where(r => r.AlumnoId == alumnoId)
                .Select(r => new
                {
                    r.Motivo,
                    Fecha = r.Fecha
                })
                .ToListAsync();

            return Ok(reportes);
        }

        // ENDPOINT PARA OBTENER LOS HIJOS DE UN PADRE CON SU GRUPO
        [HttpGet("obtener-hijos-con-grupo/{idPadre}")]
        public async Task<IActionResult> ObtenerHijosConGrupo(int idPadre)
        {
            var hijos = await _context.Alumnos
                .Where(a => a.TutorId == idPadre)
                .Select(a => new
                {
                    AlumnoId = a.Id,
                    NombreCompleto = a.Nombre + " " + a.Apellidos,
                    Grupo = a.Grupo ?? "Sin grupo" // usa el campo Grupo directamente
                })
                .ToListAsync();

            if (hijos == null || hijos.Count == 0)
            {
                return NotFound("No se encontraron alumnos registrados para este padre.");
            }

            return Ok(hijos);
        }

        /*OBTENER CALIFCACIONES DE LOS ALUMNOS*/
        [HttpGet("obtener-calificaciones-alumno/{alumnoId}")]
        public async Task<IActionResult> ObtenerCalificacionesPorAlumno(int alumnoId)
        {
            var calificaciones = await _context.Calificaciones
                .Where(c => c.AlumnoId == alumnoId)
                .Include(c => c.Grupo)
                .ToListAsync();

            if (!calificaciones.Any())
                return Ok(new List<object>());

            // Detectar el parcial más alto
            var parcialMasReciente = calificaciones
                .Select(c => int.TryParse(c.ParcialUnidad, out var n) ? n : 0)
                .Max();

            // Filtrar por ese parcial
            var filtradas = calificaciones
                .Where(c => int.TryParse(c.ParcialUnidad, out var n) && n == parcialMasReciente)
                .Select(c => new
                {
                    c.Materia,
                    Calificacion = c.CalificacionValor,
                    Grupo = $"{c.Grupo.Grado}{c.Grupo.Letra}",
                    Parcial = c.ParcialUnidad
                })
                .ToList();

            return Ok(filtradas);
        }

       

    }
}
