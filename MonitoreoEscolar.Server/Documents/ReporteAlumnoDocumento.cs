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
                page.Header().Element(header =>
                {
                    header.Column(col =>
                    {
                        col.Spacing(4);

                        col.Item().Text("📘 Reporte Escolar")
                            .FontSize(20).Bold().FontColor(Colors.Blue.Medium);

                        col.Item().Text($"Nombre del alumno: {_data.NombreAlumno}")
                            .FontSize(12);

                        col.Item().Text($"Grupo: {_data.Grupo}")
                            .FontSize(12);

                        col.Item().Text($"Fecha de generación: {_data.FechaGeneracion:dd/MM/yyyy hh:mm tt}")
                            .FontSize(10).FontColor(Colors.Grey.Darken1);

                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });
                });


                // Contenido
                page.Content().Column(col =>
                {
                    col.Spacing(20);

                    // Calificaciones
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Background(Colors.Grey.Lighten4).Column(inner =>
                    {
                        inner.Spacing(5);
                        inner.Item().Text("📚 Calificaciones").FontSize(13).Bold().FontColor(Colors.Blue.Medium);

                        inner.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(200);
                                c.ConstantColumn(100);
                                c.ConstantColumn(100);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(e => e
                               .Background(Colors.Blue.Medium)
                               .Padding(5)
                               .AlignMiddle()
                               .Text("Materia").FontColor(Colors.White).Bold()
                           );

                                h.Cell().Element(e => e
                              .Background(Colors.Blue.Medium)
                              .Padding(5)
                              .AlignMiddle()
                              .Text("Calificación").FontColor(Colors.White).Bold()
                          );

                                h.Cell().Element(e => e
                              .Background(Colors.Blue.Medium)
                              .Padding(5)
                              .AlignMiddle()
                              .Text("Parcial").FontColor(Colors.White).Bold()
                          );

                            });

                            foreach (var cal in _data.Calificaciones)
                            {
                                table.Cell().Element(e => e.Padding(5).Text(cal.Materia));
                                table.Cell().Element(e => e.Padding(5).Text(cal.Calificacion.ToString()));
                                table.Cell().Element(e => e.Padding(5).Text(cal.Parcial));
                            }
                        });
                    });

                    // Asistencias
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Background(Colors.Grey.Lighten4).Column(inner =>
                    {
                        inner.Spacing(5);
                        inner.Item().Text("🕓 Asistencias").FontSize(13).Bold().FontColor(Colors.Blue.Medium);

                        inner.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(130); // Entrada
                                c.ConstantColumn(130); // Salida
                                c.ConstantColumn(120); // Fecha
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(e => e
                                    .Background(Colors.Blue.Medium)
                                    .Padding(5)
                                    .AlignMiddle()
                                    .Text("Hora Entrada").FontColor(Colors.White).Bold()
                                );
                                h.Cell().Element(e => e
                                    .Background(Colors.Blue.Medium)
                                    .Padding(5)
                                    .AlignMiddle()
                                    .Text("Hora Salida").FontColor(Colors.White).Bold()
                                );
                                h.Cell().Element(e => e
                                    .Background(Colors.Blue.Medium)
                                    .Padding(5)
                                    .AlignMiddle()
                                    .Text("Fecha").FontColor(Colors.White).Bold()
                                );
                            });

                            foreach (var a in _data.Asistencias)
                            {
                                table.Cell().Element(e => e.Padding(5).Text(a.Entrada));
                                table.Cell().Element(e => e.Padding(5).Text(a.Salida));
                                table.Cell().Element(e => e.Padding(5).Text(a.Fecha));
                            }
                        }); // Cierra tabla de asistencias
                    }); // Cierra columna de asistencias


                    // Reportes
                    // Reportes
                    col.Item().Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Background(Colors.Grey.Lighten4).Column(inner =>
                    {
                        inner.Spacing(5);
                        inner.Item().Text("⚠️ Reportes de Conducta").FontSize(13).Bold().FontColor(Colors.Blue.Medium);

                        inner.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(200);
                                c.ConstantColumn(120);
                                c.ConstantColumn(150);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(e => e
                                    .Background(Colors.Blue.Medium)
                                    .Padding(5)
                                    .AlignMiddle()
                                    .Text("Motivo").FontColor(Colors.White).Bold()
                                );
                                h.Cell().Element(e => e
                                    .Background(Colors.Blue.Medium)
                                    .Padding(5)
                                    .AlignMiddle()
                                    .Text("Fecha").FontColor(Colors.White).Bold()
                                );
                                h.Cell().Element(e => e
                                    .Background(Colors.Blue.Medium)
                                    .Padding(5)
                                    .AlignMiddle()
                                    .Text("Responsable").FontColor(Colors.White).Bold()
                                );
                            });

                            foreach (var r in _data.Reportes)
                            {
                                table.Cell().Element(e => e.Padding(5).Text(r.Motivo));
                                table.Cell().Element(e => e.Padding(5).Text(r.Fecha));
                                table.Cell().Element(e => e.Padding(5).Text(r.Responsable));
                            }
                        });
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
