namespace MonitorParlamentar.Application.DTOs;

public class PagedResultDto<T>
{
    public IEnumerable<T> Data { get; set; } = [];
    public PaginationMeta Meta { get; set; } = new();
}

public class PaginationMeta
{
    public int Total { get; set; }
    public int PerPage { get; set; }
    public int CurrentPage { get; set; }
    public int LastPage { get; set; }
    public int FirstPage { get; set; } = 1;
}
