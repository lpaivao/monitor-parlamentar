using Dapper;
using MonitorParlamentar.Application.DTOs;
using MonitorParlamentar.Application.Repositories;

namespace MonitorParlamentar.Infrastructure.Repositories;

public class DespesasRepository(DatabaseConnectionFactory factory) : IDespesasRepository
{
    public async Task<PagedResultDto<DespesaDto>> GetAllAsync(
        int? ano, int? mes, string? tipoDespesa, string? fornecedor,
        string? partido, string? uf, int page, int perPage)
    {
        using var conn = factory.CreateConnection();

        var conditions = new List<string> { "p.casa = 'camara'" };
        var parameters = new DynamicParameters();

        if (ano.HasValue)       { conditions.Add("d.ano = @ano");                        parameters.Add("ano", ano.Value); }
        if (mes.HasValue)       { conditions.Add("d.mes = @mes");                        parameters.Add("mes", mes.Value); }
        if (!string.IsNullOrWhiteSpace(tipoDespesa)) { conditions.Add("d.tipo_despesa ILIKE @tipoDespesa"); parameters.Add("tipoDespesa", $"%{tipoDespesa}%"); }
        if (!string.IsNullOrWhiteSpace(fornecedor))  { conditions.Add("d.fornecedor ILIKE @fornecedor");   parameters.Add("fornecedor",  $"%{fornecedor}%"); }
        if (!string.IsNullOrWhiteSpace(partido))     { conditions.Add("p.sigla_partido = @partido");       parameters.Add("partido", partido.ToUpper()); }
        if (!string.IsNullOrWhiteSpace(uf))          { conditions.Add("p.sigla_uf = @uf");                parameters.Add("uf", uf.ToUpper()); }

        var where = $"WHERE {string.Join(" AND ", conditions)}";

        var baseFrom = @"FROM despesas d
                         JOIN parlamentares p ON p.id = d.parlamentar_id";

        var countSql = $"SELECT COUNT(*) {baseFrom} {where}";
        var total = await conn.ExecuteScalarAsync<int>(countSql, parameters);

        var offset = (page - 1) * perPage;
        parameters.Add("limit", perPage);
        parameters.Add("offset", offset);

        var dataSql = $@"
            SELECT
                d.id, d.parlamentar_id,
                p.nome AS parlamentar_nome,
                p.sigla_partido, p.sigla_uf,
                d.ano, d.mes, d.tipo_despesa, d.fornecedor, d.cnpj_cpf,
                d.valor_documento, d.valor_liquido,
                d.numero_documento, d.url_documento, d.data_emissao
            {baseFrom}
            {where}
            ORDER BY d.valor_liquido DESC
            LIMIT @limit OFFSET @offset";

        var rows = await conn.QueryAsync<DespesaDto>(dataSql, parameters);

        int lastPage = (int)Math.Ceiling((double)total / perPage);

        return new PagedResultDto<DespesaDto>
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

    public async Task<PagedResultDto<DespesaDto>> GetByParlamentarAsync(
        int parlamentarId, int? ano, int? mes, int page, int perPage)
    {
        using var conn = factory.CreateConnection();

        var conditions = new List<string>
        {
            "d.parlamentar_id = @parlamentarId",
            "p.casa = 'camara'"
        };
        var parameters = new DynamicParameters();
        parameters.Add("parlamentarId", parlamentarId);

        if (ano.HasValue) { conditions.Add("d.ano = @ano"); parameters.Add("ano", ano.Value); }
        if (mes.HasValue) { conditions.Add("d.mes = @mes"); parameters.Add("mes", mes.Value); }

        var where = $"WHERE {string.Join(" AND ", conditions)}";

        var baseFrom = @"FROM despesas d
                         JOIN parlamentares p ON p.id = d.parlamentar_id";

        var countSql = $"SELECT COUNT(*) {baseFrom} {where}";
        var total = await conn.ExecuteScalarAsync<int>(countSql, parameters);

        var offset = (page - 1) * perPage;
        parameters.Add("limit", perPage);
        parameters.Add("offset", offset);

        var dataSql = $@"
            SELECT
                d.id, d.parlamentar_id,
                p.nome AS parlamentar_nome,
                p.sigla_partido, p.sigla_uf,
                d.ano, d.mes, d.tipo_despesa, d.fornecedor, d.cnpj_cpf,
                d.valor_documento, d.valor_liquido,
                d.numero_documento, d.url_documento, d.data_emissao
            {baseFrom}
            {where}
            ORDER BY d.data_emissao DESC, d.valor_liquido DESC
            LIMIT @limit OFFSET @offset";

        var rows = await conn.QueryAsync<DespesaDto>(dataSql, parameters);

        int lastPage = (int)Math.Ceiling((double)total / perPage);

        return new PagedResultDto<DespesaDto>
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
}
