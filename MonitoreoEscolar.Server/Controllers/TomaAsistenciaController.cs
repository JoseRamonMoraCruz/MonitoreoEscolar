using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.DTOs;
using MonitoreoEscolar.Server.Models;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TomaAsistenciaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TomaAsistenciaController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> RegistrarAsistencia([FromBody] RegistroAsistenciaDTO dto)
        {
            if (dto.AlumnoId <= 0)
                return BadRequest(new AsistenciaRespuestaDTO
                {
                    Mensaje = "El codigo es invalido o esta vacio.",
                    Nombre = "",
                    ApellidoPaterno = ""
                });

            var alumno = await _context.Alumnos
            .Include(a => a.TutorUsuario)
           .FirstOrDefaultAsync(a => a.Id == dto.AlumnoId);


            if (alumno == null)
                return NotFound(new AsistenciaRespuestaDTO
                {
                    Mensaje = "Alumno no encontrado.",
                    Nombre = "",
                    ApellidoPaterno = ""
                });

            var hoy = DateOnly.FromDateTime(DateTime.Now);

            var asistenciaHoy = await _context.Asistencias
                .FirstOrDefaultAsync(a => a.AlumnoId == alumno.Id && a.Fecha == hoy);

            string mensajeCorreo = "";
            string asuntoCorreo = "";
            string hora = DateTime.Now.ToString("HH:mm:ss");

            if (asistenciaHoy == null)
            {
                var nueva = new Asistencia
                {
                    AlumnoId = alumno.Id,
                    Fecha = hoy,
                    HoraEntrada = DateTime.Now
                };
                _context.Asistencias.Add(nueva);

                mensajeCorreo = $@"
                El alumno <strong>{alumno.Nombre} {alumno.ApellidoPaterno} {alumno.ApellidoMaterno}</strong> 
                de la carrera <strong>{alumno.Carrera}</strong> del grupo <strong>{alumno.Grupo}</strong> en el turno <strong>{alumno.Turno}</strong> 
                ha registrado su <strong>ENTRADA</strong> a la escuela a las <strong>{hora}</strong>.";

                asuntoCorreo = "Registro de Entrada Escolar";
            }
            else if (asistenciaHoy.HoraSalida == null)
            {
                var diferencia = DateTime.Now - asistenciaHoy.HoraEntrada!.Value;

                if (diferencia.TotalMinutes < 5) // Evita registrar salida si pasó menos de 5 minutos
                {
                    return BadRequest(new AsistenciaRespuestaDTO
                    {
                        Mensaje = "Aún no ha pasado suficiente tiempo para registrar salida.",
                        Nombre = alumno.Nombre,
                        ApellidoPaterno = alumno.ApellidoPaterno
                    });
                }

                asistenciaHoy.HoraSalida = DateTime.Now;
                _context.Asistencias.Update(asistenciaHoy);

                mensajeCorreo = $@"
                El alumno <strong>{alumno.Nombre} {alumno.ApellidoPaterno} {alumno.ApellidoMaterno}</strong> 
                de la carrera <strong>{alumno.Carrera}</strong> del grupo <strong>{alumno.Grupo}</strong> en el turno <strong>{alumno.Turno}</strong> 
                ha registrado su <strong>SALIDA</strong> de la escuela a las <strong>{hora}</strong>.";

                asuntoCorreo = "Registro de Salida Escolar";
            }

            else
            {
                return BadRequest(new AsistenciaRespuestaDTO
                {
                    Mensaje = "La asistencia ya tiene hora de entrada y salida.",
                    Nombre = alumno.Nombre,
                    ApellidoPaterno = alumno.ApellidoPaterno
                });
            }

            await _context.SaveChangesAsync();

            // Enviar correo al tutor
            if (alumno.TutorUsuario != null && !string.IsNullOrEmpty(alumno.TutorUsuario.Correo))
            {
                string nombreTutor = $"{alumno.TutorUsuario.Nombre} {alumno.TutorUsuario.ApellidoPaterno} {alumno.TutorUsuario.ApellidoMaterno}";
                await EnviarCorreoTutor(alumno.TutorUsuario.Correo, asuntoCorreo, mensajeCorreo, nombreTutor);

            }

            return Ok(new AsistenciaRespuestaDTO
            {
                Mensaje = "Asistencia registrada correctamente.",
                Nombre = alumno.Nombre,
                ApellidoPaterno = alumno.ApellidoPaterno
            });
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
                <div style='text-align: center;'>
                    <h2 style='color: #007bff; margin-bottom: 10px;'> Monitoreo Escolar</h2>
                    <p style='font-size: 15px; color: #555;'>Seguimiento en tiempo real de entradas y salidas escolares.</p>
                </div>
                <hr style='margin: 20px 0; border: none; height: 1px; background-color: #ddd;' />
                
                <p style='font-size: 16px; color: #333;'>Estimado/a {nombreTutor}</p>
                <p style='font-size: 15px; color: #444;'>{mensaje}</p>

                <p style='font-size: 14px; color: #888; margin-top: 30px;'>
                    Este correo ha sido enviado automáticamente por el sistema de monitoreo escolar.<br/>
                    Si tiene dudas, comuníquese con la escuela.
                </p>

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


        [HttpGet("hoy")]
        public async Task<IActionResult> ObtenerAsistenciasDeHoy()
        {
            var hoy = DateOnly.FromDateTime(DateTime.Now);

            var asistencias = await _context.Asistencias
                .Include(a => a.Alumno)
                .Where(a => a.Fecha == hoy)
                .ToListAsync();

            var resultado = asistencias.Select(a => new
            {
                a.Alumno.Nombre,
                a.Alumno.ApellidoPaterno,
                a.Alumno.ApellidoMaterno,
                Grupo = a.Alumno.Grupo,
                Carrera = a.Alumno.Carrera,
                Turno = a.Alumno.Turno,
                Entrada = a.HoraEntrada?.ToString("HH:mm:ss"),
                Salida = a.HoraSalida?.ToString("HH:mm:ss") ?? "--"
            }).ToList();

            return Ok(resultado);
        }
    }
}