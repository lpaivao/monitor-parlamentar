using System.Reflection;
using Dapper;
using Microsoft.Extensions.Logging;

namespace MonitorParlamentar.Infrastructure;

/// <summary>
/// Runner de migrations SQL versionadas (padrão V###__descricao.sql).
/// Executa cada arquivo SQL exatamente uma vez, rastreando o histórico
/// na tabela _migrations do próprio banco de dados.
/// </summary>
public class MigrationRunner(DatabaseConnectionFactory factory, ILogger<MigrationRunner> logger)
{
    // Convenção: arquivos .sql dentro da pasta Migrations/ com prefixo V###__
    private const string MigrationsFolder = "Migrations";

    public async Task RunAsync()
    {
        using var conn = factory.CreateConnection();
        conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            await EnsureMigrationsTableAsync(conn, tx);

            var applied = await GetAppliedMigrationsAsync(conn, tx);
            var pending = GetPendingMigrations(applied);

            if (pending.Count == 0)
            {
                logger.LogInformation("[Migrations] Banco atualizado — nenhuma migration pendente.");
                tx.Commit();
                return;
            }

            logger.LogInformation("[Migrations] {Count} migration(s) pendente(s).", pending.Count);

            foreach (var (version, name, sql) in pending)
            {
                logger.LogInformation("[Migrations] Aplicando {Version} — {Name}...", version, name);
                await conn.ExecuteAsync(sql, transaction: tx);
                await RegisterMigrationAsync(conn, tx, version, name);
                logger.LogInformation("[Migrations] {Version} aplicada com sucesso.", version);
            }

            tx.Commit();
            logger.LogInformation("[Migrations] Todas as migrations aplicadas.");
        }
        catch (Exception ex)
        {
            tx.Rollback();
            logger.LogError(ex, "[Migrations] Falha ao aplicar migrations. Rollback executado.");
            throw;
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static Task EnsureMigrationsTableAsync(
        System.Data.IDbConnection conn, System.Data.IDbTransaction tx)
    {
        const string sql = """
            CREATE TABLE IF NOT EXISTS _migrations (
                id          SERIAL PRIMARY KEY,
                version     VARCHAR(10)  NOT NULL UNIQUE,
                name        VARCHAR(255) NOT NULL,
                applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
            )
            """;
        return conn.ExecuteAsync(sql, transaction: tx);
    }

    private static async Task<HashSet<string>> GetAppliedMigrationsAsync(
        System.Data.IDbConnection conn, System.Data.IDbTransaction tx)
    {
        var rows = await conn.QueryAsync<string>(
            "SELECT version FROM _migrations ORDER BY version",
            transaction: tx);
        return rows.ToHashSet();
    }

    private static async Task RegisterMigrationAsync(
        System.Data.IDbConnection conn, System.Data.IDbTransaction tx,
        string version, string name)
    {
        await conn.ExecuteAsync(
            "INSERT INTO _migrations (version, name) VALUES (@version, @name)",
            new { version, name },
            transaction: tx);
    }

    /// <summary>
    /// Lê os arquivos .sql embarcados no assembly, ordena por versão
    /// e retorna apenas os que ainda não foram aplicados.
    /// Convenção de nome: V001__descricao.sql
    /// </summary>
    private List<(string Version, string Name, string Sql)> GetPendingMigrations(HashSet<string> applied)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourcePrefix = $"{assembly.GetName().Name}.{MigrationsFolder}.";

        return assembly
            .GetManifestResourceNames()
            .Where(r => r.StartsWith(resourcePrefix) && r.EndsWith(".sql"))
            .OrderBy(r => r)
            .Select(resourceName =>
            {
                // "MonitorParlamentar.Infrastructure.Migrations.V001__create_tables.sql"
                var fileName = resourceName[resourcePrefix.Length..]; // "V001__create_tables.sql"
                var parts    = fileName.Replace(".sql", "").Split("__", 2);
                var version  = parts[0];                              // "V001"
                var name     = parts.Length > 1 ? parts[1] : fileName;

                using var stream = assembly.GetManifestResourceStream(resourceName)!;
                using var reader = new StreamReader(stream);
                var sql = reader.ReadToEnd();

                return (version, name, sql);
            })
            .Where(m => !applied.Contains(m.version))
            .ToList();
    }
}
