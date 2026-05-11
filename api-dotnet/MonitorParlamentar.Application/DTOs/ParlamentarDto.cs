namespace MonitorParlamentar.Application.DTOs;

public class ParlamentarDto
{
    public int Id { get; set; }
    public int ApiId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? SiglaPartido { get; set; }
    public string? SiglaUf { get; set; }
    public string? FotoUrl { get; set; }
    public int Legislatura { get; set; }
    public decimal TotalGasto { get; set; }
}

public class ParlamentarDetalheDto
{
    public int Id { get; set; }
    public int ApiId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? SiglaPartido { get; set; }
    public string? SiglaUf { get; set; }
    public string? FotoUrl { get; set; }
    public string Casa { get; set; } = "camara";
    public int Legislatura { get; set; }
    public int Ano { get; set; }
    public decimal TotalGasto { get; set; }
    public IEnumerable<GastoPorCategoriaDto> PorCategoria { get; set; } = [];
    public IEnumerable<GastoPorMesDto> PorMes { get; set; } = [];
}

public class GastoPorCategoriaDto
{
    public string? TipoDespesa { get; set; }
    public decimal Total { get; set; }
    public long Qtd { get; set; }
}

public class GastoPorMesDto
{
    public int Mes { get; set; }
    public decimal Total { get; set; }
}
