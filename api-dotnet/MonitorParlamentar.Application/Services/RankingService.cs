using MonitorParlamentar.Application.DTOs;
using MonitorParlamentar.Application.Interfaces;
using MonitorParlamentar.Application.Repositories;

namespace MonitorParlamentar.Application.Services;

public class RankingService(IRankingRepository repository) : IRankingService
{
    public async Task<IEnumerable<RankingItemDto>> GetTopParlamentaresAsync(
        int ano, string? partido, string? uf, int limit)
    {
        return await repository.GetTopParlamentaresAsync(ano, partido, uf, limit);
    }

    public async Task<IEnumerable<RankingCategoriaDto>> GetPorCategoriaAsync(int ano, string? partido, int limit)
    {
        return await repository.GetPorCategoriaAsync(ano, partido, limit);
    }

    public async Task<IEnumerable<RankingPartidoDto>> GetPorPartidoAsync(int ano, int limit)
    {
        return await repository.GetPorPartidoAsync(ano, limit);
    }
}
