namespace MonitorParlamentar.Domain.Entities;

public class Despesa
{
    public int Id { get; set; }
    public int ParlamentarId { get; set; }
    public int Ano { get; set; }
    public int? Mes { get; set; }
    public string? TipoDespesa { get; set; }
    public string? Fornecedor { get; set; }
    public string? CnpjCpf { get; set; }
    public decimal ValorDocumento { get; set; }
    public decimal ValorLiquido { get; set; }
    public string? NumeroDocumento { get; set; }
    public string? UrlDocumento { get; set; }
    public DateOnly? DataEmissao { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
