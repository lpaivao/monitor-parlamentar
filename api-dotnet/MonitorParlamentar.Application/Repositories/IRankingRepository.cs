using MonitorParlamentar.Application.DTOs;

namespace MonitorParlamentar.Application.Repositories;

public interface IRankingRepository
{
    Task<IEnumerable<RankingItemDto>> GetTopParlamentaresAsync(
        int ano, string? partido, string? uf, int limit);

    Task<IEnumerable<RankingCategoriaDto>> GetPorCategoriaAsync(int ano, string? partido, int limit);

    Task<IEnumerable<RankingPartidoDto>> GetPorPartidoAsync(int ano, int limit);
}
