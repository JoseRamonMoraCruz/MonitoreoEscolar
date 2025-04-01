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

        // ENDPOINT PARA OBTENER LAS CALIFICACIONES DE LOS HIJOS DE UN PADRE
        [HttpGet("obtener-calificaciones-hijos/{idPadre}")]
        public async Task<IActionResult> ObtenerInformacionHijos(int idPadre)

        {
            var hijos = await _context.Alumnos
                .Where(a => a.TutorId == idPadre)
                .Include(a => a.TutorUsuario)
                .ToListAsync();

            if (hijos == null || !hijos.Any())
            {
                return NotFound(" No se encontraron alumnos registrados para este padre.");
            }

            var resultado = new List<object>();

            foreach (var hijo in hijos)
            {
                var calificaciones = await _context.Calificaciones
                    .Where(c => c.AlumnoId == hijo.Id)
                    .Include(c => c.Grupo)
                    .Select(c => new
                    {
                        c.Materia,
                        Calificacion = c.CalificacionValor,
                        Grupo = $"{c.Grupo.Grado}{c.Grupo.Letra}",
                        Parcial = c.ParcialUnidad
                    })
                    .ToListAsync();

                resultado.Add(new
                {
                    AlumnoId = hijo.Id,
                    NombreCompleto = $"{hijo.Nombre} {hijo.Apellidos}",
                    Calificaciones = calificaciones
                });
            }

            return Ok(resultado);
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
                    r.Motivo
                })
                .ToListAsync();

            return Ok(reportes);
        }
    }
}
