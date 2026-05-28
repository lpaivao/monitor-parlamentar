namespace MonitorParlamentar.Application.DTOs;

public class RemuneracaoMensalDto
{
    public int Mes { get; set; }
    public decimal Valor { get; set; }
    public string? UrlDetalhe { get; set; }
}

public class RemuneracaoAnualDto
{
    public int ApiId { get; set; }
    public int Ano { get; set; }
    public IEnumerable<RemuneracaoMensalDto> Meses { get; set; } = [];
    public decimal TotalAnual { get; set; }
}
