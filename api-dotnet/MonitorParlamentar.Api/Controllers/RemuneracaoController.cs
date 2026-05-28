using Microsoft.AspNetCore.Mvc;
using MonitorParlamentar.Application.Interfaces;

namespace MonitorParlamentar.Api.Controllers;

[ApiController]
[Route("api/parlamentares/{apiId:int}/remuneracao")]
public class RemuneracaoController(IRemuneracaoService remuneracaoService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRemuneracao(int apiId, [FromQuery] int? ano = null)
    {
        int anoFiltro = ano ?? DateTime.UtcNow.Year;
        var result = await remuneracaoService.GetRemuneracaoAsync(apiId, anoFiltro);
        return Ok(result);
    }
}
