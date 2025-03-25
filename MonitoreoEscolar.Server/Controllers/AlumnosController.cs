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
                    Domicilio = request.Domicilio.Trim(),
                    TutorId = request.TutorId
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

        // 🔹 ELIMINAR ALUMNO
        [HttpDelete("eliminar/{id}")]
        public async Task<IActionResult> EliminarAlumno(int id)
        {
            var alumno = await _context.Alumnos.FindAsync(id);
            if (alumno == null) return NotFound("Alumno no encontrado.");

            _context.Alumnos.Remove(alumno);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Alumno eliminado correctamente." });
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

        // 🔹 EDITAR ALUMNO
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
                alumnoExistente.Apellidos = alumnoEditado.Apellidos.Trim();
                alumnoExistente.NombreCompleto = $"{alumnoEditado.Nombre.Trim()} {alumnoEditado.Apellidos.Trim()}";
                alumnoExistente.NombreCompletoNormalizado = RemoveDiacritics(alumnoExistente.NombreCompleto.ToLower());
                alumnoExistente.Grupo = alumnoEditado.Grupo.Trim();
                alumnoExistente.Domicilio = alumnoEditado.Domicilio.Trim();

                // Guardar cambios
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "✅ Alumno actualizado correctamente.", alumno = alumnoExistente });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error interno al editar el alumno.", error = ex.Message });
            }
        }

    }
}
