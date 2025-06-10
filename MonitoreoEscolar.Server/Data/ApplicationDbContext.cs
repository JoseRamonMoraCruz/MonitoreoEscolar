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
        public DbSet<Reporte> Reportes { get; set; }
        public DbSet<Asistencia> Asistencias { get; set; }
        public DbSet<Escuela> Escuelas { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Usuario>()
                .HasKey(u => u.Id_Usuario);

            modelBuilder.Entity<Alumno>()
                .HasKey(a => a.Id);

            modelBuilder.Entity<Grupo>()
                .HasKey(g => g.Id);

            modelBuilder.Entity<Calificacion>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<Reporte>()
                .HasKey(r => r.Id);

            // Configuración de la relación entre Alumno y Tutor (ya configurada)
            modelBuilder.Entity<Alumno>()
                .HasOne(a => a.TutorUsuario)
                .WithMany(u => u.Alumnos)
                .HasForeignKey(a => a.TutorId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Configuración de la relación Calificacion -> Alumno
            modelBuilder.Entity<Calificacion>()
                .HasOne(c => c.Alumno)
                .WithMany() // Si en Alumno tienes una colección (p.ej., Calificaciones), usa .WithMany(a => a.Calificaciones)
                .HasForeignKey(c => c.AlumnoId)
                .OnDelete(DeleteBehavior.Cascade); // Esto elimina en cascada las calificaciones al eliminar el alumno

            // Configuración de la relación Reporte -> Alumno
            modelBuilder.Entity<Reporte>()
                .HasOne(r => r.Alumno)
                .WithMany() // Si en Alumno tienes una colección (p.ej., Reportes), usa .WithMany(a => a.Reportes)
                .HasForeignKey(r => r.AlumnoId)
                .OnDelete(DeleteBehavior.Cascade); // Esto elimina en cascada los reportes al eliminar el alumno
        }
    }
}
