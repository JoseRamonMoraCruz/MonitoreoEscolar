using MonitoreoEscolar.Server.Data;
using MonitoreoEscolar.Server.DTOs;
using MonitoreoEscolar.Server.Documents;
using QuestPDF.Fluent;
using Microsoft.EntityFrameworkCore;

namespace MonitoreoEscolar.Server.Services
{
    public interface IReportePDFGenerator
    {
        byte[] GenerarReporte(int alumnoId);
    }

    public class ReportePDFGenerator : IReportePDFGenerator
    {
        private readonly ApplicationDbContext _context;

        public ReportePDFGenerator(ApplicationDbContext context)
        {
            _context = context;
        }

        public byte[] GenerarReporte(int alumnoId)
        {
            // 1) Traer los datos básicos del alumno
            var alumno = _context.Alumnos
                .FirstOrDefault(a => a.Id == alumnoId);
            if (alumno == null)
                throw new Exception("Alumno no encontrado");

            // 2) Traer calificaciones, asistencias y reportes por separado
            var calificaciones = _context.Calificaciones
                .Where(c => c.AlumnoId == alumnoId)
                .ToList();

            var asistencias = _context.Asistencias
                .Where(a => a.AlumnoId == alumnoId)
                .ToList();

            var reportes = _context.Reportes
                .Where(r => r.AlumnoId == alumnoId)
                .ToList();

            // 3) Mapear todo a DTO
            var dto = new ReporteAlumnoDTO
            {
                AlumnoId = alumno.Id,
                NombreAlumno = $"{alumno.Nombre} {alumno.ApellidoPaterno} {alumno.ApellidoMaterno}",
                Grupo = alumno.Grupo ?? "Sin grupo",
                FechaGeneracion = DateTime.Now,

                Calificaciones = calificaciones.Select(c => new CalificacionAlumnoDto
                {
                    Materia = c.NombreAsignatura,
                    Calificacion = c.CalificacionValor,
                    Parcial = c.ParcialUnidad
                }).ToList(),

                Asistencias = asistencias.Select(a => new AsistenciaDTO
                {
                    Entrada = a.HoraEntrada.HasValue
                                      ? a.HoraEntrada.Value.ToString("hh:mm tt") : "--",
                    Salida = a.HoraSalida.HasValue
                                      ? a.HoraSalida.Value.ToString("hh:mm tt") : "--",
                }).ToList(),

                Reportes = reportes.Select(r => new ReporteDto
                {
                    Motivo = r.Motivo,
                    Fecha = r.Fecha,
                    Responsable = r.ResponsableDelReporte
                }).ToList()
            };

            // 4) Generar PDF
            var document = new ReporteAlumnoDocumento(dto);
            return document.GeneratePdf();
        }
    }
}
