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

                    if (string.IsNullOrEmpty(grupoStr))
                    {
                        _logger.LogWarning($"⚠️ Grupo inválido en fila {row}: '{grupoStr}'");
                        continue;
                    }

                    if (grupoStr.Length < 2)
                    {
                        _logger.LogWarning($"⚠️ Grupo en fila {row} tiene un formato incorrecto: '{grupoStr}'");
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

                    _logger.LogInformation($"✅ Grupo '{grupoStr}' encontrado con ID: {grupoEncontrado.Id}");

                    string calificacionTexto = worksheet.Cells[row, 3].Text.Trim();
                    if (!int.TryParse(calificacionTexto, out int calificacionValor))
                    {
                        _logger.LogWarning($"⚠️ Calificación inválida en fila {row}: '{calificacionTexto}'");
                        continue;
                    }

                    var calificacion = new Calificacion
                    {
                        Nombre = worksheet.Cells[row, 1].Text,
                        Materia = worksheet.Cells[row, 2].Text,
                        CalificacionValor = calificacionValor,
                        GrupoId = grupoEncontrado.Id,
                        ParcialUnidad = worksheet.Cells[row, 5].Text
                    };

                    _context.Calificaciones.Add(calificacion);
                    calificacionesGuardadas.Add(calificacion);
                }

                await _context.SaveChangesAsync();

                //  Ahora devolvemos las calificaciones guardadas
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
    }
}
