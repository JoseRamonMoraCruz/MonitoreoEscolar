using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using System.Globalization;
using System.Text;
using QRCoder;

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

        // REGISTRAR ALUMNO 
        [HttpPost("registro")]
        public async Task<IActionResult> RegistrarAlumno([FromBody] Alumno request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { mensaje = "Los datos enviados son nulos." });

                if (string.IsNullOrWhiteSpace(request.Nombre) || string.IsNullOrWhiteSpace(request.ApellidoPaterno) || string.IsNullOrWhiteSpace(request.ApellidoMaterno))
                    return BadRequest(new { mensaje = "El Nombre y los dos Apellidos son obligatorios." });

                if (string.IsNullOrWhiteSpace(request.CURP))
                    return BadRequest(new { mensaje = "La CURP es obligatoria para generar el código QR." });

                var codigoQR = request.CURP.Trim().ToUpper();

                // Validar si ya existe ese Código QR
                var existeQr = await _context.Alumnos.AnyAsync(a => a.CodigoQR == codigoQR);
                if (existeQr)
                    return BadRequest(new { mensaje = "Ya existe un alumno con esa CURP asignada como código QR." });

                var nombreCompleto = $"{request.Nombre.Trim()} {request.ApellidoPaterno.Trim()} {request.ApellidoMaterno.Trim()}".Trim();
                var nombreNormalizado = RemoveDiacritics(nombreCompleto.ToLower());

                var alumno = new Alumno
                {
                    //Datos alumno
                    Nombre = request.Nombre.Trim(),
                    ApellidoPaterno = request.ApellidoPaterno.Trim(),
                    ApellidoMaterno = request.ApellidoMaterno.Trim(),
                    NombreCompleto = nombreCompleto,
                    NombreCompletoNormalizado = nombreNormalizado,
                    Grupo = request.Grupo.Trim(),
                    Domicilio = request.Domicilio.Trim(),
                    TutorId = request.TutorId,
                    CURP = codigoQR,
                    NumeroControl = request.NumeroControl?.Trim(),
                    Carrera = request.Carrera?.Trim(),
                    Plantel = request.Plantel?.Trim(),
                    Turno = request.Turno?.Trim(),
                    Generacion = request.Generacion?.Trim(),
                    Ciclo = request.Ciclo?.Trim(),
                    CodigoQR = codigoQR
                };

                _context.Alumnos.Add(alumno);
                await _context.SaveChangesAsync();

                Console.WriteLine("CÓDIGO QR GENERADO: " + codigoQR);

                return Ok(new { mensaje = "Alumno registrado exitosamente", alumno });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno del servidor.", error = ex.Message });
            }
        }

        // ESTE LO QUE HACE ES GENERAR UN QR CON EL CODIGO QR DEL ALUMNO
        [HttpGet("qr/{alumnoId}")]
        public async Task<IActionResult> ObtenerQRAlumno(int alumnoId)
        {
            var alumno = await _context.Alumnos.FindAsync(alumnoId);
            if (alumno == null || string.IsNullOrEmpty(alumno.CodigoQR))
                return NotFound("Alumno no encontrado o sin código QR asignado.");

            using var qrGenerator = new QRCodeGenerator();
            var qrData = qrGenerator.CreateQrCode(alumno.CodigoQR, QRCodeGenerator.ECCLevel.Q);

            var pngQrCode = new PngByteQRCode(qrData);
            byte[] qrCodeAsPng = pngQrCode.GetGraphic(20);

            return File(qrCodeAsPng, "image/png");
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> BuscarAlumnos([FromQuery] string termino)
        {
            if (string.IsNullOrWhiteSpace(termino))
                return BadRequest(new { mensaje = "El término de búsqueda no puede estar vacío." });

            var lowerTerm = termino.Trim().ToLower();

            var alumnos = await _context.Alumnos
                .Where(a =>
                    a.NombreCompleto.ToLower().Contains(lowerTerm)
                    // Si Carrera es null se convierte en cadena vacía antes de ToLower()
                    || (a.Carrera ?? string.Empty).ToLower().Contains(lowerTerm)
                )
                .Select(a => new {
                    a.Id,
                    a.NombreCompleto,
                    a.Carrera
                })
                .ToListAsync();

            return Ok(alumnos);
        }

        //  OBTENER ALUMNOS DE UN GRUPO ESPECÍFICO (Sin cambios)
        [HttpGet("grupo/{grupoStr}")]
        public async Task<IActionResult> ObtenerAlumnosPorGrupo(string grupoStr)
        {
            try
            {
                var alumnos = await _context.Alumnos
                    .Include(a => a.TutorUsuario)
                    .Where(a => a.Grupo == grupoStr)
                    .OrderBy(a => a.NombreCompleto)
                    .Select(a => new
                    {
                        id = a.Id,
                        nombre = a.Nombre,
                        apellidoPaterno = a.ApellidoPaterno,
                        apellidoMaterno = a.ApellidoMaterno,
                        domicilio = a.Domicilio,
                        grupo = a.Grupo,
                        carrera = a.Carrera,
                        numeroControl = a.NumeroControl,
                        curp = a.CURP,
                        turno = a.Turno,
                        generacion = a.Generacion,
                        ciclo = a.Ciclo,
                        tutorUsuario = a.TutorUsuario == null ? null : new
                        {
                            id_Usuario = a.TutorUsuario.Id_Usuario,
                            nombre = a.TutorUsuario.Nombre,
                            apellidopaterno = a.TutorUsuario.ApellidoPaterno,
                            apellidomaterno = a.TutorUsuario.ApellidoMaterno,
                            telefono = a.TutorUsuario.Telefono,
                            correo = a.TutorUsuario.Correo
                        }
                    })
                    .ToListAsync();

                return Ok(alumnos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al obtener alumnos por grupo.", error = ex.Message });
            }
        }

        //  ELIMINAR ALUMNO
        [HttpDelete("eliminar/{id}")]
        public async Task<IActionResult> EliminarAlumno(int id)
        {
            var alumno = await _context.Alumnos.FindAsync(id);
            if (alumno == null) return NotFound("Alumno no encontrado.");

            _context.Alumnos.Remove(alumno);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Alumno eliminado correctamente." });
        }


        // FUNCIÓN PARA ELIMINAR ACENTOS Y CARACTERES ESPECIALES
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

        // EDITAR ALUMNO
        [HttpPut("editar/{id}")]
        public async Task<IActionResult> EditarAlumno(int id, [FromBody] Alumno alumnoEditado)
        {
            try
            {
                var alumnoExistente = await _context.Alumnos.FindAsync(id);

                if (alumnoExistente == null)
                    return NotFound(new { mensaje = "Alumno no encontrado." });

                // Actualizando datos del alumno
                alumnoExistente.Nombre = alumnoEditado.Nombre.Trim();
                alumnoExistente.ApellidoPaterno = alumnoEditado.ApellidoPaterno.Trim();
                alumnoExistente.ApellidoMaterno = alumnoEditado.ApellidoMaterno.Trim();
                alumnoExistente.NombreCompleto = $"{alumnoEditado.Nombre.Trim()} {alumnoEditado.ApellidoPaterno.Trim()} {alumnoEditado.ApellidoMaterno.Trim()}";
                alumnoExistente.NombreCompletoNormalizado = RemoveDiacritics(alumnoExistente.NombreCompleto.ToLower());
                alumnoExistente.Grupo = alumnoEditado.Grupo.Trim();
                alumnoExistente.Domicilio = alumnoEditado.Domicilio.Trim();
                alumnoExistente.CURP = alumnoEditado.CURP.Trim().ToUpper();
                alumnoExistente.NumeroControl = alumnoEditado.NumeroControl?.Trim();
                alumnoExistente.Carrera = alumnoEditado.Carrera?.Trim();
                alumnoExistente.Turno = alumnoEditado.Turno?.Trim();
                alumnoExistente.Generacion = alumnoEditado.Generacion?.Trim();
                alumnoExistente.Ciclo = alumnoEditado.Ciclo?.Trim();

                // Actualiza el TutorId solo si se proporciona un nuevo valor (no es null)
                if (alumnoEditado.TutorId != null)
                {
                    alumnoExistente.TutorId = alumnoEditado.TutorId;
                }

                // Guardar cambios
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "Alumno actualizado correctamente.", alumno = alumnoExistente });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al editar el alumno.", error = ex.Message });
            }
        }
    }
}