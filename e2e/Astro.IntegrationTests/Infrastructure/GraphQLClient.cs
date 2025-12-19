using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Astro.IntegrationTests.Infrastructure;

/// <summary>
/// Helper class for sending GraphQL requests and loading payloads.
/// </summary>
public sealed class GraphQLClient(HttpClient httpClient, string payloadsBasePath)
{
    private const string GraphQLEndpoint = "/graphql";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    /// <summary>
    /// Executes a GraphQL query loaded from a payload file.
    /// </summary>
    /// <param name="payloadFileName">The name of the GraphQL payload file (without extension)</param>
    /// <param name="variables">Optional variables to pass to the query</param>
    /// <returns>The JSON response as a JsonDocument</returns>
    public async Task<JsonDocument> ExecuteAsync(string payloadFileName, object? variables = null)
    {
        var query = await LoadPayloadAsync(payloadFileName);
        return await SendGraphQLRequestAsync(query, variables);
    }

    /// <summary>
    /// Executes a GraphQL query and returns the raw JSON string for snapshot testing.
    /// </summary>
    /// <param name="payloadFileName">The name of the GraphQL payload file (without extension)</param>
    /// <param name="variables">Optional variables to pass to the query</param>
    /// <returns>The JSON response as a formatted string</returns>
    public async Task<string> ExecuteAndGetJsonAsync(string payloadFileName, object? variables = null)
    {
        var query = await LoadPayloadAsync(payloadFileName);
        return await SendGraphQLRequestAsStringAsync(query, variables);
    }

    /// <summary>
    /// Executes a raw GraphQL query string.
    /// </summary>
    /// <param name="query">The GraphQL query string</param>
    /// <param name="variables">Optional variables to pass to the query</param>
    /// <returns>The JSON response as a JsonDocument</returns>
    public async Task<JsonDocument> ExecuteRawAsync(string query, object? variables = null)
    {
        return await SendGraphQLRequestAsync(query, variables);
    }

    /// <summary>
    /// Executes a GraphQL query loaded from a payload file in a different module's payload directory.
    /// </summary>
    /// <param name="moduleName">The module name (e.g., "Products", "Orders")</param>
    /// <param name="payloadFileName">The name of the GraphQL payload file (without extension)</param>
    /// <param name="variables">Optional variables to pass to the query</param>
    /// <returns>The JSON response as a JsonDocument</returns>
    public async Task<JsonDocument> ExecuteFromModuleAsync(string moduleName, string payloadFileName, object? variables = null)
    {
        var filePath = Path.Combine(AppContext.BaseDirectory, moduleName, "Payloads", $"{payloadFileName}.graphql");

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"GraphQL payload file not found: {filePath}");
        }

        var query = await File.ReadAllTextAsync(filePath);
        return await SendGraphQLRequestAsync(query, variables);
    }

    /// <summary>
    /// Loads a GraphQL payload from a file.
    /// </summary>
    /// <param name="payloadFileName">The name of the payload file (without extension)</param>
    /// <returns>The GraphQL query string</returns>
    public async Task<string> LoadPayloadAsync(string payloadFileName)
    {
        var filePath = Path.Combine(payloadsBasePath, $"{payloadFileName}.graphql");

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"GraphQL payload file not found: {filePath}");
        }

        return await File.ReadAllTextAsync(filePath);
    }

    private async Task<JsonDocument> SendGraphQLRequestAsync(string query, object? variables)
    {
        var responseContent = await SendGraphQLRequestAsStringAsync(query, variables);
        return JsonDocument.Parse(responseContent);
    }

    private async Task<string> SendGraphQLRequestAsStringAsync(string query, object? variables)
    {
        var request = new GraphQLRequest
        {
            Query = query,
            Variables = variables
        };

        var jsonContent = JsonSerializer.Serialize(request, JsonOptions);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync(GraphQLEndpoint, content);

        // Read response content regardless of status code for debugging
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"GraphQL request failed with status {response.StatusCode}: {responseContent}");
        }

        // Reformat for consistent output
        using var doc = JsonDocument.Parse(responseContent);
        return JsonSerializer.Serialize(doc, JsonOptions);
    }

    private sealed class GraphQLRequest
    {
        [JsonPropertyName("query")]
        public required string Query { get; init; }

        [JsonPropertyName("variables")]
        public object? Variables { get; init; }
    }
}
