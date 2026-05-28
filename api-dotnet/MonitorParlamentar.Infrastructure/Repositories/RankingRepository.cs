using Dapper;
using MonitorParlamentar.Application.DTOs;
using MonitorParlamentar.Application.Repositories;

namespace MonitorParlamentar.Infrastructure.Repositories;

public class RankingRepository(DatabaseConnectionFactory factory) : IRankingRepository
{
    public async Task<IEnumerable<RankingItemDto>> GetTopParlamentaresAsync(
        int ano, string? partido, string? uf, int limit)
    {
        using var conn = factory.CreateConnection();

        var conditions = new List<string>
        {
            "d.ano = @ano",
            "p.casa = 'camara'"
        };
        var parameters = new DynamicParameters();
        parameters.Add("ano", ano);
        parameters.Add("limit", limit);

        if (!string.IsNullOrWhiteSpace(partido)) { conditions.Add("p.sigla_partido = @partido"); parameters.Add("partido", partido.ToUpper()); }
        if (!string.IsNullOrWhiteSpace(uf))      { conditions.Add("p.sigla_uf = @uf");          parameters.Add("uf", uf.ToUpper()); }

        var where = $"WHERE {string.Join(" AND ", conditions)}";

        var sql = $@"
            SELECT
                p.id, p.nome, p.sigla_partido, p.sigla_uf, p.foto_url,
                SUM(d.valor_liquido) AS total_gasto,
                COUNT(d.id) AS qtd_despesas
            FROM parlamentares p
            JOIN despesas d ON d.parlamentar_id = p.id
            {where}
            GROUP BY p.id, p.nome, p.sigla_partido, p.sigla_uf, p.foto_url
            ORDER BY total_gasto DESC
            LIMIT @limit";

        var rows = await conn.QueryAsync<RankingItemDto>(sql, parameters);

        // Assign posicao after retrieval
        var list = rows.ToList();
        for (int i = 0; i < list.Count; i++)
            list[i].Posicao = i + 1;

        return list;
    }

    public async Task<IEnumerable<RankingCategoriaDto>> GetPorCategoriaAsync(int ano, string? partido, int limit)
    {
        using var conn = factory.CreateConnection();

        var conditions = new List<string>
        {
            "d.ano = @ano",
            "p.casa = 'camara'",
            "d.tipo_despesa IS NOT NULL"
        };
        var parameters = new DynamicParameters();
        parameters.Add("ano", ano);
        parameters.Add("limit", limit);

        if (!string.IsNullOrWhiteSpace(partido)) { conditions.Add("p.sigla_partido = @partido"); parameters.Add("partido", partido.ToUpper()); }

        var where = $"WHERE {string.Join(" AND ", conditions)}";

        var sql = $@"
            SELECT
                d.tipo_despesa AS categoria,
                SUM(d.valor_liquido) AS total,
                COUNT(d.id) AS qtd_despesas
            FROM despesas d
            JOIN parlamentares p ON p.id = d.parlamentar_id
            {where}
            GROUP BY d.tipo_despesa
            ORDER BY total DESC
            LIMIT @limit";

        return await conn.QueryAsync<RankingCategoriaDto>(sql, parameters);
    }

    public async Task<IEnumerable<RankingPartidoDto>> GetPorPartidoAsync(int ano, int limit)
    {
        using var conn = factory.CreateConnection();

        var sql = @"
            SELECT
                p.sigla_partido AS partido,
                SUM(d.valor_liquido) AS total,
                COUNT(DISTINCT p.id) AS qtd_parlamentares
            FROM despesas d
            JOIN parlamentares p ON p.id = d.parlamentar_id
            WHERE d.ano = @ano
              AND p.casa = 'camara'
              AND p.sigla_partido IS NOT NULL
            GROUP BY p.sigla_partido
            ORDER BY total DESC
            LIMIT @limit";

        var rows = await conn.QueryAsync<RankingPartidoDto>(sql, new { ano, limit });

        // Calculate media_por_parlamentar
        return rows.Select(r => new RankingPartidoDto
        {
            Partido = r.Partido,
            Total = r.Total,
            QtdParlamentares = r.QtdParlamentares,
            MediaPorParlamentar = r.QtdParlamentares > 0 ? r.Total / r.QtdParlamentares : 0
        });
    }
}
