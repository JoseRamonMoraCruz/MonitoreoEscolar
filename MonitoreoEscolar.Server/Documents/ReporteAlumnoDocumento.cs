using MonitoreoEscolar.Server.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;

namespace MonitoreoEscolar.Server.Documents
{
    public class ReporteAlumnoDocumento : IDocument
    {
        private readonly ReporteAlumnoDTO _data;
        public ReporteAlumnoDocumento(ReporteAlumnoDTO data) => _data = data;

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(40);

                // Encabezado
                page.Header().Column(col =>
                {
                    col.Spacing(5);
                    col.Item().Text($"Nombre del hijo: {_data.NombreAlumno}")
                              .FontSize(14).Bold();
                    col.Item().Text($"Grupo: {_data.Grupo}")
                              .FontSize(12);
                    col.Item().Text($"Fecha: {_data.FechaGeneracion:yyyy/MM/dd}")
                              .FontSize(12);
                    col.Item().LineHorizontal(1)
                              .LineColor(Colors.Grey.Lighten2);
                });

                // Contenido
                page.Content().Column(col =>
                {
                    col.Spacing(15);

                    // Calificaciones
                    col.Item().Text("Calificaciones")
                              .FontSize(12).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(200);
                            c.ConstantColumn(100);
                            c.ConstantColumn(100);
                        });
                        table.Header(h =>
                        {
                            h.Cell().Text("Materia").Bold();
                            h.Cell().Text("Calificación").Bold();
                            h.Cell().Text("Parcial").Bold();
                        });
                        foreach (var cal in _data.Calificaciones)
                        {
                            table.Cell().Text(cal.Materia);
                            table.Cell().Text(cal.Calificacion.ToString());
                            table.Cell().Text(cal.Parcial);
                        }
                    });

                    // Asistencias
                    // Asistencias (solo hora de entrada y salida)
                    col.Item().Text("Asistencias")
                              .FontSize(12).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(150);   // Hora Entrada
                            c.ConstantColumn(150);   // Hora Salida
                        });
                        table.Header(h =>
                        {
                            h.Cell().Text("Hora Entrada").Bold();
                            h.Cell().Text("Hora Salida").Bold();
                        });
                        foreach (var a in _data.Asistencias)
                        {
                            table.Cell().Text(a.Entrada);
                            table.Cell().Text(a.Salida);
                        }
                    });

                    // Reporte de Mala Conducta
                    col.Item().Text("Reporte de Mala Conducta")
                              .FontSize(12).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(200);
                            c.ConstantColumn(120);
                            c.ConstantColumn(150);
                        });
                        table.Header(h =>
                        {
                            h.Cell().Text("Situación").Bold();
                            h.Cell().Text("Fecha").Bold();
                            h.Cell().Text("Responsable").Bold();
                        });
                        foreach (var r in _data.Reportes)
                        {
                            table.Cell().Text(r.Motivo);
                            table.Cell().Text(r.Fecha.ToString("yyyy/MM/dd"));
                            table.Cell().Text(r.Responsable);
                        }
                    });
                });

                // Pie de página
                page.Footer().AlignRight().Text(text =>
                {
                    text.Span("Página ");
                    text.CurrentPageNumber();
                });
            });
        }
    }
}
