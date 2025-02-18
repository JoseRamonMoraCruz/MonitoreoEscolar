using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Models;

namespace MonitoreoEscolar.Server.Data
{
    public class ApplicationDbContext : DbContext
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //  Asegurar que Id_Usuario es clave primaria en la base de datos
            modelBuilder.Entity<Usuario>()
                .HasKey(u => u.Id_Usuario);
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
