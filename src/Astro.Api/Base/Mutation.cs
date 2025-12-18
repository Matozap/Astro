namespace Astro.Api.Base;

/// <summary>
/// Root GraphQL mutation type.
/// </summary>
public class Mutation
{
    /// <summary>
    /// A no-op mutation useful for testing connectivity and mutation pipeline.
    /// Returns the input message back.
    /// </summary>
    public string Echo(string message) => message;
}
