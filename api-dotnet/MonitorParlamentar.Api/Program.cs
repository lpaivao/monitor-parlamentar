using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MonitorParlamentar.Application.Interfaces;
using MonitorParlamentar.Application.Repositories;
using MonitorParlamentar.Application.Services;
using MonitorParlamentar.Infrastructure;
using MonitorParlamentar.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower;
    });

builder.Services.Configure<Microsoft.AspNetCore.Routing.RouteOptions>(options =>
{
    options.LowercaseUrls = true;
});

// Configure Dapper
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

builder.Services.AddSingleton<DatabaseConnectionFactory>();
builder.Services.AddSingleton<MigrationRunner>();


builder.Services.AddScoped<IRankingRepository, RankingRepository>();
builder.Services.AddScoped<IRankingService, RankingService>();

builder.Services.AddScoped<IParlamentaresRepository, ParlamentaresRepository>();
builder.Services.AddScoped<IParlamentaresService, ParlamentaresService>();

builder.Services.AddScoped<MonitorParlamentar.Application.Repositories.IDespesasRepository, MonitorParlamentar.Infrastructure.Repositories.DespesasRepository>();
builder.Services.AddScoped<MonitorParlamentar.Application.Interfaces.IDespesasService, MonitorParlamentar.Application.Services.DespesasService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        var originsString = builder.Configuration["CORS_ORIGIN"];
        if (string.IsNullOrWhiteSpace(originsString) || originsString == "*")
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            var origins = originsString.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                       .Select(o => o.Trim().TrimEnd('/'))
                                       .ToArray();

            policy.SetIsOriginAllowed(origin => 
            {
                // Permite se for exatamente um dos configurados
                if (origins.Contains(origin, StringComparer.OrdinalIgnoreCase))
                    return true;

                // Permite localhost para facilitar o desenvolvimento do frontend
                if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase) || 
                    origin.StartsWith("http://127.0.0.1:", StringComparison.OrdinalIgnoreCase))
                    return true;

                // Permite preview URLs do Vercel (terminam com .vercel.app)
                if (origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
                    return true;

                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

// ── Executa migrations na inicialização ──────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var migrationRunner = scope.ServiceProvider.GetRequiredService<MigrationRunner>();
    await migrationRunner.RunAsync();
}


// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();
app.UseCors("CorsPolicy");

app.MapGet("/", () => "API is running");

app.MapControllers().RequireCors("CorsPolicy");

app.Run();
