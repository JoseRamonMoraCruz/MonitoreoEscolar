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
        public DbSet<Alumno> Alumnos { get; set; } //  Agregar la tabla de alumnos

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //  Asegurar que Id_Usuario es clave primaria en la base de datos
            modelBuilder.Entity<Usuario>()
                .HasKey(u => u.Id_Usuario);

            //  Asegurar que Id es clave primaria en la tabla Alumnos
            modelBuilder.Entity<Alumno>()
                .HasKey(a => a.Id);
        }
    }
}