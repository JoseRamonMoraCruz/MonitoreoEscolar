using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.Models;
using Microsoft.AspNetCore.Identity;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using MonitoreoEscolar.Server.DTOs;
using MimeKit;
using MailKit.Net.Smtp;
using System.Security.Claims;


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
        public async Task<IActionResult> Registro([FromBody] RegistroRequest request)
        {
            var usuarioExistente = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuarioExistente != null)
            {
                return BadRequest(new { mensaje = " El correo ya está registrado." });
            }

            // Sólo el Personal Escolar debe conocer la clave maestra para registrarse:
            if (request.Tipo_Usuario == "personal")
            {
                var masterPass = "EscolarPerson123";
                if (request.Contrasena != masterPass)
                {
                    return BadRequest(new { mensaje = "Contraseña de acceso para personal inválida." });
                }
            }

            var nuevoUsuario = new Usuario
            {
                Nombre = NormalizarCadena(request.Nombre),
                ApellidoPaterno = NormalizarCadena(request.ApellidoPaterno),
                ApellidoMaterno = NormalizarCadena(request.ApellidoMaterno),
                Correo = request.Correo,
                Telefono = request.Telefono,
                Tipo_Usuario = request.Tipo_Usuario,
                CodigoVerificacion = null,
                FechaExpiracionCodigo = null
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
        /*
         Inicio de la seccion de contraseñas olvidadas
         */

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
        //Metodo de enviar codigo
        [HttpPost("enviar-codigo")]
        public async Task<IActionResult> EnviarCodigo([FromBody] EnviarCodigoRequest request)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuario == null)
                return BadRequest(new { mensaje = "Correo no registrado." });

            string codigo = new Random().Next(100000, 999999).ToString(); // Código de 6 dígitos

            usuario.CodigoVerificacion = codigo;
            usuario.FechaExpiracionCodigo = DateTime.UtcNow.AddMinutes(5); // Código válido 5 minutos
            await _context.SaveChangesAsync();

            await EnviarCorreoVerificacion(usuario.Correo, codigo); // Método de envío de correo

            return Ok(new { mensaje = "Código de verificación enviado al correo." });
        }

        //Meotodo para validar el codigo
        [HttpPost("validar-codigo")]
        public async Task<IActionResult> ValidarCodigo([FromBody] ValidarCodigoRequest request)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);
            if (usuario == null)
                return BadRequest(new { mensaje = "Correo no registrado." });

            if (usuario.CodigoVerificacion != request.Codigo)
                return BadRequest(new { mensaje = "Código incorrecto." });

            if (usuario.FechaExpiracionCodigo < DateTime.UtcNow)
                return BadRequest(new { mensaje = "Código expirado." });

            return Ok(new { mensaje = "Código válido, puedes actualizar contraseña." });
        }

        private async Task EnviarCorreoVerificacion(string correoDestino, string codigo)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("Sistema Escolar", "actualizarcontrasenasefact@gmail.com"));
            email.To.Add(new MailboxAddress("", correoDestino));
            email.Subject = "Código de Verificación para Actualizar tu Contraseña";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
            <div style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
                <div style='max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);'>
                    <h2 style='color: #2c3e50;'>Sistema Escolar</h2>
                    <p>Hola,</p>
                    <p>Solicitaste actualizar tu contraseña. Tu código de verificación es:</p>
                    <div style='font-size: 28px; font-weight: bold; color: #27ae60; margin: 20px 0;'>{codigo}</div>
                    <p>Este código expirará en <strong>5 minutos</strong>.</p>
                    <p style='font-size: 12px; color: #7f8c8d;'>Si no solicitaste esta acción, por favor ignora este correo.</p>
                </div>
            </div>"
            };

            email.Body = bodyBuilder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync("actualizarcontrasenasefact@gmail.com", "qudiixzfbqavferv");
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
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
                    primerNombre = u.Nombre,
                    apellidoPaterno = u.ApellidoPaterno,
                    apellidoMaterno = u.ApellidoMaterno,
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
                return Ok(new List<object>());

            var lowerTerm = termino.ToLower();

            var padres = await _context.Usuarios
                .Where(u => u.Tipo_Usuario.ToLower() == "padre" &&
                            EF.Functions.Collate(
                                (u.Nombre + " " + u.ApellidoPaterno + " " + u.ApellidoMaterno).ToLower(),
                                "Latin1_General_CI_AI"
                            ).Contains(lowerTerm))
                .Select(u => new
                {
                    id_Usuario = u.Id_Usuario,
                    nombre = u.Nombre,
                    apellidoPaterno = u.ApellidoPaterno,
                    apellidoMaterno = u.ApellidoMaterno,
                    correo = u.Correo,
                    nombreCompleto = u.Nombre + " " + u.ApellidoPaterno + " " + u.ApellidoMaterno
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
                    u.Nombre,
                    u.ApellidoPaterno,
                    u.ApellidoMaterno,
                    NombreCompleto = u.Nombre + " " + u.ApellidoPaterno + " " + u.ApellidoMaterno,
                })
                .ToListAsync();

            // Filtrar en memoria usando la normalización de texto
            var resultados = padres.Where(u =>
            NormalizarTexto(u.Nombre).Contains(searchTerm) ||
            NormalizarTexto(u.ApellidoPaterno).Contains(searchTerm) ||
            NormalizarTexto(u.ApellidoMaterno).Contains(searchTerm) ||
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
            usuario.ApellidoPaterno = request.ApellidoPaterno;
            usuario.ApellidoMaterno = request.ApellidoMaterno;
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
            var usuarioId = User?.FindFirstValue(ClaimTypes.NameIdentifier);

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
                usuario.ApellidoPaterno,
                usuario.ApellidoMaterno,
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
}