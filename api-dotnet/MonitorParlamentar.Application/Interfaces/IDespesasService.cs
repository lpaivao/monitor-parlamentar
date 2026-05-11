using MonitorParlamentar.Application.DTOs;

namespace MonitorParlamentar.Application.Interfaces;

public interface IDespesasService
{
    Task<PagedResultDto<DespesaDto>> GetAllAsync(
        int? ano, int? mes, string? tipoDespesa, string? fornecedor,
        string? partido, string? uf, int page, int perPage);

    Task<PagedResultDto<DespesaDto>> GetByParlamentarAsync(
        int parlamentarId, int? ano, int? mes, int page, int perPage);
}
