using Microsoft.AspNetCore.Mvc;
using MonitorParlamentar.Application.Interfaces;

namespace MonitorParlamentar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DespesasController(IDespesasService despesasService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? ano = null,
        [FromQuery] int? mes = null,
        [FromQuery] string? tipoDespesa = null,
        [FromQuery] string? fornecedor = null,
        [FromQuery] string? partido = null,
        [FromQuery] string? uf = null,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20)
    {
        var result = await despesasService.GetAllAsync(ano, mes, tipoDespesa, fornecedor, partido, uf, page, perPage);
        return Ok(result);
    }

    [HttpGet("parlamentar/{parlamentarId}")]
    public async Task<IActionResult> GetByParlamentar(
        int parlamentarId,
        [FromQuery] int? ano = null,
        [FromQuery] int? mes = null,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20)
    {
        var result = await despesasService.GetByParlamentarAsync(parlamentarId, ano, mes, page, perPage);
        return Ok(result);
    }
}
