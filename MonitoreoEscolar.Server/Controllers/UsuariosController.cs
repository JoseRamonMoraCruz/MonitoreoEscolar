using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using System.Threading.Tasks;

namespace MonitoreoEscolar.Server.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsuariosController(ApplicationDbContext context)
        {
            _context = context;
        }

        //  REGISTRO DE USUARIOS
        [HttpPost("registro")]
        public async Task<IActionResult> Registro([FromBody] Usuario request)
        {
            // Verificar si el correo ya está registrado
            var usuarioExistente = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuarioExistente != null)
            {
                return BadRequest(new { mensaje = "❌ El correo ya está registrado." });
            }

            // Crear el nuevo usuario
            var nuevoUsuario = new Usuario
            {
                Nombre = request.Nombre,
                Apellidos = request.Apellidos,
                Contrasena = request.Contrasena, // 📌 Aquí se debe encriptar en el futuro
                Correo = request.Correo,
                Telefono = request.Telefono,
                Tipo_Usuario = request.Tipo_Usuario
            };

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Usuario registrado exitosamente", usuario = nuevoUsuario });
        }

        //LOGIN    

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == request.Correo && u.Contrasena == request.Contrasena);

            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "❌ Usuario o contraseña incorrectos" });
            }

            return Ok(new { mensaje = "✅ Inicio de sesión exitoso", usuario });
        }
    }

    public class LoginRequest
    {
        public string Correo { get; set; }
        public string Contrasena { get; set; }
    }
}
