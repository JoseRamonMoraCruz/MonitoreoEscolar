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

        // Función para normalizar una cadena: quita espacios al inicio/final y reemplaza múltiples espacios por uno solo.
        private string NormalizarCadena(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;
            return Regex.Replace(input.Trim(), @"\s+", " ");
        }

        // Función para normalizar texto: elimina acentos, convierte a minúsculas y normaliza espacios.
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
            // Normalizamos espacios y convertimos a minúsculas.
            return Regex.Replace(stringBuilder.ToString().Trim().ToLower(), @"\s+", " ");
        }

        // 🔹 REGISTRO DE USUARIOS (normalizando nombre, apellidos y nombreAlumno)
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
                Nombre = NormalizarCadena(request.Nombre),
                Apellidos = NormalizarCadena(request.Apellidos),
                Correo = request.Correo,
                Telefono = request.Telefono,
                Tipo_Usuario = request.Tipo_Usuario,
                NombreAlumno = request.Tipo_Usuario == "padre" ? NormalizarCadena(request.NombreAlumno) : null
            };

            // Hashear la contraseña antes de almacenarla
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

        // 🔹 ACTUALIZAR CONTRASEÑA (método directo)
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

        // 🔹 BUSCAR PADRE POR NOMBRE O APELLIDOS (sin importar acentos ni mayúsculas/minúsculas)
        [HttpGet("buscarPadre")]
        public async Task<IActionResult> BuscarPadre([FromQuery] string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return BadRequest(new { mensaje = "El nombre no puede estar vacío." });
            }

            // Normalizar el término de búsqueda
            var searchTerm = NormalizarTexto(nombre);

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

            // Filtrar en memoria usando la normalización de texto
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
