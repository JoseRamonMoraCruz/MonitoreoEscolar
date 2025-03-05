using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

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
        }

        //  Función para normalizar texto (quita acentos y convierte a minúsculas)
        private string NormalizarTexto(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";
            var normalizedString = input.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();
            foreach (var c in normalizedString)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }
            return Regex.Replace(stringBuilder.ToString().Trim().ToLower(), @"\s+", " ");
        }

        //  REGISTRAR ALUMNO
        [HttpPost("registro")]
        public async Task<IActionResult> RegistrarAlumno([FromBody] Alumno request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { mensaje = "❌ Los datos enviados son nulos." });

                if (string.IsNullOrWhiteSpace(request.Nombre) || string.IsNullOrWhiteSpace(request.Apellidos))
                    return BadRequest(new { mensaje = "❌ Nombre y Apellidos son obligatorios." });

                // 🔹 Generar NombreCompleto y NombreCompletoNormalizado automáticamente
                var nombreCompleto = $"{request.Nombre.Trim()} {request.Apellidos.Trim()}";
                var nombreNormalizado = NormalizarTexto(nombreCompleto);

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
    }
}