namespace MonitorParlamentar.Domain.Entities;

public class Parlamentar
{
    public int Id { get; set; }
    public int ApiId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? SiglaPartido { get; set; }
    public string? SiglaUf { get; set; }
    public string? FotoUrl { get; set; }
    public string Casa { get; set; } = "camara";
    public int Legislatura { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
