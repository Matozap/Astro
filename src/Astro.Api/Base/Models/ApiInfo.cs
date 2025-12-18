using Astro.Api.Base.Options;

namespace Astro.Api.Base.Models;

/// <summary>
/// API information and metadata.
/// </summary>
public class ApiInfo(ApiInfoOptions options, IHostEnvironment environment)
{
    private static readonly DateTime StartupTimeUtc = DateTime.UtcNow;

    /// <summary>
    /// The API name.
    /// </summary>
    public string Name { get; } = options.Name;

    /// <summary>
    /// The API version.
    /// </summary>
    public string Version { get; } = options.Version;

    /// <summary>
    /// The API description.
    /// </summary>
    public string Description { get; } = options.Description;

    /// <summary>
    /// The server environment.
    /// </summary>
    public string Environment { get; } = environment.EnvironmentName;

    /// <summary>
    /// Server startup time in UTC.
    /// </summary>
    public DateTime StartupTime => StartupTimeUtc;

    /// <summary>
    /// Server uptime in seconds.
    /// </summary>
    public double UptimeSeconds => (DateTime.UtcNow - StartupTimeUtc).TotalSeconds;
}