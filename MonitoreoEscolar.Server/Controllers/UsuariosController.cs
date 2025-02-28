using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using Microsoft.AspNetCore.Identity;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

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
        // Función para normalizar una cadena: quita espacios al inicio y final y reemplaza múltiples espacios por uno solo.
        private string NormalizarCadena(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;
            // Primero recorta y luego reemplaza secuencias de espacios con un solo espacio
            return Regex.Replace(input.Trim(), @"\s+", " ");
        }

        // 🔹 REGISTRO DE USUARIOS
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

            // 🔹 Hashear la contraseña antes de almacenarla
            nuevoUsuario.Contrasena = _passwordHasher.HashPassword(nuevoUsuario, request.Contrasena);

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Usuario registrado exitosamente", usuario = nuevoUsuario });
        }

        // 🔹 LOGIN
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

        // 🔹 ACTUALIZAR CONTRASEÑA
        [HttpPost("actualizar-password")]
        public async Task<IActionResult> ActualizarPassword([FromBody] ActualizarPasswordRequest request)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuario == null)
            {
                return BadRequest(new { mensaje = "Usuario no encontrado." });
            }

            usuario.Contrasena = _passwordHasher.HashPassword(usuario, request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Contraseña actualizada exitosamente." });
        }

        // 🔹 NORMALIZACIÓN DE TEXTO (Eliminar tildes y convertir a minúsculas)
        private string NormalizarTexto(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";

            return string.Concat(input.Normalize(NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark))
                .ToLower();
        }

        // 🔹 BUSCAR PADRE POR NOMBRE O APELLIDOS (Sin importar acentos ni mayúsculas/minúsculas)
        [HttpGet("buscarPadre")]
        public async Task<IActionResult> BuscarPadre([FromQuery] string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return BadRequest(new { mensaje = "El nombre no puede estar vacío." });
            }

            // Normalizar el término de búsqueda
            var searchTerm = NormalizarTexto(nombre.Trim());

            var padres = await _context.Usuarios
                .Where(u => u.Tipo_Usuario == "padre")
                .Select(u => new
                {
                    Nombre = u.Nombre,
                    Apellidos = u.Apellidos,
                    Telefono = u.Telefono,
                    NombreCompleto = u.Nombre + " " + u.Apellidos
                })
                .ToListAsync();

            // Aplicar normalización y filtrado en memoria
            var resultados = padres.Where(u =>
                NormalizarTexto(u.Nombre).Contains(searchTerm) ||
                NormalizarTexto(u.Apellidos).Contains(searchTerm) ||
                NormalizarTexto(u.NombreCompleto).Contains(searchTerm)
            ).ToList();

            if (!resultados.Any())
                return NotFound(new { mensaje = "No se encontraron padres con ese nombre." });

            return Ok(resultados);
        }
    }

    // 📌 Clases auxiliares para solicitudes
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
