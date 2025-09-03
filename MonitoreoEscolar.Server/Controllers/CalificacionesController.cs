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
                if (!int.TryParse(Request.Headers["Escuela-Id"], out int escuelaId))
                    return BadRequest("Falta el ID de la escuela en el encabezado.");

                var escuela = await _context.Escuelas.FindAsync(escuelaId);
                if (escuela == null)
                    return NotFound("Escuela no encontrada para enviar correos.");

                using var stream = new MemoryStream();
                var correosPendientes = new List<(string correo, string asunto, string mensaje, string nombreTutor)>();
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

                int calificacionesActualizadas = 0;

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
                        if (await ProcesarParcial(alumno, grupo, asignatura, parcial1, "Parcial 1", periodo, firmado, asistenciasTotal, tipo, calificacionesGuardadas, nombreOriginal))
                        {
                            calificacionesActualizadas++;
                        }
                    }

                    // Procesar Parcial 2
                    if (parcial2 > 0)
                    {
                        if (await ProcesarParcial(alumno, grupo, asignatura, parcial2, "Parcial 2", periodo, firmado, asistenciasTotal, tipo, calificacionesGuardadas, nombreOriginal))
                        {
                            calificacionesActualizadas++;
                        }
                    }


                    // Procesar Parcial 3
                    if (parcial3 > 0)
                        if (parcial3 > 0)
                        {
                            if (await ProcesarParcial(alumno, grupo, asignatura, parcial3, "Parcial 3", periodo, firmado, asistenciasTotal, tipo, calificacionesGuardadas, nombreOriginal))
                            {
                                calificacionesActualizadas++;
                            }
                        }



                    if (alumno.TutorUsuario != null && !string.IsNullOrEmpty(alumno.TutorUsuario.Correo))
                    {
                        string nombreTutor = $"{alumno.TutorUsuario.Nombre} {alumno.TutorUsuario.ApellidoPaterno} {alumno.TutorUsuario.ApellidoMaterno}";
                        string asunto = "📊 Nuevas calificaciones disponibles";
                        string mensajeCorreo = $@"
                            Se han registrado nuevas calificaciones para su hijo(a) <strong>{alumno.Nombre} {alumno.ApellidoPaterno} {alumno.ApellidoMaterno}</strong> 
                            del grupo <strong>{grupo.Grado}{grupo.Letra}</strong>.<br/>
                            Ingrese al sistema para ver los detalles.";

                        correosPendientes.Add((alumno.TutorUsuario.Correo, asunto, mensajeCorreo, nombreTutor));
                    }
                }

                _context.Calificaciones.AddRange(calificacionesGuardadas);
                await _context.SaveChangesAsync();

                // Validación antes de responder
                int totalExitosas = calificacionesGuardadas.Count + calificacionesActualizadas;

                if (totalExitosas == 0)
                    return BadRequest("No se subió ninguna calificación. Revisa duplicados o formato.");


                // Envío de correos en segundo plano (no bloquea la respuesta)
                _ = Task.Run(async () =>
                {
                    foreach (var (correo, asunto, mensaje, nombreTutor) in correosPendientes)
                    {
                        try
                        {
                            await EnviarCorreoTutor(correo, asunto, mensaje, nombreTutor, escuela.CorreoNotificaciones, escuela.CodigoAppGmail, escuela.Nombre);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning($"Error al enviar correo a {correo}: {ex.Message}");
                        }
                    }
                });

                int totalIntentos = rowCount - 1;
                int omitidas = totalIntentos - calificacionesGuardadas.Count;

                return Ok(new
                {
                    mensaje = $" Se guardaron {calificacionesGuardadas.Count} nuevas y se actualizaron {calificacionesActualizadas}. Se omitieron {omitidas} por estar duplicadas o tener errores.",
                    cantidad = totalExitosas,
                    omitidas,
                    totalIntentos
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir calificaciones");
                return StatusCode(500, $"Error interno: {ex.Message} {ex.InnerException?.Message}");
            }
        } // ← ESTA es la llave final que cierra el método SubirCalificaciones

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
                    Grupo = $"{c.Grupo.Grado}{c.Grupo.Letra}"
                })
                .Select(grupo =>
                {
                    var primera = grupo.First();

                    var resultado = new Dictionary<string, object>
                    {
                        ["alumno"] = grupo.Key.NombreCompleto,
                        ["grupo"] = grupo.Key.Grupo,
                        ["periodo"] = primera.Periodo,
                        ["tipo"] = primera.Tipo,
                        ["firmado"] = primera.Firmado,
                        ["asistenciasTotal"] = primera.AsistenciasTotal ?? 0
                    };

                    foreach (var calif in grupo)
                    {
                        resultado[$"{calif.NombreAsignatura}_P1"] = calif.Parcial1?.ToString() ?? "N/A";
                        resultado[$"{calif.NombreAsignatura}_P2"] = calif.Parcial2?.ToString() ?? "N/A";
                        resultado[$"{calif.NombreAsignatura}_P3"] = calif.Parcial3?.ToString() ?? "N/A";
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
        private async Task EnviarCorreoTutor(
             string correoDestino,
             string asunto,
             string mensaje,
             string nombreTutor,
             string remitenteCorreo,
             string claveApp,
             string nombreEscuela)

        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(nombreEscuela, remitenteCorreo));
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
            await smtp.AuthenticateAsync(remitenteCorreo, claveApp);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        private async Task<bool> ProcesarParcial(
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
                c.GrupoId == grupo.Id
            );

            if (calificacionExistente != null)
            {
                // Actualiza solo el parcial correspondiente
                if (parcialUnidad == "Parcial 1")
                    calificacionExistente.Parcial1 = calificacion;
                else if (parcialUnidad == "Parcial 2")
                    calificacionExistente.Parcial2 = calificacion;
                else if (parcialUnidad == "Parcial 3")
                    calificacionExistente.Parcial3 = calificacion;

                // Actualiza otros datos generales
                calificacionExistente.CalificacionValor = calificacion;
                calificacionExistente.Periodo = periodo;
                calificacionExistente.Firmado = firmado;
                calificacionExistente.AsistenciasTotal = asistencias;
                calificacionExistente.Tipo = tipo;

                _context.Calificaciones.Update(calificacionExistente);
                return true; // ✅ Se actualizó una calificación
            }
            else
            {
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
                return true; // ✅ Se agregó una nueva calificación
            }

            // Si no se hizo nada (opcional)
            return false;
        }

}
}