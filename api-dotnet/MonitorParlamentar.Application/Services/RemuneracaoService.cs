using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using MonitorParlamentar.Application.DTOs;
using MonitorParlamentar.Application.Interfaces;

namespace MonitorParlamentar.Application.Services;

public partial class RemuneracaoService(HttpClient httpClient, IMemoryCache cache) : IRemuneracaoService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);
    private const string BaseUrl = "https://www.camara.leg.br/deputados/{0}/remuneracao?ano={1}";

    public async Task<RemuneracaoAnualDto> GetRemuneracaoAsync(int apiId, int ano)
    {
        var cacheKey = $"remuneracao:{apiId}:{ano}";

        if (cache.TryGetValue(cacheKey, out RemuneracaoAnualDto? cached) && cached is not null)
            return cached;

        var url = string.Format(BaseUrl, apiId, ano);
        var html = await httpClient.GetStringAsync(url);

        var meses = ParseRemuneracao(html, apiId);

        var result = new RemuneracaoAnualDto
        {
            ApiId = apiId,
            Ano = ano,
            Meses = meses,
            TotalAnual = meses.Sum(m => m.Valor),
        };

        cache.Set(cacheKey, result, CacheDuration);

        return result;
    }

    private static List<RemuneracaoMensalDto> ParseRemuneracao(string html, int apiId)
    {
        var results = new List<RemuneracaoMensalDto>();

        // Match each <tr> that contains a month cell and a value cell
        // Pattern targets rows like:
        //   <td class="text-center">01</td>
        //   <td class="text-right"><a href="...">46.366,191</a></td>
        var rowRegex = RowRegex();
        var matches = rowRegex.Matches(html);

        foreach (Match match in matches)
        {
            if (!int.TryParse(match.Groups["mes"].Value.Trim(), out int mes))
                continue;

            var valorStr = match.Groups["valor"].Value.Trim();
            // Brazilian number format: 46.366,191  → remove dots, replace comma with dot
            var normalised = valorStr.Replace(".", "").Replace(",", ".");
            if (!decimal.TryParse(normalised, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal valor))
                continue;

            var url = match.Groups["url"].Value.Trim();

            results.Add(new RemuneracaoMensalDto
            {
                Mes = mes,
                Valor = valor,
                UrlDetalhe = string.IsNullOrEmpty(url) ? null : url,
            });
        }

        return results;
    }

    // Matches a full table row containing a month and its salary link
    [GeneratedRegex(
        @"<tr>\s*<td[^>]*>\s*(?<mes>\d{1,2})\s*</td>\s*<td[^>]*>\s*<a\s+href=""(?<url>[^""]*)""\s*>\s*(?<valor>[\d.,]+)\s*</a>\s*</td>\s*</tr>",
        RegexOptions.IgnoreCase | RegexOptions.Singleline)]
    private static partial Regex RowRegex();
}
