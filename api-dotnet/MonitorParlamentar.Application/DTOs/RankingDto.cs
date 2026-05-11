namespace MonitorParlamentar.Application.DTOs;

public class RankingItemDto
{
    public int Posicao { get; set; }
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? SiglaPartido { get; set; }
    public string? SiglaUf { get; set; }
    public string? FotoUrl { get; set; }
    public decimal TotalGasto { get; set; }
    public long QtdDespesas { get; set; }
}

public class RankingCategoriaDto
{
    public string? Categoria { get; set; }
    public decimal Total { get; set; }
    public long QtdDespesas { get; set; }
}

public class RankingPartidoDto
{
    public string? Partido { get; set; }
    public decimal Total { get; set; }
    public long QtdParlamentares { get; set; }
    public decimal MediaPorParlamentar { get; set; }
}
