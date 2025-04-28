using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using OfficeOpenXml;

namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/calificaciones")]
    public class CalificacionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CalificacionesController> _logger;

        public CalificacionesController(ApplicationDbContext context, ILogger<CalificacionesController> logger)
        {
            _context = context;
            _logger = logger;
        }
        //PARA SUBIR LAS CALIFICACIONES A LA BASE DE DATOS CON UN ARCHIVO EXCEL
        [HttpPost("subirCalificaciones")]
        public async Task<IActionResult> SubirCalificaciones(IFormFile file)
        {
            if (file == null || file.Length <= 0)
                return BadRequest("Archivo no válido o vacío.");

            try
            {
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets[0];

                if (worksheet == null)
                    return BadRequest("No se encontró una hoja en el archivo Excel.");

                var rowCount = worksheet.Dimension?.Rows ?? 0;

                // Cache alumnos y grupos para mejor rendimiento
                var alumnosDict = await _context.Alumnos.ToDictionaryAsync(a => Normalizar(a.NombreCompleto));
                var gruposDict = await _context.Grupos.ToDictionaryAsync(
                    g => $"{g.Grado}{g.Letra}".ToUpper()
                );

                var calificacionesGuardadas = new List<Calificacion>();

                for (int row = 2; row <= rowCount; row++)
                {
                    string nombreAlumno = worksheet.Cells[row, 1].Text.Trim();
                    string grupoStr = worksheet.Cells[row, worksheet.Dimension.Columns - 1].Text.Trim();
                    string parcialUnidad = worksheet.Cells[row, worksheet.Dimension.Columns].Text.Trim();

                    if (string.IsNullOrWhiteSpace(nombreAlumno) || string.IsNullOrWhiteSpace(grupoStr))
                        continue;

                    string nombreNormalizado = Normalizar(nombreAlumno);

                    if (!alumnosDict.TryGetValue(nombreNormalizado, out var alumno))
                        continue;

                    if (!gruposDict.TryGetValue(grupoStr.ToUpper(), out var grupo))
                        continue;

                    // Leer dinámicamente columnas tipo Materia N / Calificación de Materia N
                    for (int col = 2; col < worksheet.Dimension.Columns - 2; col += 2)
                    {
                        string materia = worksheet.Cells[row, col].Text.Trim();
                        string calificacionTexto = worksheet.Cells[row, col + 1].Text.Trim();

                        if (string.IsNullOrWhiteSpace(materia) || string.IsNullOrWhiteSpace(calificacionTexto))
                            continue;

                        if (!int.TryParse(calificacionTexto, out int calificacionValor))
                            continue;

                        // Evitar duplicados
                        bool yaExiste = await _context.Calificaciones.AnyAsync(c =>
                            c.AlumnoId == alumno.Id &&
                            c.Materia == materia &&
                            c.GrupoId == grupo.Id &&
                            c.ParcialUnidad == parcialUnidad
                        );

                        if (yaExiste)
                            continue;

                        var calificacion = new Calificacion
                        {
                            Nombre = nombreAlumno,
                            Materia = materia,
                            CalificacionValor = calificacionValor,
                            GrupoId = grupo.Id,
                            ParcialUnidad = parcialUnidad,
                            AlumnoId = alumno.Id
                        };

                        calificacionesGuardadas.Add(calificacion);
                    }
                }

                _context.Calificaciones.AddRange(calificacionesGuardadas);
                await _context.SaveChangesAsync();

                if (calificacionesGuardadas.Count == 0)
                    return BadRequest("No se subió ninguna calificación. Revisa duplicados o formato.");

                return Ok(new
                {
                    mensaje = "Calificaciones cargadas correctamente.",
                    cantidad = calificacionesGuardadas.Count,
                    calificaciones = calificacionesGuardadas.Select(c => new
                    {
                        nombre = c.Nombre,
                        materia = c.Materia,
                        calificacionValor = c.CalificacionValor,
                        grupo = $"{c.Grupo.Grado}{c.Grupo.Letra}",
                        parcialUnidad = c.ParcialUnidad
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message} {ex.InnerException?.Message}");
            }
        }


        //PARA OBTENER LAS CALIFICACIONES DE LA BASE DE DATOS
        [HttpGet("obtenerCalificaciones")]
        public async Task<IActionResult> ObtenerCalificacionesResumen()
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Grupo)
                .GroupBy(c => new { c.Nombre, c.Grupo.Grado, c.Grupo.Letra, c.ParcialUnidad })
                .ToListAsync();

            var resumen = calificaciones.Select(grupo =>
            {
                var datosAlumno = new Dictionary<string, object>
                {
                    ["alumno"] = grupo.Key.Nombre,
                    ["grupo"] = $"{grupo.Key.Grado}{grupo.Key.Letra}",
                    ["parcialUnidad"] = grupo.Key.ParcialUnidad
                };

                foreach (var calificacion in grupo)
                {
                    datosAlumno[calificacion.Materia] = calificacion.CalificacionValor;
                }

                return datosAlumno;
            });

            return Ok(resumen);
        }

        //PARA ASIGNAR EL ID DEL ALUMNO A LAS CALIFICACIONES SOLO ES NECESARIO EJECUTAR ESTE METODO UNA VEZ
        [HttpPost("asignar-alumno-id")]
        public async Task<IActionResult> AsignarAlumnoIdACalificaciones()
        {
            var calificaciones = _context.Calificaciones.Where(c => c.AlumnoId == null).ToList();

            int actualizadas = 0;

            foreach (var cal in calificaciones)
            {
                var alumno = _context.Alumnos.FirstOrDefault(a => a.NombreCompleto == cal.Nombre);

                if (alumno != null)
                {
                    cal.AlumnoId = alumno.Id;
                    actualizadas++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok($" Se actualizaron {actualizadas} calificaciones con su AlumnoId.");
        }
        //PARA NORMALIZAR EL NOMBRE DEL ALUMNO
        private string Normalizar(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";

            var normalized = input.Normalize(System.Text.NormalizationForm.FormD);
            var sb = new System.Text.StringBuilder();

            foreach (var c in normalized)
            {
                var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }
            return sb.ToString().ToLower().Replace("  ", " ").Trim();
        }
    }
}
