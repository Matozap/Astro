using Astro.Domain.Payments.Entities;
using Astro.Domain.Payments.Enums;
using Astro.Infrastructure.DataAccess.Common;
using Microsoft.EntityFrameworkCore;

namespace Astro.Infrastructure.DataAccess.Payments.Persistence;

/// <summary>
/// Seeds initial payment data into the database.
/// </summary>
public sealed class PaymentSeeder : ISeeder
{
    public int Order => 3; // Payments depend on orders

    public async Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Payments.AnyAsync(cancellationToken))
        {
            return false;
        }

        var orders = await context.Orders.ToListAsync(cancellationToken);
        var payments = CreatePayments(orders);

        context.Payments.AddRange(payments);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static List<Payment> CreatePayments(List<Domain.Orders.Entities.Order> orders)
    {
        var payments = new List<Payment>();

        // Payment scenarios: mix of statuses to demonstrate various payment states
        var paymentScenarios = new (int orderIndex, PaymentStatus status)[]
        {
            // Order 0: Successful payment on first attempt
            (0, PaymentStatus.Successful),

            // Order 1: Failed first attempt, successful second attempt (retry scenario)
            (1, PaymentStatus.Failed),
            (1, PaymentStatus.Successful),

            // Order 2: Still pending
            (2, PaymentStatus.Pending),

            // Order 3: Multiple failed attempts, still pending
            (3, PaymentStatus.Failed),
            (3, PaymentStatus.Failed),
            (3, PaymentStatus.Pending),

            // Order 4: Successful
            (4, PaymentStatus.Successful),

            // Order 5: Pending
            (5, PaymentStatus.Pending),

            // Order 6: Successful
            (6, PaymentStatus.Successful),

            // Order 7: Failed then successful
            (7, PaymentStatus.Failed),
            (7, PaymentStatus.Successful),

            // Order 8: Pending
            (8, PaymentStatus.Pending),

            // Order 9: Successful
            (9, PaymentStatus.Successful),

            // Additional payments for variety
            (0, PaymentStatus.Pending),    // Order 0 has another pending payment
            (2, PaymentStatus.Failed),     // Order 2 also has a failed payment
            (5, PaymentStatus.Successful), // Order 5 has successful payment
            (8, PaymentStatus.Failed)      // Order 8 has a failed payment
        };

        foreach (var (orderIndex, status) in paymentScenarios)
        {
            var order = orders[orderIndex];
            var paymentMethod = status switch
            {
                PaymentStatus.Successful => "Credit Card",
                PaymentStatus.Failed => "Bank Transfer",
                _ => "PayPal"
            };

            var payment = Payment.Create(order.Id, order.TotalAmount, paymentMethod);

            if (status != PaymentStatus.Pending)
            {
                payment.UpdateStatus(status);
            }

            if (status == PaymentStatus.Successful)
            {
                payment.SetTransactionId($"TXN-{Guid.NewGuid():N}");
            }

            payment.ClearDomainEvents();
            payments.Add(payment);
        }

        return payments;
    }
}
