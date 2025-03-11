using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using OfficeOpenXml; // EPPlus
using System.Globalization;
using System.Text;

namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/alumnos")]
    public class AlumnosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AlumnosController(ApplicationDbContext context)
        {
            _context = context;
            Console.WriteLine("✔ AlumnosController CARGADO");
        }

        // 🔹 REGISTRAR ALUMNO
        [HttpPost("registro")]
        public async Task<IActionResult> RegistrarAlumno([FromBody] Alumno request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { mensaje = "❌ Los datos enviados son nulos." });

                if (string.IsNullOrWhiteSpace(request.Nombre) || string.IsNullOrWhiteSpace(request.Apellidos))
                    return BadRequest(new { mensaje = "❌ Nombre y Apellidos son obligatorios." });

                var nombreCompleto = $"{request.Nombre.Trim()} {request.Apellidos.Trim()}".Trim();
                var nombreNormalizado = RemoveDiacritics(nombreCompleto.ToLower());

                var alumno = new Alumno
                {
                    Nombre = request.Nombre.Trim(),
                    Apellidos = request.Apellidos.Trim(),
                    NombreCompleto = nombreCompleto,
                    NombreCompletoNormalizado = nombreNormalizado,
                    Grupo = request.Grupo.Trim(),
                    Tutor = request.Tutor.Trim(),
                    Domicilio = request.Domicilio.Trim()
                };

                _context.Alumnos.Add(alumno);
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "✅ Alumno registrado exitosamente", alumno });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "❌ Error interno del servidor.", error = ex.Message });
            }
        }

        // 🔹 OBTENER ALUMNOS DE UN GRUPO ESPECÍFICO
        [HttpGet("grupo/{grupoStr}")]
        public async Task<IActionResult> ObtenerAlumnosPorGrupo(string grupoStr)
        {
            try
            {
                // Buscamos alumnos cuyo campo 'Grupo' coincida con grupoStr (ej. "1C")
                var alumnos = await _context.Alumnos
                    .Where(a => a.Grupo == grupoStr)
                    .OrderBy(a => a.NombreCompleto)
                    .ToListAsync();

                return Ok(alumnos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "❌ Error al obtener alumnos por grupo.", error = ex.Message });
            }
        }

        // 🔹 SUBIR Y PROCESAR ARCHIVO EXCEL
        [HttpPost("subirCalificaciones")]
        public async Task<IActionResult> SubirExcel()
        {
            try
            {
                var file = Request.Form.Files.FirstOrDefault();
                if (file == null || file.Length == 0)
                {
                    Console.WriteLine("❌ No se proporcionó un archivo válido.");
                    return BadRequest(new { mensaje = "❌ No se proporcionó un archivo válido." });
                }

                Console.WriteLine($"✔ Archivo recibido: {file.FileName}, Tamaño: {file.Length} bytes");

                var calificaciones = new List<Calificacion>();

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        ExcelWorksheet worksheet = package.Workbook.Worksheets[0];
                        if (worksheet == null)
                        {
                            Console.WriteLine("❌ No se pudo leer la hoja de Excel.");
                            return BadRequest(new { mensaje = "❌ No se pudo leer la hoja de Excel." });
                        }

                        int rowCount = worksheet.Dimension.Rows;
                        int colCount = worksheet.Dimension.Columns;
                        Console.WriteLine($"✔ Archivo Excel detectado - Filas: {rowCount}, Columnas: {colCount}");

                        //  Leer encabezados de la primera fila y normalizarlos
                        Dictionary<string, int> columnas = new Dictionary<string, int>();
                        for (int col = 1; col <= colCount; col++)
                        {
                            string header = RemoveDiacritics(worksheet.Cells[1, col].Text.Trim().ToLower().Replace(" ", ""));
                            columnas[header] = col;
                        }

                        //  Definir los nombres esperados y sus posibles variantes
                        Dictionary<string, string> columnasEsperadas = new Dictionary<string, string>
                        {
                            { "nombre", "nombre" },
                            { "materia", "materia" },
                            { "calificacion", "calificaciones" }, // Ajuste según tu archivo
                            { "grupo", "grupo" },
                            { "parcialunidad", "parcial/unidad" }
                        };

                        //  Validar que todas las columnas requeridas existen
                        foreach (var col in columnasEsperadas)
                        {
                            if (!columnas.ContainsKey(RemoveDiacritics(col.Value.ToLower().Replace(" ", ""))))
                            {
                                Console.WriteLine($"❌ Falta la columna '{col.Value}' en el archivo Excel.");
                                return BadRequest(new { mensaje = $"❌ Falta la columna '{col.Value}' en el archivo Excel." });
                            }
                        }

                        // 🔹 Procesar filas de datos
                        for (int row = 2; row <= rowCount; row++)
                        {
                            try
                            {
                                string grupoTexto = worksheet.Cells[row, columnas["grupo"]].Text.Trim();
                                var grupoEncontrado = _context.Grupos.FirstOrDefault(g => g.Grado + g.Letra == grupoTexto);

                                if (grupoEncontrado == null)
                                {
                                    Console.WriteLine($"⚠ Grupo '{grupoTexto}' no encontrado. Fila {row} omitida.");
                                    continue;
                                }

                                string califTexto = worksheet.Cells[row, columnas["calificacion"]].Text.Trim();
                                if (!int.TryParse(califTexto, out int calif) || calif < 0 || calif > 100)
                                {
                                    Console.WriteLine($"⚠ Calificación inválida '{califTexto}' en la fila {row}. Omitida.");
                                    continue;
                                }

                                var calificacion = new Calificacion
                                {
                                    Nombre = worksheet.Cells[row, columnas["nombre"]].Text.Trim(),
                                    Materia = worksheet.Cells[row, columnas["materia"]].Text.Trim(),
                                    GrupoId = grupoEncontrado.Id,
                                    ParcialUnidad = worksheet.Cells[row, columnas["parcialunidad"]].Text.Trim(),
                                    CalificacionValor = calif
                                };

                                calificaciones.Add(calificacion);
                            }
                            catch (Exception e)
                            {
                                Console.WriteLine($"⚠ Error en la fila {row}: {e.Message}");
                            }
                        }
                    }
                }

                _context.Calificaciones.AddRange(calificaciones);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✅ {calificaciones.Count} registros guardados.");
                return Ok(new { mensaje = "✅ Archivo procesado correctamente.", calificaciones });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "❌ Error interno del servidor.", error = ex.Message });
            }
        }

        // 🔹 FUNCIÓN PARA ELIMINAR ACENTOS Y CARACTERES ESPECIALES
        private static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;

            text = text.Normalize(NormalizationForm.FormD);
            StringBuilder sb = new StringBuilder();

            foreach (char c in text)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            return sb.ToString().Normalize(NormalizationForm.FormC);
        }
    }
}
