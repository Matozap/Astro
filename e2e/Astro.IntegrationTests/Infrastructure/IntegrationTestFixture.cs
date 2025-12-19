using Aspire.Hosting;
using Aspire.Hosting.ApplicationModel;
using Aspire.Hosting.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace Astro.IntegrationTests.Infrastructure;

/// <summary>
/// Shared fixture for integration tests that provides a single Aspire application instance.
/// </summary>
public sealed class IntegrationTestFixture : IAsyncLifetime
{
    private const int CancellationTimeoutInSeconds = 180;
    private DistributedApplication? _app;
    private HttpClient? _httpClient;

    public HttpClient HttpClient => _httpClient
        ?? throw new InvalidOperationException("HTTP client not initialized. Ensure InitializeAsync has completed.");

    public async Task InitializeAsync()
    {
        using var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(CancellationTimeoutInSeconds));
        var appHost = await DistributedApplicationTestingBuilder
            .CreateAsync<Projects.Astro_AppHost>(cancellationTokenSource.Token);

        _app = await appHost.BuildAsync(cancellationTokenSource.Token);

        var resourceNotificationService = _app.Services.GetRequiredService<ResourceNotificationService>();
        await _app.StartAsync(cancellationTokenSource.Token);

        // Wait for the API to be running
        await resourceNotificationService.WaitForResourceAsync("astro-api", KnownResourceStates.Running, cancellationTokenSource.Token)
            .WaitAsync(TimeSpan.FromSeconds(120), cancellationTokenSource.Token);

        // Create HTTP client for the API
        _httpClient = _app.CreateHttpClient("astro-api");
    }

    public async Task DisposeAsync()
    {
        _httpClient?.Dispose();

        if (_app is not null)
        {
            await _app.StopAsync();
            await _app.DisposeAsync();
        }
    }
}

/// <summary>
/// Collection definition for integration tests that share the same Aspire application.
/// </summary>
[CollectionDefinition("Integration")]
public class IntegrationTestCollection : ICollectionFixture<IntegrationTestFixture>
{
}
