using Microsoft.AspNetCore.Mvc;
using MonitorParlamentar.Application.Interfaces;

namespace MonitorParlamentar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RankingController(IRankingService rankingService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetTopParlamentares(
        [FromQuery] int ano = 2024,
        [FromQuery] string? partido = null,
        [FromQuery] string? uf = null,
        [FromQuery] int limit = 100)
    {
        var result = await rankingService.GetTopParlamentaresAsync(ano, partido, uf, limit);
        return Ok(result);
    }

    [HttpGet("categorias")]
    public async Task<IActionResult> GetPorCategoria(
        [FromQuery] int ano = 2024,
        [FromQuery] string? partido = null)
    {
        var result = await rankingService.GetPorCategoriaAsync(ano, partido);
        return Ok(result);
    }

    [HttpGet("partidos")]
    public async Task<IActionResult> GetPorPartido(
        [FromQuery] int ano = 2024)
    {
        var result = await rankingService.GetPorPartidoAsync(ano);
        return Ok(result);
    }
}
