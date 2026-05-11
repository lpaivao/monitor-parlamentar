using MonitorParlamentar.Application.DTOs;

namespace MonitorParlamentar.Application.Repositories;

public interface IParlamentaresRepository
{
    Task<PagedResultDto<ParlamentarDto>> GetAllAsync(
        string? nome, string? partido, string? uf,
        int? legislatura, int page, int perPage, int ano);

    Task<ParlamentarDetalheDto?> GetByIdAsync(int id, int ano);
}
