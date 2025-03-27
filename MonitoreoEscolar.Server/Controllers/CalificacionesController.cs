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
            {
                _logger.LogWarning("❌ Archivo no válido o vacío.");
                return BadRequest("❌ Archivo no válido o vacío.");
            }

            try
            {
                _logger.LogInformation($"📂 Archivo recibido: {file.FileName}, Tamaño: {file.Length} bytes");

                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets[0];

                if (worksheet == null)
                {
                    _logger.LogWarning("❌ No se encontró una hoja en el archivo Excel.");
                    return BadRequest("❌ No se encontró una hoja en el archivo Excel.");
                }

                var rowCount = worksheet.Dimension?.Rows ?? 0;
                _logger.LogInformation($"📊 Total de filas en Excel: {rowCount}");

                if (rowCount < 2)
                {
                    _logger.LogWarning("❌ El archivo Excel no tiene suficientes filas de datos.");
                    return BadRequest("❌ El archivo Excel no tiene suficientes filas de datos.");
                }

                List<Calificacion> calificacionesGuardadas = new List<Calificacion>();

                for (int row = 2; row <= rowCount; row++)
                {
                    string grupoStr = worksheet.Cells[row, 4].Text.Trim();
                    _logger.LogInformation($"🔍 Fila {row} - Grupo en Excel: '{grupoStr}'");

                    if (string.IsNullOrEmpty(grupoStr) || grupoStr.Length < 2)
                    {
                        _logger.LogWarning($"⚠️ Grupo inválido o con formato incorrecto en fila {row}: '{grupoStr}'");
                        continue;
                    }

                    string gradoStr = grupoStr.Substring(0, grupoStr.Length - 1);
                    string letra = grupoStr.Substring(grupoStr.Length - 1, 1);

                    if (!int.TryParse(gradoStr, out int grado))
                    {
                        _logger.LogWarning($"⚠️ No se pudo extraer el grado en fila {row}: '{grupoStr}'");
                        continue;
                    }

                    var grupoEncontrado = await _context.Grupos.FirstOrDefaultAsync(g => g.Grado == grado && g.Letra == letra);

                    if (grupoEncontrado == null)
                    {
                        _logger.LogWarning($"⚠️ Grupo '{grupoStr}' no encontrado en la BD para la fila {row}.");
                        continue;
                    }

                    string nombreAlumno = worksheet.Cells[row, 1].Text.Trim();
                    string nombreNormalizado = Normalizar(nombreAlumno);

                    var alumno = await _context.Alumnos
                        .FirstOrDefaultAsync(a => a.NombreCompletoNormalizado == nombreNormalizado);

                    if (alumno == null)
                    {
                        _logger.LogWarning($"⚠️ Alumno '{nombreAlumno}' no encontrado en fila {row}.");
                        continue;
                    }

                    string calificacionTexto = worksheet.Cells[row, 3].Text.Trim();
                    if (!int.TryParse(calificacionTexto, out int calificacionValor))
                    {
                        _logger.LogWarning($"⚠️ Calificación inválida en fila {row}: '{calificacionTexto}'");
                        continue;
                    }

                    string materia = worksheet.Cells[row, 2].Text.Trim();
                    string parcialUnidad = worksheet.Cells[row, 5].Text.Trim();

                    // Validación contra duplicados
                    bool yaExiste = await _context.Calificaciones.AnyAsync(c =>
                        c.AlumnoId == alumno.Id &&
                        c.Materia == materia &&
                        c.GrupoId == grupoEncontrado.Id &&
                        c.ParcialUnidad == parcialUnidad
                    );

                    if (yaExiste)
                    {
                        _logger.LogWarning($"⚠️ Dato duplicado. Ya existe calificación para '{nombreAlumno}', materia '{materia}', grupo '{grupoStr}', unidad '{parcialUnidad}' en fila {row}.");
                        continue;
                    }

                    var calificacion = new Calificacion
                    {
                        Nombre = nombreAlumno,
                        Materia = materia,
                        CalificacionValor = calificacionValor,
                        GrupoId = grupoEncontrado.Id,
                        ParcialUnidad = parcialUnidad,
                        AlumnoId = alumno.Id
                    };

                    _context.Calificaciones.Add(calificacion);
                    calificacionesGuardadas.Add(calificacion);
                }

                await _context.SaveChangesAsync();

                //  Si no se guardó ninguna calificación, muestra un mensaje especial
                if (calificacionesGuardadas.Count == 0)
                {
                    return BadRequest("❌ No se subieron las calificaciones porque hubo datos duplicados. Revisa el archivo Excel por favor antes de subirlo.");
                }

                return Ok(new
                {
                    mensaje = " Calificaciones cargadas correctamente.",
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
                _logger.LogError($"❌ ERROR en SubirCalificaciones: {ex}");
                return StatusCode(500, $"Error interno del servidor: {ex.Message} {ex.InnerException?.Message}");
            }
        }


        //PARA OBTENER LAS CALIFICACIONES DE LA BASE DE DATOS
        [HttpGet("obtenerCalificaciones")]
        public async Task<IActionResult> ObtenerCalificaciones()
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Grupo)
                .Select(c => new
                {
                    c.Nombre,
                    c.Materia,
                    c.CalificacionValor,
                    Grupo = $"{c.Grupo.Grado}{c.Grupo.Letra}",
                    c.ParcialUnidad
                })
                .ToListAsync();

            // Verifica en la consola si la API está devolviendo datos
            Console.WriteLine("📊 Datos obtenidos desde la BD:");
            foreach (var cal in calificaciones)
            {
                Console.WriteLine($"➡ {cal.Nombre} - {cal.Materia} - {cal.CalificacionValor} - {cal.Grupo} - {cal.ParcialUnidad}");
            }

            return Ok(calificaciones);
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

            return Ok($"✅ Se actualizaron {actualizadas} calificaciones con su AlumnoId.");
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
