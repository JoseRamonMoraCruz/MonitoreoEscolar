using Microsoft.EntityFrameworkCore;
using MonitoreoEscolar.Server.Data;

var builder = WebApplication.CreateBuilder(args);

//  Configurar la conexión a SQL Server desde appsettings.json con logs detallados
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlServerOptions =>
    {
        sqlServerOptions.EnableRetryOnFailure(); // Maneja errores de conexión
    })
    .EnableSensitiveDataLogging() // Logs detallados
);

//  Agregar política CORS para permitir conexiones desde el frontend
var corsPolicyName = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
        policy.WithOrigins("https://localhost:55052") //  URL del frontend
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

//  Agregar controladores y herramientas de documentación (Swagger)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

//  Habilitar Swagger solo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//  Verificar conexión con SQL Server antes de iniciar la API
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        Console.WriteLine("🔍 Intentando conectar a SQL Server...");

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        Console.WriteLine($"🔗 Cadena de conexión utilizada: {connectionString}");

        if (context.Database.CanConnect())
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("✅ Conexión exitosa a SQL Server.");
            Console.ResetColor();
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("❌ No se pudo conectar a SQL Server.");
            Console.ResetColor();
        }
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"❌ ERROR de conexión a SQL Server: {ex.Message}");

        if (ex.InnerException != null)
        {
            Console.WriteLine($"➡️ Detalles internos: {ex.InnerException.Message}");
        }

        Console.WriteLine($"🔍 StackTrace: {ex.StackTrace}");
        Console.ResetColor();
    }
}

//  Agregar Middleware antes de ejecutar la API
app.UseCors(corsPolicyName);
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
