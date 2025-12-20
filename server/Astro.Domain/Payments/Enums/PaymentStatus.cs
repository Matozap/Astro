namespace Astro.Domain.Payments.Enums;

/// <summary>
/// Represents the status of a payment
/// </summary>
public enum PaymentStatus
{
    /// <summary>
    /// Payment has been initiated but not yet processed
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Payment was processed successfully
    /// </summary>
    Successful = 1,

    /// <summary>
    /// Payment processing failed
    /// </summary>
    Failed = 2
}

/// <summary>
/// Extension methods for PaymentStatus enum
/// </summary>
public static class PaymentStatusExtensions
{
    /// <summary>
    /// Determines if a transition from the current status to the target status is valid
    /// </summary>
    /// <param name="current">The current payment status</param>
    /// <param name="target">The target payment status</param>
    /// <returns>True if the transition is allowed, false otherwise</returns>
    public static bool CanTransitionTo(this PaymentStatus current, PaymentStatus target)
    {
        // Pending can transition to Successful or Failed
        if (current == PaymentStatus.Pending)
            return target is PaymentStatus.Successful or PaymentStatus.Failed;

        // Terminal states (Successful and Failed) cannot transition
        return false;
    }

    /// <summary>
    /// Determines if the payment status is terminal (cannot transition to another status)
    /// </summary>
    /// <param name="status">The payment status to check</param>
    /// <returns>True if the status is terminal, false otherwise</returns>
    public static bool IsTerminal(this PaymentStatus status)
        => status is PaymentStatus.Successful or PaymentStatus.Failed;
}
