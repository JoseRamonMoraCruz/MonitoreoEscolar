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
    }
}
