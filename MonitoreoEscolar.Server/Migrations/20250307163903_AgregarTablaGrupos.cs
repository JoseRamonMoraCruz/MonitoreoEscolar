using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonitoreoEscolar.Server.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTablaGrupos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GrupoId",
                table: "Alumnos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Grupos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Grado = table.Column<int>(type: "int", nullable: false),
                    Letra = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grupos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alumnos_GrupoId",
                table: "Alumnos",
                column: "GrupoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Alumnos_Grupos_GrupoId",
                table: "Alumnos",
                column: "GrupoId",
                principalTable: "Grupos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alumnos_Grupos_GrupoId",
                table: "Alumnos");

            migrationBuilder.DropTable(
                name: "Grupos");

            migrationBuilder.DropIndex(
                name: "IX_Alumnos_GrupoId",
                table: "Alumnos");

            migrationBuilder.DropColumn(
                name: "GrupoId",
                table: "Alumnos");
        }
    }
}
