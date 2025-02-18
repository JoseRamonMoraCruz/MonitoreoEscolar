using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MonitoreoEscolar.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<PersonalEscolar> PersonalEscolar { get; set; }
        public DbSet<Alumno> Alumnos { get; set; }
        public DbSet<Padre> Padres { get; set; }
    }

    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellidos { get; set; }
        public string Correo { get; set; }
        public string PasswordHash { get; set; }
        public string TipoUsuario { get; set; }
    }

    public class PersonalEscolar
    {
        public int Id { get; set; }
        public int IdUsuario { get; set; }
        public Usuario Usuario { get; set; }
    }

    public class Alumno
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellidos { get; set; }
        public string Grupo { get; set; }
        public int IdPersonal { get; set; }
        public PersonalEscolar PersonalEscolar { get; set; }
    }

    public class Padre
    {
        public int Id { get; set; }
        public int IdUsuario { get; set; }
        public int IdAlumno { get; set; }
        public Usuario Usuario { get; set; }
        public Alumno Alumno { get; set; }
    }
}
