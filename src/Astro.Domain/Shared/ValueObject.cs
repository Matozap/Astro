namespace Astro.Domain.Shared;

/// <summary>
/// Base record for value objects.
/// Value objects are immutable and compared by their properties.
/// Using C# records provides built-in equality, immutability, and with-expressions.
/// </summary>
public abstract record ValueObject
{
    /// <summary>
    /// Override to provide custom validation logic.
    /// Called during construction to enforce invariants.
    /// </summary>
    protected virtual void Validate() { }
}
