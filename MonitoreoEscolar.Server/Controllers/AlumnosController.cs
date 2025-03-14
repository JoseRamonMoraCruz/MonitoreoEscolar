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
            Console.WriteLine(" AlumnosController CARGADO");
        }

        // REGISTRAR ALUMNO (Sin cambios)
        [HttpPost("registro")]
        public async Task<IActionResult> RegistrarAlumno([FromBody] Alumno request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { mensaje = " Los datos enviados son nulos." });

                if (string.IsNullOrWhiteSpace(request.Nombre) || string.IsNullOrWhiteSpace(request.Apellidos))
                    return BadRequest(new { mensaje = " Nombre y Apellidos son obligatorios." });

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

                return Ok(new { mensaje = " Alumno registrado exitosamente", alumno });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = " Error interno del servidor.", error = ex.Message });
            }
        }

        //  OBTENER ALUMNOS DE UN GRUPO ESPECÍFICO (Sin cambios)
        [HttpGet("grupo/{grupoStr}")]
        public async Task<IActionResult> ObtenerAlumnosPorGrupo(string grupoStr)
        {
            try
            {
                var alumnos = await _context.Alumnos
                    .Where(a => a.Grupo == grupoStr)
                    .OrderBy(a => a.NombreCompleto)
                    .ToListAsync();

                return Ok(alumnos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = " Error al obtener alumnos por grupo.", error = ex.Message });
            }
        }

        //  SUBIR Y PROCESAR ARCHIVO EXCEL (Corrección de GrupoId)
        [HttpPost("subirCalificaciones")]
        public async Task<IActionResult> SubirExcel()
        {
            try
            {
                var file = Request.Form.Files.FirstOrDefault();
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { mensaje = "❌ No se proporcionó un archivo válido." });
                }

                var calificaciones = new List<Calificacion>();

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        ExcelWorksheet worksheet = package.Workbook.Worksheets.FirstOrDefault();
                        if (worksheet == null)
                        {
                            return BadRequest(new { mensaje = "❌ No se pudo leer la hoja de Excel." });
                        }

                        int rowCount = worksheet.Dimension.Rows;
                        int colCount = worksheet.Dimension.Columns;

                        //  Leer encabezados de todas las filas y normalizarlos
                        Dictionary<string, int> columnas = new Dictionary<string, int>();
                        for (int row = 1; row <= rowCount; row++)
                        {
                            for (int col = 1; col <= colCount; col++)
                            {
                                string header = RemoveDiacritics(worksheet.Cells[row, col].Text.Trim().ToLower().Replace(" ", ""));
                                if (!string.IsNullOrEmpty(header) && !columnas.ContainsKey(header))
                                {
                                    columnas[header] = col;
                                }
                            }
                        }

                        //  Verificar si las columnas requeridas existen en el archivo
                        Dictionary<string, string> columnasEsperadas = new Dictionary<string, string>
                {
                    { "nombre", "nombre" },
                    { "materia", "materia" },
                    { "calificacion", "calificacion" },
                    { "grupo", "grupo" },
                    { "parcialunidad", "parcial/unidad" }
                };

                        foreach (var col in columnasEsperadas)
                        {
                            if (!columnas.ContainsKey(RemoveDiacritics(col.Value.ToLower().Replace(" ", ""))))
                            {
                                return BadRequest(new { mensaje = $"❌ Falta la columna '{col.Value}' en el archivo Excel." });
                            }
                        }

                        //  Obtener todos los alumnos y normalizar en memoria
                        var alumnos = _context.Alumnos.ToList().Select(a => new
                        {
                            a.Id,
                            Nombre = RemoveDiacritics(a.Nombre.ToLower()),
                            Grupo = RemoveDiacritics(a.Grupo.ToLower())
                        }).ToList();

                        //  Procesar filas de datos
                        for (int row = 2; row <= rowCount; row++)
                        {
                            try
                            {
                                string nombreAlumno = RemoveDiacritics(worksheet.Cells[row, columnas["nombre"]].Text.Trim().ToLower());
                                string grupoTexto = RemoveDiacritics(worksheet.Cells[row, columnas["grupo"]].Text.Trim().ToLower());

                                //  Buscar el alumno y obtener su GrupoId
                                var alumno = alumnos.FirstOrDefault(a => a.Nombre == nombreAlumno && a.Grupo == grupoTexto);
                                if (alumno == null)
                                {
                                    Console.WriteLine($"⚠ Alumno '{nombreAlumno}' en grupo '{grupoTexto}' no encontrado. Fila {row} omitida.");
                                    continue;
                                }

                                //  Obtener y validar la calificación
                                string califTexto = worksheet.Cells[row, columnas["calificacion"]].Text.Trim();
                                if (!int.TryParse(califTexto, out int calif) || calif < 0 || calif > 100)
                                {
                                    Console.WriteLine($"⚠ Calificación inválida '{califTexto}' en la fila {row}. Omitida.");
                                    continue;
                                }

                                var calificacion = new Calificacion
                                {
                                    Nombre = nombreAlumno,
                                    Materia = worksheet.Cells[row, columnas["materia"]].Text.Trim(),
                                    GrupoId = alumno.Id, //  Asigna el GrupoId del alumno
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

                return Ok(new { mensaje = "✅ Archivo procesado correctamente.", calificaciones });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "❌ Error interno del servidor.", error = ex.Message });
            }
        }

        //  FUNCIÓN PARA ELIMINAR ACENTOS Y CARACTERES ESPECIALES (Sin cambios)
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
