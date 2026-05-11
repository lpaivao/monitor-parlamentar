using Microsoft.AspNetCore.Mvc;
using MonitorParlamentar.Application.Interfaces;

namespace MonitorParlamentar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParlamentaresController(IParlamentaresService parlamentaresService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? nome = null,
        [FromQuery] string? partido = null,
        [FromQuery] string? uf = null,
        [FromQuery] int? legislatura = null,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] int? ano = null)
    {
        var result = await parlamentaresService.GetAllAsync(nome, partido, uf, legislatura, page, perPage, ano);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] int? ano = null)
    {
        var result = await parlamentaresService.GetByIdAsync(id, ano);
        if (result == null)
            return NotFound();

        return Ok(result);
    }
}
