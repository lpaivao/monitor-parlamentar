# ── Stage 1: Build ────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for layer caching
COPY MonitorParlamentar.sln .
COPY MonitorParlamentar.Domain/MonitorParlamentar.Domain.csproj             MonitorParlamentar.Domain/
COPY MonitorParlamentar.Infrastructure/MonitorParlamentar.Infrastructure.csproj MonitorParlamentar.Infrastructure/
COPY MonitorParlamentar.Application/MonitorParlamentar.Application.csproj   MonitorParlamentar.Application/
COPY MonitorParlamentar.Api/MonitorParlamentar.Api.csproj                   MonitorParlamentar.Api/

RUN dotnet restore

# Copy source and publish
COPY . .
RUN dotnet publish MonitorParlamentar.Api/MonitorParlamentar.Api.csproj \
    -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:3333
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 3333

ENTRYPOINT ["dotnet", "MonitorParlamentar.Api.dll"]
