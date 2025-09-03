using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.DTOs;
using MonitoreoEscolar.Server.Models;
using MailKit.Net.Smtp; // ← ESTE ES EL QUE FALTA


namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/reportes")]
    public class ReportesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("generar")]
        public async Task<IActionResult> GenerarReporte([FromBody] Reporte reporte)
        {
            if (reporte == null)
                return BadRequest(new { mensaje = "Los datos enviados son nulos." });

            // Validar que la fecha sea válida y esté en el formato correcto
            reporte.Fecha = DateTime.SpecifyKind(reporte.Fecha, DateTimeKind.Local);

            // Obtener EscuelaId desde headers
            if (!int.TryParse(Request.Headers["Escuela-Id"], out int escuelaId))
                return BadRequest("Falta el ID de la escuela en el encabezado.");

            var escuela = await _context.Escuelas.FindAsync(escuelaId);
            if (escuela == null)
                return NotFound("Escuela no encontrada para enviar correo.");


            var alumno = await _context.Alumnos
             .Include(a => a.TutorUsuario)
             .FirstOrDefaultAsync(a => a.Id == reporte.AlumnoId && a.EscuelaId == escuelaId);

            if (alumno == null)
                return NotFound(new { mensaje = "Alumno no encontrado para asignar el reporte." });

            _context.Reportes.Add(reporte);
            await _context.SaveChangesAsync();

            // Enviar correo si el tutor tiene correo registrado
            if (alumno.TutorUsuario != null && !string.IsNullOrEmpty(alumno.TutorUsuario.Correo))
            {
                string nombreTutor = $"{alumno.TutorUsuario.Nombre} {alumno.TutorUsuario.ApellidoPaterno} {alumno.TutorUsuario.ApellidoMaterno}";
                string nombreAlumno = $"{alumno.Nombre} {alumno.ApellidoPaterno} {alumno.ApellidoMaterno}";
                string mensajeCorreo = $@"
            Estimado/a <strong>{nombreTutor}</strong>,<br/><br/>
            El alumno <strong>{nombreAlumno}</strong> ha recibido un reporte disciplinario.<br/>
            Por favor, ingrese al siguiente enlace para revisar los detalles:<br/><br/>
            <a href='https://localhost:55052' target='_blank'>
                Ver reportes de su hijo(a)
            </a><br/><br/>
            <small><p style='font-size: 14px; color: #888; margin-top: 30px;'>
                        Este correo ha sido enviado automáticamente por el sistema de monitoreo escolar.<br/>
                        Si tiene dudas, comuníquese con la escuela.
                    </p>.</small>";

                string asuntoCorreo = "📢 Nuevo Reporte para su hijo(a)";

                await EnviarCorreoTutor(
                 alumno.TutorUsuario.Correo,
                 asuntoCorreo,
                 mensajeCorreo,
                 nombreTutor,
                 escuela.CorreoNotificaciones,
                 escuela.CodigoAppGmail,
                 escuela.Nombre
             );

            }

            return Ok(new
            {
                mensaje = "Reporte generado exitosamente.",
                reporte = new
                {
                    id = reporte.Id,
                    alumnoId = reporte.AlumnoId,
                    fecha = reporte.Fecha,
                    motivo = reporte.Motivo,
                    responsable = reporte.ResponsableDelReporte
                }
            });
        }


        // GET: api/reportes
        [HttpGet]
        public async Task<IActionResult> ObtenerReportes()
        {
            if (!int.TryParse(Request.Headers["Escuela-Id"], out int escuelaId))
                return BadRequest("Falta el ID de la escuela en el encabezado.");

            var list = await _context.Reportes
                .Include(r => r.Alumno)
                .Where(r => r.Alumno.EscuelaId == escuelaId)
                .ToListAsync();

            var dto = list.Select(r => new {
                id = r.Id,
                alumnoId = r.AlumnoId,
                nombreCompleto = r.Alumno.Nombre + " " + r.Alumno.ApellidoPaterno + " " + r.Alumno.ApellidoMaterno,
                fecha = r.Fecha,
                motivo = r.Motivo,
                responsable = r.ResponsableDelReporte
            });
            return Ok(dto);
        }

        // DELETE: api/reportes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarReporte(int id)
        {
            var rep = await _context.Reportes.FindAsync(id);
            if (rep == null) return NotFound(new { mensaje = "Reporte no encontrado." });

            _context.Reportes.Remove(rep);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Reporte eliminado exitosamente." });
        }

        // PUT: api/reportes/{id}

        [HttpPut("{id}")]
        public async Task<IActionResult> EditarReporte(int id, [FromBody] EditarReporteDTO request)
        {
            var rep = await _context.Reportes.FindAsync(id);
            if (rep == null)
                return NotFound(new { mensaje = "Reporte no encontrado." });

            rep.Fecha = request.Fecha;
            rep.Motivo = request.Motivo;

            await _context.SaveChangesAsync();

            var alumno = await _context.Alumnos.FindAsync(rep.AlumnoId);

            var reporteEditado = new
            {
                id = rep.Id,
                alumnoId = rep.AlumnoId,
                nombreCompleto = alumno != null ? alumno.Nombre + " " + alumno.ApellidoPaterno + " " + alumno.ApellidoMaterno : "",
                fecha = rep.Fecha,
                motivo = rep.Motivo,
                responsable = rep.ResponsableDelReporte
            };

            return Ok(new { mensaje = "Reporte actualizado exitosamente.", reporte = reporteEditado });

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
                    <div style='text-align: center;'>
                        <h2 style='color: #007bff; margin-bottom: 10px;'>Monitoreo Escolar</h2>
                        <p style='font-size: 15px; color: #555;'>Reporte disciplinario generado.</p>
                    </div>
                    <hr style='margin: 20px 0; border: none; height: 1px; background-color: #ddd;' />
                    <p style='font-size: 15px; color: #444;'>{mensaje}</p>
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

    }
}