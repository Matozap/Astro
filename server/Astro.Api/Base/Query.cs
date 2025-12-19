using Astro.Api.Base.Models;
using Astro.Api.Base.Options;
using Microsoft.Extensions.Options;

namespace Astro.Api.Base;

/// <summary>
/// Root GraphQL query type with utility operations.
/// </summary>
public class Query
{
    /// <summary>
    /// Returns the current server time in UTC.
    /// </summary>
    public DateTime ServerTime() => DateTime.UtcNow;

    /// <summary>
    /// Returns API version information.
    /// </summary>
    public ApiInfo ApiInfo([Service] IOptions<ApiInfoOptions> options, [Service] IHostEnvironment environment)
        => new(options.Value, environment);
}
