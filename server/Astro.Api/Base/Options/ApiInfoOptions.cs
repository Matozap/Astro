namespace Astro.Api.Base.Options;

/// <summary>
/// Configuration options for API information exposed via GraphQL.
/// </summary>
public class ApiInfoOptions
{
    /// <summary>
    /// Configuration section name.
    /// </summary>
    public const string SectionName = "ApiInfo";

    /// <summary>
    /// The API name.
    /// </summary>
    public string Name { get; set; } = "Astro GraphQL API";

    /// <summary>
    /// The API version.
    /// </summary>
    public string Version { get; set; } = "1.0.0";

    /// <summary>
    /// The API description.
    /// </summary>
    public string Description { get; set; } = string.Empty;
}
