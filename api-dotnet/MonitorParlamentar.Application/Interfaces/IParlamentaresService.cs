using MonitorParlamentar.Application.DTOs;

namespace MonitorParlamentar.Application.Interfaces;

public interface IParlamentaresService
{
    Task<PagedResultDto<ParlamentarDto>> GetAllAsync(
        string? nome, string? partido, string? uf,
        int? legislatura, int page, int perPage, int? ano);

    Task<ParlamentarDetalheDto?> GetByIdAsync(int id, int? ano);
}
