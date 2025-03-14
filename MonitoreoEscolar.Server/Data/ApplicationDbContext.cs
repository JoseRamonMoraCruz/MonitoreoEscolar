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
        public DbSet<Alumno> Alumnos { get; set; }
        public DbSet<Grupo> Grupos { get; set; }
        public DbSet<Calificacion> Calificaciones { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>()
                .HasKey(u => u.Id_Usuario);

            modelBuilder.Entity<Alumno>()
                .HasKey(a => a.Id);

            modelBuilder.Entity<Grupo>()
                .HasKey(a => a.Id);
            modelBuilder.Entity<Calificacion>()
                .HasKey(c => c.Id);
        }
    }
}
