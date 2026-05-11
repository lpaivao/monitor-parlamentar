using MonitorParlamentar.Application.DTOs;
using MonitorParlamentar.Application.Interfaces;
using MonitorParlamentar.Application.Repositories;

namespace MonitorParlamentar.Application.Services;

public class ParlamentaresService(IParlamentaresRepository repository) : IParlamentaresService
{
    public Task<PagedResultDto<ParlamentarDto>> GetAllAsync(
        string? nome, string? partido, string? uf,
        int? legislatura, int page, int perPage, int? ano)
    {
        int anoFiltro = ano ?? DateTime.UtcNow.Year;
        int limit = Math.Min(perPage, 100);

        return repository.GetAllAsync(nome, partido, uf, legislatura, page, limit, anoFiltro);
    }

    public Task<ParlamentarDetalheDto?> GetByIdAsync(int id, int? ano)
    {
        int anoFiltro = ano ?? DateTime.UtcNow.Year;
        return repository.GetByIdAsync(id, anoFiltro);
    }
}
