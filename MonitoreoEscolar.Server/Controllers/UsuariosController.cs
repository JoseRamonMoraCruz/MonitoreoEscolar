using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher<Usuario> _passwordHasher = new PasswordHasher<Usuario>();

        public UsuariosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // REGISTRO DE USUARIOS
        [HttpPost("registro")]
        public async Task<IActionResult> Registro([FromBody] Usuario request)
        {
            var usuarioExistente = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuarioExistente != null)
            {
                return BadRequest(new { mensaje = "❌ El correo ya está registrado." });
            }

            var nuevoUsuario = new Usuario
            {
                Nombre = request.Nombre,
                Apellidos = request.Apellidos,
                Correo = request.Correo,
                Telefono = request.Telefono,
                Tipo_Usuario = request.Tipo_Usuario,
                NombreAlumno = request.Tipo_Usuario == "padre" ? request.NombreAlumno : null
            };

            // Hashear la contraseña antes de almacenarla
            nuevoUsuario.Contrasena = _passwordHasher.HashPassword(nuevoUsuario, request.Contrasena);

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Usuario registrado exitosamente", usuario = nuevoUsuario });
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "❌ Usuario o contraseña incorrectos" });
            }

            var resultado = _passwordHasher.VerifyHashedPassword(usuario, usuario.Contrasena, request.Contrasena);
            if (resultado != PasswordVerificationResult.Success)
            {
                return Unauthorized(new { mensaje = "❌ Usuario o contraseña incorrectos" });
            }

            return Ok(new { mensaje = "✅ Inicio de sesión exitoso", usuario });
        }

        // Endpoint para actualizar la contraseña directamente (sin token)
        [HttpPost("actualizar-password")]
        public async Task<IActionResult> ActualizarPassword([FromBody] ActualizarPasswordRequest request)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuario == null)
            {
                return BadRequest(new { mensaje = "Usuario no encontrado." });
            }

            // Hashea la nueva contraseña y actualiza el registro
            usuario.Contrasena = _passwordHasher.HashPassword(usuario, request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Contraseña actualizada exitosamente." });
        }

        // Clases auxiliares para solicitudes
        public class LoginRequest
        {
            public string Correo { get; set; }
            public string Contrasena { get; set; }
        }

        public class ActualizarPasswordRequest
        {
            public string Correo { get; set; }
            public string NewPassword { get; set; }
        }
    }
}

