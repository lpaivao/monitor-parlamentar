using MonitorParlamentar.Application.DTOs;

namespace MonitorParlamentar.Application.Interfaces;

public interface IRemuneracaoService
{
    Task<RemuneracaoAnualDto> GetRemuneracaoAsync(int apiId, int ano);
}
