using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using OfficeOpenXml;
using MailKit.Net.Smtp;


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

        //  ENDPOINT 1: SUBIR CALIFICACIONES DESDE EXCEL
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

                // Diccionarios con nombres normalizados en MAYÚSCULAS
                var alumnosDict = await _context.Alumnos
                 .Include(a => a.TutorUsuario)
                 .ToDictionaryAsync(a => Normalizar(a.NombreCompletoNormalizado));


                var gruposDict = await _context.Grupos
                    .ToDictionaryAsync(g => $"{g.Grado}{g.Letra}".ToUpper());

                var calificacionesGuardadas = new List<Calificacion>();

                for (int row = 2; row <= rowCount; row++)
                {
                    //  Leer datos desde el Excel
                    string nombreOriginal = $"{worksheet.Cells[row, 9].Text.Trim()} {worksheet.Cells[row, 10].Text.Trim()} {worksheet.Cells[row, 11].Text.Trim()}";
                    string nombreNormalizado = Normalizar(nombreOriginal);

                    string grupoStr = worksheet.Cells[row, 7].Text.Trim().ToUpper();
                    string asignatura = Normalizar(worksheet.Cells[row, 13].Text.Trim());

                    int.TryParse(worksheet.Cells[row, 14].Text, out int parcial1);
                    int.TryParse(worksheet.Cells[row, 15].Text, out int parcial2);
                    int.TryParse(worksheet.Cells[row, 16].Text, out int parcial3);
                    int.TryParse(worksheet.Cells[row, 17].Text, out int califFinal);

                    string periodo = worksheet.Cells[row, 18].Text.Trim();
                    string firmadoTexto = worksheet.Cells[row, 19].Text.Trim();
                    bool firmado = firmadoTexto.Equals("Sí", StringComparison.OrdinalIgnoreCase) || firmadoTexto.ToUpper().Contains("FIRMADO");

                    int.TryParse(worksheet.Cells[row, 24].Text, out int asistenciasTotal);
                    string tipo = worksheet.Cells[row, 25].Text.Trim();

                    //  Validación contra BD
                    if (!alumnosDict.TryGetValue(nombreNormalizado, out var alumno))
                    {
                        _logger.LogWarning("Alumno no encontrado: {0}", nombreNormalizado);
                        continue;
                    }

                    if (!gruposDict.TryGetValue(grupoStr.ToUpper(), out var grupo))
                    {
                        _logger.LogWarning("Grupo no encontrado: {0}", grupoStr);
                        continue;
                    }

                    string parcialTexto = worksheet.Cells[row, 22].Text.Trim(); // Asegúrate que columna 22 sea PARCIAL
                                                                              
                    if (parcial1 > 0)
                    {
                        await ProcesarParcial(alumno, grupo, asignatura, parcial1, "Parcial 1", periodo, firmado, asistenciasTotal, tipo, calificacionesGuardadas, nombreOriginal);
                    }

                    // Procesar Parcial 2
                    if (parcial2 > 0)
                    {
                        await ProcesarParcial(alumno, grupo, asignatura, parcial2, "Parcial 2", periodo, firmado, asistenciasTotal, tipo, calificacionesGuardadas, nombreOriginal);
                    }

                    // Procesar Parcial 3
                    if (parcial3 > 0)
                    {
                        await ProcesarParcial(alumno, grupo, asignatura, parcial3, "Parcial 3", periodo, firmado, asistenciasTotal, tipo, calificacionesGuardadas, nombreOriginal);
                    }


                    if (alumno.TutorUsuario != null && !string.IsNullOrEmpty(alumno.TutorUsuario.Correo))
                    {
                        string nombreTutor = $"{alumno.TutorUsuario.Nombre} {alumno.TutorUsuario.ApellidoPaterno} {alumno.TutorUsuario.ApellidoMaterno}";
                        string asunto = "📊 Nuevas calificaciones disponibles";
                        string mensajeCorreo = $@"
                            Se han registrado nuevas calificaciones para su hijo(a) <strong>{alumno.Nombre} {alumno.ApellidoPaterno} {alumno.ApellidoMaterno}</strong> 
                            del grupo <strong>{grupo.Grado}{grupo.Letra}</strong>.<br/>
                            Ingrese al sistema para ver los detalles.";

                        await EnviarCorreoTutor(alumno.TutorUsuario.Correo, asunto, mensajeCorreo, nombreTutor);
                    }
                }

                _context.Calificaciones.AddRange(calificacionesGuardadas);
                await _context.SaveChangesAsync();

                if (calificacionesGuardadas.Count == 0)
                    return BadRequest("No se subió ninguna calificación. Revisa duplicados o formato.");

                return Ok(new
                {
                    mensaje = $"✅ Calificaciones cargadas correctamente. Total: {calificacionesGuardadas.Count}",
                    cantidad = calificacionesGuardadas.Count,
                    calificaciones = calificacionesGuardadas
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir calificaciones");
                return StatusCode(500, $"Error interno: {ex.Message} {ex.InnerException?.Message}");
            }
        }



        //  ENDPOINT 2: RESUMEN DE CALIFICACIONES
        [HttpGet("obtenerCalificaciones")]
        public async Task<IActionResult> ObtenerCalificacionesResumen()
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Grupo)
                .ToListAsync();

            var resumen = calificaciones
                .GroupBy(c => new
                {
                    c.Nombre,
                    GrupoStr = $"{c.Grupo.Grado}{c.Grupo.Letra}",
                    c.ParcialUnidad,
                    c.Periodo,
                    c.Tipo,
                    c.Firmado,
                    c.AsistenciasTotal
                })
                .Select(grupo =>
                {
                    var datosAlumno = new Dictionary<string, object>
                    {
                        ["alumno"] = grupo.Key.Nombre,
                        ["grupo"] = grupo.Key.GrupoStr,
                        ["parcialUnidad"] = grupo.Key.ParcialUnidad,
                        ["periodo"] = grupo.Key.Periodo,
                        ["tipo"] = grupo.Key.Tipo,
                        ["firmado"] = grupo.Key.Firmado,
                        ["asistenciasTotal"] = grupo.Key.AsistenciasTotal
                    };

                    foreach (var calificacion in grupo)
                    {
                        datosAlumno[calificacion.NombreAsignatura] = calificacion.CalificacionValor;
                    }

                    return datosAlumno;
                });

            return Ok(resumen);
        }

        //  ENDPOINT 3: RESUMEN AGRUPADO POR ALUMNO
        [HttpGet("obtenerResumenAgrupado")]
        public async Task<IActionResult> ObtenerResumenAgrupado()
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Grupo)
                .Include(c => c.Alumno)
                .ToListAsync();

            var resumen = calificaciones
                .GroupBy(c => new
                {
                    NombreCompleto = c.Alumno.NombreCompleto,
                    Grupo = $"{c.Grupo.Grado}{c.Grupo.Letra}",
                    c.ParcialUnidad
                })
                .Select(grupo =>
                {
                    var primera = grupo.First();

                    var resultado = new Dictionary<string, object>
                    {
                        ["alumno"] = grupo.Key.NombreCompleto,
                        ["grupo"] = grupo.Key.Grupo,
                        ["parcialUnidad"] = grupo.Key.ParcialUnidad,
                        ["periodo"] = primera.Periodo,
                        ["tipo"] = primera.Tipo,
                        ["firmado"] = primera.Firmado,
                        ["asistenciasTotal"] = primera.AsistenciasTotal ?? 0
                    };

                    foreach (var calif in grupo)
                    {
                        resultado[calif.NombreAsignatura] = calif.CalificacionValor;
                    }

                    return resultado;
                })
                .ToList();

            return Ok(resumen);
        }

        //  NORMALIZAR SIN ACENTOS Y EN MAYÚSCULAS
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

            return System.Text.RegularExpressions.Regex.Replace(sb.ToString().ToUpper(), @"\s+", " ").Trim();
        }
        private async Task EnviarCorreoTutor(string correoDestino, string asunto, string mensaje, string nombreTutor)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("Monitoreo Escolar", "serviciosmonitoreoescolar@gmail.com"));
            email.To.Add(MailboxAddress.Parse(correoDestino));
            email.Subject = asunto;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <div style='font-family: Segoe UI, sans-serif; padding: 20px; background-color: #eef2f7;'>
                    <div style='max-width: 600px; margin: auto; background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);'>
                        <h2 style='color: #007bff;'>Nuevo registro de calificaciones</h2>
                        <p style='font-size: 15px;'>Estimado/a <strong>{nombreTutor}</strong>,</p>
                        <p style='font-size: 15px; color: #444;'>{mensaje}</p>
                        <p><a href='https://localhost:55052' target='_blank'>Ver calificaciones</a></p>
                        <p style='color: #888;'>Este mensaje ha sido generado automáticamente. Por favor, no responda este correo.</p>
                        <p style='text-align: center; font-size: 13px; color: #aaa;'>© {DateTime.Now.Year} Monitoreo Escolar</p>
                    </div>
                </div>"
            };

            email.Body = bodyBuilder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync("serviciosmonitoreoescolar@gmail.com", "dxzarzmqarilrlbz"); 
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        private async Task ProcesarParcial(
     Alumno alumno,
     Grupo grupo,
     string asignatura,
     int calificacion,
     string parcialUnidad,
     string periodo,
     bool firmado,
     int asistencias,
     string tipo,
     List<Calificacion> listaGuardar,
     string nombreOriginal)
        {
            var calificacionExistente = await _context.Calificaciones.FirstOrDefaultAsync(c =>
                c.AlumnoId == alumno.Id &&
                c.NombreAsignatura == asignatura &&
                c.GrupoId == grupo.Id &&
                c.ParcialUnidad == parcialUnidad
            );

            if (calificacionExistente != null)
            {
                // Actualizar la calificación existente
                calificacionExistente.CalificacionValor = calificacion;
                calificacionExistente.Periodo = periodo;
                calificacionExistente.Firmado = firmado;
                calificacionExistente.AsistenciasTotal = asistencias;
                calificacionExistente.Tipo = tipo;

                // Actualizar el campo correspondiente al parcial
                if (parcialUnidad == "Parcial 1")
                    calificacionExistente.Parcial1 = calificacion;
                else if (parcialUnidad == "Parcial 2")
                    calificacionExistente.Parcial2 = calificacion;
                else if (parcialUnidad == "Parcial 3")
                    calificacionExistente.Parcial3 = calificacion;

                _context.Calificaciones.Update(calificacionExistente);
            }
            else
            {
                // Crear una nueva calificación
                var nueva = new Calificacion
                {
                    Nombre = nombreOriginal,
                    NombreAsignatura = asignatura,
                    ParcialUnidad = parcialUnidad,
                    CalificacionValor = calificacion,
                    Periodo = periodo,
                    Firmado = firmado,
                    AsistenciasTotal = asistencias,
                    Tipo = tipo,
                    GrupoId = grupo.Id,
                    AlumnoId = alumno.Id,
                    Parcial1 = parcialUnidad == "Parcial 1" ? calificacion : null,
                    Parcial2 = parcialUnidad == "Parcial 2" ? calificacion : null,
                    Parcial3 = parcialUnidad == "Parcial 3" ? calificacion : null
                };

                listaGuardar.Add(nueva);
            }
        }
    }
}
