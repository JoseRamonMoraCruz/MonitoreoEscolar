using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
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

            if (_context == null)
            {
                Console.WriteLine("❌ ERROR: _context es NULL");
            }
            else
            {
                Console.WriteLine("✔ _context CARGADO correctamente");
            }
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

                // 🔹 Generar Nombre Completo y su versión normalizada
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

        // 🔹 OBTENER TODOS LOS ALUMNOS
        [HttpGet]
        public async Task<IActionResult> ObtenerAlumnos()
        {
            try
            {
                var alumnos = await _context.Alumnos
                    .OrderBy(a => a.NombreCompleto)
                    .ToListAsync();

                return Ok(alumnos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "❌ Error al obtener alumnos.", error = ex.Message });
            }
        }

        // 🔹 EDITAR ALUMNO (ACTUALIZA TODOS LOS CAMPOS)
        [HttpPut("editar/{id}")]
        public async Task<IActionResult> EditarAlumno(int id, [FromBody] Alumno request)
        {
            var alumno = await _context.Alumnos.FindAsync(id);
            if (alumno == null) return NotFound("Alumno no encontrado.");

            // 🔹 Actualizar los datos individuales
            alumno.Nombre = request.Nombre.Trim();
            alumno.Apellidos = request.Apellidos.Trim();
            alumno.Grupo = request.Grupo.Trim();
            alumno.Tutor = request.Tutor.Trim();
            alumno.Domicilio = request.Domicilio.Trim();

            // 🔹 FORZAR ACTUALIZACIÓN en todas las columnas dependientes
            alumno.NombreCompleto = $"{alumno.Nombre} {alumno.Apellidos}".Trim();
            alumno.NombreCompletoNormalizado = RemoveDiacritics(alumno.NombreCompleto.ToLower());

            // 🔹 Guardar cambios en la base de datos
            _context.Entry(alumno).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Alumno actualizado correctamente." });
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
    }
}
