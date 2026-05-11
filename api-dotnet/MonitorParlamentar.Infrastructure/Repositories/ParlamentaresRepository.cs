using Dapper;
using MonitorParlamentar.Application.DTOs;
using MonitorParlamentar.Application.Repositories;

namespace MonitorParlamentar.Infrastructure.Repositories;

public class ParlamentaresRepository(DatabaseConnectionFactory factory) : IParlamentaresRepository
{
    public async Task<PagedResultDto<ParlamentarDto>> GetAllAsync(
        string? nome, string? partido, string? uf,
        int? legislatura, int page, int perPage, int ano)
    {
        using var conn = factory.CreateConnection();

        var conditions = new List<string> { "p.casa = 'camara'" };
        var parameters = new DynamicParameters();
        parameters.Add("ano", ano);

        if (!string.IsNullOrWhiteSpace(nome))
        {
            conditions.Add("p.nome ILIKE @nome");
            parameters.Add("nome", $"%{nome}%");
        }
        if (!string.IsNullOrWhiteSpace(partido))
        {
            conditions.Add("p.sigla_partido = @partido");
            parameters.Add("partido", partido.ToUpper());
        }
        if (!string.IsNullOrWhiteSpace(uf))
        {
            conditions.Add("p.sigla_uf = @uf");
            parameters.Add("uf", uf.ToUpper());
        }
        if (legislatura.HasValue)
        {
            conditions.Add("p.legislatura = @legislatura");
            parameters.Add("legislatura", legislatura.Value);
        }

        var where = $"WHERE {string.Join(" AND ", conditions)}";

        var countSql = $@"
            SELECT COUNT(*) FROM parlamentares p
            {where}";

        var total = await conn.ExecuteScalarAsync<int>(countSql, parameters);

        var offset = (page - 1) * perPage;
        parameters.Add("limit", perPage);
        parameters.Add("offset", offset);

        var dataSql = $@"
            SELECT
                p.id,
                p.api_id,
                p.nome,
                p.sigla_partido,
                p.sigla_uf,
                p.foto_url,
                p.legislatura,
                COALESCE((
                    SELECT SUM(d.valor_liquido)
                    FROM despesas d
                    WHERE d.parlamentar_id = p.id AND d.ano = @ano
                ), 0) AS total_gasto
            FROM parlamentares p
            {where}
            ORDER BY total_gasto DESC
            LIMIT @limit OFFSET @offset";

        var rows = await conn.QueryAsync<ParlamentarDto>(dataSql, parameters);

        int lastPage = (int)Math.Ceiling((double)total / perPage);

        return new PagedResultDto<ParlamentarDto>
        {
            Data = rows,
            Meta = new PaginationMeta
            {
                Total = total,
                PerPage = perPage,
                CurrentPage = page,
                LastPage = Math.Max(lastPage, 1),
                FirstPage = 1
            }
        };
    }

    public async Task<ParlamentarDetalheDto?> GetByIdAsync(int id, int ano)
    {
        using var conn = factory.CreateConnection();

        var parlamentar = await conn.QueryFirstOrDefaultAsync<ParlamentarDetalheDto>(
            @"SELECT id, api_id, nome, sigla_partido, sigla_uf, foto_url, casa, legislatura
              FROM parlamentares
              WHERE id = @id AND casa = 'camara'",
            new { id });

        if (parlamentar is null) return null;

        parlamentar.Ano = ano;

        var totalGasto = await conn.ExecuteScalarAsync<decimal>(
            @"SELECT COALESCE(SUM(valor_liquido), 0)
              FROM despesas
              WHERE parlamentar_id = @id AND ano = @ano",
            new { id, ano });

        parlamentar.TotalGasto = totalGasto;

        var porCategoria = await conn.QueryAsync<GastoPorCategoriaDto>(
            @"SELECT tipo_despesa, SUM(valor_liquido) AS total, COUNT(*) AS qtd
              FROM despesas
              WHERE parlamentar_id = @id AND ano = @ano
              GROUP BY tipo_despesa
              ORDER BY total DESC",
            new { id, ano });

        parlamentar.PorCategoria = porCategoria;

        var porMes = await conn.QueryAsync<GastoPorMesDto>(
            @"SELECT mes, SUM(valor_liquido) AS total
              FROM despesas
              WHERE parlamentar_id = @id AND ano = @ano
              GROUP BY mes
              ORDER BY mes ASC",
            new { id, ano });

        parlamentar.PorMes = porMes;

        return parlamentar;
    }
}
