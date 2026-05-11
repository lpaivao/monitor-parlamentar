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

builder.Services.AddScoped<IRankingRepository, RankingRepository>();
builder.Services.AddScoped<IRankingService, RankingService>();

builder.Services.AddScoped<IParlamentaresRepository, ParlamentaresRepository>();
builder.Services.AddScoped<IParlamentaresService, ParlamentaresService>();

builder.Services.AddScoped<MonitorParlamentar.Application.Repositories.IDespesasRepository, MonitorParlamentar.Infrastructure.Repositories.DespesasRepository>();
builder.Services.AddScoped<MonitorParlamentar.Application.Interfaces.IDespesasService, MonitorParlamentar.Application.Services.DespesasService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();

app.MapControllers();

app.Run();
