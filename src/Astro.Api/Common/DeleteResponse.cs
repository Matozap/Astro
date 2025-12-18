namespace Astro.Api.Common;

public class DeleteResponse(Guid objectDeleted)
{
    public DateTimeOffset ExecutedAt { get; init; } = DateTimeOffset.UtcNow;
    public Guid ObjectDeleted { get; init; } = objectDeleted;
}