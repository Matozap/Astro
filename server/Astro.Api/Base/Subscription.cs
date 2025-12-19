namespace Astro.Api.Base;

/// <summary>
/// Root GraphQL subscription type.
/// </summary>
public class Subscription
{
    /// <summary>
    /// A heartbeat subscription that confirms the subscription pipeline is working.
    /// Clients can use this to verify WebSocket connectivity.
    /// </summary>
    [Subscribe]
    [Topic(nameof(OnHeartbeat))]
    public DateTime OnHeartbeat([EventMessage] DateTime timestamp) => timestamp;
}
