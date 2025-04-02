using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonitoreoEscolar.Server.Migrations
{
    /// <inheritdoc />
    public partial class QuitarRequiredTutor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alumnos_Usuarios_TutorId",
                table: "Alumnos");

            migrationBuilder.AlterColumn<int>(
                name: "TutorId",
                table: "Alumnos",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Alumnos_Usuarios_TutorId",
                table: "Alumnos",
                column: "TutorId",
                principalTable: "Usuarios",
                principalColumn: "Id_Usuario",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alumnos_Usuarios_TutorId",
                table: "Alumnos");

            migrationBuilder.AlterColumn<int>(
                name: "TutorId",
                table: "Alumnos",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Alumnos_Usuarios_TutorId",
                table: "Alumnos",
                column: "TutorId",
                principalTable: "Usuarios",
                principalColumn: "Id_Usuario");
        }
    }
}
