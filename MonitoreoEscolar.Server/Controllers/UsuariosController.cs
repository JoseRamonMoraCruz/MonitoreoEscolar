using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using Microsoft.AspNetCore.Identity;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using System.Security.Claims;
using MonitoreoEscolar.Server.DTOS;

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

        //  REGISTRO DE USUARIOS (normalizando nombre, apellidos y nombreAlumno)
        [HttpPost("registro")]
        public async Task<IActionResult> Registro([FromBody] Usuario request)
        {
            var usuarioExistente = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuarioExistente != null)
            {
                return BadRequest(new { mensaje = " El correo ya está registrado." });
            }

            if (request.Tipo_Usuario == "personal" && !request.Correo.EndsWith("@escuela.edu.mx"))
            {
                return BadRequest(new { mensaje = "Solo se permite el registro con correos institucionales." });
            }

            var nuevoUsuario = new Usuario
            {
                Nombre = NormalizarCadena(request.Nombre),
                Apellidos = NormalizarCadena(request.Apellidos),
                Correo = request.Correo,
                Telefono = request.Telefono,
                Tipo_Usuario = request.Tipo_Usuario
            };

            nuevoUsuario.Contrasena = _passwordHasher.HashPassword(nuevoUsuario, request.Contrasena);

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Usuario registrado exitosamente", usuario = nuevoUsuario });
        }


        //  LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuario == null)
            {
                return Unauthorized(new { mensaje = " Usuario o contraseña incorrectos" });
            }

            var resultado = _passwordHasher.VerifyHashedPassword(usuario, usuario.Contrasena, request.Contrasena);
            if (resultado != PasswordVerificationResult.Success)
            {
                return Unauthorized(new { mensaje = " Usuario o contraseña incorrectos" });
            }

            return Ok(new { mensaje = "Inicio de sesión exitoso", usuario });
        }

        //  ACTUALIZAR CONTRASEÑA (método directo)
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

        //OBTENER LISTA DE PADRES PARA RELACIONARLOS EN EL REGISTRO DEL ALUMNO
        [HttpGet("padres")]
        public async Task<IActionResult> GetPadres()
        {
            var padres = await _context.Usuarios
                .Where(u => u.Tipo_Usuario.ToLower() == "padre")
                .Select(u => new
                {
                    id_Usuario = u.Id_Usuario,
                    nombre = u.Nombre,
                    apellidos = u.Apellidos,
                    correo = u.Correo
                })
                .ToListAsync();

            return Ok(padres);
        }
        //SE BUSCA A PAPA PARA REGISTRAR A ALUMNO

        [HttpGet("autocompletePadres")]
        public async Task<IActionResult> AutocompletePadres([FromQuery] string termino)
        {
            if (string.IsNullOrWhiteSpace(termino))
            {
                return Ok(new List<object>());
            }

            // Convertir el término a minúsculas para la comparación
            var lowerTerm = termino.ToLower();

            var padres = await _context.Usuarios
                .Where(u => u.Tipo_Usuario.ToLower() == "padre" &&
                            EF.Functions.Collate((u.Nombre + " " + u.Apellidos).ToLower(), "Latin1_General_CI_AI")
                                .Contains(lowerTerm))
                .Select(u => new
                {
                    id_Usuario = u.Id_Usuario,
                    nombre = u.Nombre,
                    apellidos = u.Apellidos,
                    correo = u.Correo,
                    nombreCompleto = u.Nombre + " " + u.Apellidos
                })
                .ToListAsync();

            return Ok(padres);
        }

        // BUSCAR PADRE POR NOMBRE O APELLIDOS (sin importar acentos ni mayúsculas/minúsculas)
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

        // ACTUALIZA DATOS DE PERFIL DEL PERSONAL ESCOLAR
        [HttpPut("actualizar-perfil")]
        public async Task<IActionResult> ActualizarPerfil([FromBody] ActualizarPerfilRequest request)
        {
            if (!ModelState.IsValid)
            {
                // Devuelve todos los errores de validación
                return BadRequest(ModelState);
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id_Usuario == request.Id_Usuario);

            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado." });
            }

            // Actualizar sólo los campos permitidos
            usuario.Nombre = request.Nombre;
            usuario.Apellidos = request.Apellidos;
            usuario.Correo = request.Correo;
            usuario.Telefono = request.Telefono;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Perfil actualizado exitosamente." });
        }

        // Y ESTE OBTIENE LOS DATOS DEL USUARIO LOGEADO PARA ACTUALIZARLOS
        [HttpGet("usuario-logueado")]
        public async Task<IActionResult> ObtenerUsuarioLogueado()
        {
            // Obtén el usuario autenticado desde el contexto actual
            var usuarioId = User?.FindFirstValue(ClaimTypes.NameIdentifier); // Suponiendo que usas JWT o un sistema de autenticación basado en Claims

            if (usuarioId == null)
            {
                return Unauthorized(new { mensaje = "Usuario no autenticado." });
            }

            // Buscar al usuario en la base de datos por su ID
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id_Usuario.ToString() == usuarioId);

            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado." });
            }

            // Devolver los datos del usuario
            return Ok(new
            {
                usuario.Id_Usuario,
                usuario.Nombre,
                usuario.Apellidos,
                usuario.Correo,
                usuario.Telefono
            });
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
