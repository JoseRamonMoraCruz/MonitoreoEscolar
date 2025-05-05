using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonitoreoEscolar.Server.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCamposAlumnoYCalificacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Materia",
                table: "Calificaciones",
                newName: "NombreAsignatura");

            migrationBuilder.AlterColumn<string>(
                name: "CodigoVerificacion",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "AsistenciasTotal",
                table: "Calificaciones",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Firmado",
                table: "Calificaciones",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Parcial1",
                table: "Calificaciones",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Parcial2",
                table: "Calificaciones",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Parcial3",
                table: "Calificaciones",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Periodo",
                table: "Calificaciones",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Calificaciones",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CURP",
                table: "Alumnos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Carrera",
                table: "Alumnos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ciclo",
                table: "Alumnos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Generacion",
                table: "Alumnos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroControl",
                table: "Alumnos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Plantel",
                table: "Alumnos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Turno",
                table: "Alumnos",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AsistenciasTotal",
                table: "Calificaciones");

            migrationBuilder.DropColumn(
                name: "Firmado",
                table: "Calificaciones");

            migrationBuilder.DropColumn(
                name: "Parcial1",
                table: "Calificaciones");

            migrationBuilder.DropColumn(
                name: "Parcial2",
                table: "Calificaciones");

            migrationBuilder.DropColumn(
                name: "Parcial3",
                table: "Calificaciones");

            migrationBuilder.DropColumn(
                name: "Periodo",
                table: "Calificaciones");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Calificaciones");

            migrationBuilder.DropColumn(
                name: "CURP",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Carrera",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Ciclo",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Generacion",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "NumeroControl",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Plantel",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "Turno",
                table: "Alumnos");

            migrationBuilder.RenameColumn(
                name: "NombreAsignatura",
                table: "Calificaciones",
                newName: "Materia");

            migrationBuilder.AlterColumn<string>(
                name: "CodigoVerificacion",
                table: "Usuarios",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
