using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonitoreoEscolar.Server.Migrations
{
    /// <inheritdoc />
    public partial class AgregarTablaCarrera : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CarreraId",
                table: "Grupos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Carreras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carreras", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Grupos_CarreraId",
                table: "Grupos",
                column: "CarreraId");

            migrationBuilder.AddForeignKey(
                name: "FK_Grupos_Carreras_CarreraId",
                table: "Grupos",
                column: "CarreraId",
                principalTable: "Carreras",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Grupos_Carreras_CarreraId",
                table: "Grupos");

            migrationBuilder.DropTable(
                name: "Carreras");

            migrationBuilder.DropIndex(
                name: "IX_Grupos_CarreraId",
                table: "Grupos");

            migrationBuilder.DropColumn(
                name: "CarreraId",
                table: "Grupos");
        }
    }
}
