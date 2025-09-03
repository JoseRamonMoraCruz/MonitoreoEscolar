using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using MonitoreoEscolar.Server.DTOs;


namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EscuelaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EscuelaController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/escuela/crear
        [HttpPost("crear")]
        public async Task<IActionResult> CrearEscuela([FromBody] CrearEscuelaRequest request)
        {
            if (await _context.Escuelas.AnyAsync(e => e.CodigoAcceso == request.CodigoAcceso))
            {
                return BadRequest(new { mensaje = "El código ya está en uso por otra escuela." });
            }

            //  Validaciones adicionales
            if (string.IsNullOrWhiteSpace(request.CodigoAppGmail))
            {
                return BadRequest(new { mensaje = "El código de aplicación no puede estar vacío." });
            }

            if (!System.Text.RegularExpressions.Regex.IsMatch(request.CorreoNotificaciones ?? "", @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return BadRequest(new { mensaje = "Correo inválido. Verifica el formato (ej. ejemplo@dominio.com)" });
            }

            var escuela = new Escuela
            {
                Nombre = request.Nombre.Trim(),
                CodigoAcceso = request.CodigoAcceso.Trim(),
                CorreoNotificaciones = request.CorreoNotificaciones?.Trim().ToLower(),
                CodigoAppGmail = System.Text.RegularExpressions.Regex.Replace(request.CodigoAppGmail ?? "", @"\s+", "")
            };

            _context.Escuelas.Add(escuela);
            await _context.SaveChangesAsync();

            //  VINCULAR AL USUARIO QUE LA CREÓ (asumiendo que está logueado)
            var usuarioId = HttpContext.Request.Headers["Usuario-Id"].FirstOrDefault();
            if (int.TryParse(usuarioId, out var idUsuario))
            {
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id_Usuario == idUsuario);
                if (usuario != null)
                {
                    usuario.EscuelaId = escuela.Id;
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new
            {
                mensaje = "Escuela creada exitosamente.",
                escuela.Id,
                escuela.Nombre,
                escuela.CodigoAcceso,
                escuela.CorreoNotificaciones,
                escuela.CodigoAppGmail
            });
        }

        // POST: api/escuela/validar-codigo
        [HttpPost("validar-codigo")]
        public async Task<IActionResult> ValidarCodigo([FromBody] string codigo)
        {
            var escuela = await _context.Escuelas
                .FirstOrDefaultAsync(e => e.CodigoAcceso == codigo);

            if (escuela == null)
            {
                return NotFound(new { mensaje = "Código inválido o no registrado." });
            }

            // Obtener el usuario desde el encabezado "Usuario-Id"
            var usuarioIdHeader = HttpContext.Request.Headers["Usuario-Id"].FirstOrDefault();
            if (int.TryParse(usuarioIdHeader, out int usuarioId))
            {
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id_Usuario == usuarioId);
                if (usuario != null && usuario.EscuelaId == null)
                {
                    usuario.EscuelaId = escuela.Id;
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new
            {
                escuela.Id,
                escuela.Nombre
            });
        }
    }
}
