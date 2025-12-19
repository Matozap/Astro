using Xunit;

namespace Astro.IntegrationTests.Infrastructure;

/// <summary>
/// Base class for integration tests using a shared Aspire application fixture.
/// </summary>
[Collection("Integration")]
public abstract class IntegrationTestBase
{
    protected IntegrationTestBase(IntegrationTestFixture fixture)
    {
        HttpClient = fixture.HttpClient;
        GraphClient = new GraphQLClient(HttpClient, PayloadsBasePath);
    }

    /// <summary>
    /// Gets the GraphQL client for executing queries and mutations.
    /// </summary>
    protected GraphQLClient GraphClient { get; }

    /// <summary>
    /// Gets the HTTP client for direct API calls.
    /// </summary>
    private HttpClient HttpClient { get; }

    /// <summary>
    /// Gets the base path for GraphQL payload files.
    /// Must be overridden by derived classes to specify their payload directory.
    /// </summary>
    protected abstract string PayloadsBasePath { get; }
}
