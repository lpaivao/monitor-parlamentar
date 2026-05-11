using MonitorParlamentar.Application.DTOs;
using MonitorParlamentar.Application.Interfaces;
using MonitorParlamentar.Application.Repositories;

namespace MonitorParlamentar.Application.Services;

public class DespesasService(IDespesasRepository repository) : IDespesasService
{
    public Task<PagedResultDto<DespesaDto>> GetAllAsync(
        int? ano, int? mes, string? tipoDespesa, string? fornecedor,
        string? partido, string? uf, int page, int perPage)
    {
        int limit = Math.Min(perPage, 100);
        return repository.GetAllAsync(ano, mes, tipoDespesa, fornecedor, partido, uf, page, limit);
    }

    public Task<PagedResultDto<DespesaDto>> GetByParlamentarAsync(
        int parlamentarId, int? ano, int? mes, int page, int perPage)
    {
        int limit = Math.Min(perPage, 100);
        return repository.GetByParlamentarAsync(parlamentarId, ano, mes, page, limit);
    }
}
