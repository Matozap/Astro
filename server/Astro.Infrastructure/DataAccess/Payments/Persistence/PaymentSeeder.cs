using System.Reflection;
using Astro.Domain.Payments.Entities;
using Astro.Domain.Payments.Enums;
using Astro.Infrastructure.DataAccess.Common;
using Microsoft.EntityFrameworkCore;
using DomainOrder = Astro.Domain.Orders.Entities.Order;

namespace Astro.Infrastructure.DataAccess.Payments.Persistence;

/// <summary>
/// Seeds initial payment data into the database.
/// </summary>
public sealed class PaymentSeeder : ISeeder
{
    private static readonly Random Random = new(42); // Fixed seed for reproducibility

    private static readonly string[] PaymentMethods = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Apple Pay", "Google Pay"];

    public int Order => 3; // Payments depend on orders

    public async Task<bool> SeedAsync(AstroDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Payments.AnyAsync(cancellationToken))
        {
            return false;
        }

        var orders = await context.Orders.ToListAsync(cancellationToken);
        var payments = CreatePayments(orders, 20);

        context.Payments.AddRange(payments);
        await context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static List<Payment> CreatePayments(List<DomainOrder> orders, int targetCount)
    {
        var payments = new List<Payment>();

        // Select orders that should have payments (confirmed or later status typically have payment attempts)
        var ordersForPayments = orders
            .OrderBy(_ => Random.Next())
            .Take(Math.Min(targetCount, orders.Count))
            .ToList();

        foreach (var order in ordersForPayments)
        {
            var daysSinceOrder = (DateTimeOffset.UtcNow - order.CreatedAt).TotalDays;

            // Determine payment status based on order age and status
            var status = DeterminePaymentStatus(order, daysSinceOrder);
            var paymentMethod = PaymentMethods[Random.Next(PaymentMethods.Length)];

            var payment = Payment.Create(order.Id, order.TotalAmount, paymentMethod);

            // Set payment date relative to order date (usually same day or within a few hours)
            var paymentDate = order.CreatedAt.AddMinutes(Random.Next(5, 120));
            SetCreatedAt(payment, paymentDate);

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

            // Some orders have retry payments (failed then successful)
            if (status == PaymentStatus.Failed && Random.Next(100) < 60)
            {
                var retryPayment = CreateRetryPayment(order, paymentDate);
                payments.Add(retryPayment);
            }
        }

        // Trim to target count if we exceeded due to retry payments
        return payments.Take(targetCount).ToList();
    }

    private static PaymentStatus DeterminePaymentStatus(DomainOrder order, double daysSinceOrder)
    {
        // Future orders or very recent - mostly pending
        if (daysSinceOrder < 0)
        {
            return Random.Next(100) < 90 ? PaymentStatus.Pending : PaymentStatus.Successful;
        }

        // Recent orders (< 3 days) - mix of pending and successful
        if (daysSinceOrder < 3)
        {
            var roll = Random.Next(100);
            if (roll < 50) return PaymentStatus.Successful;
            if (roll < 80) return PaymentStatus.Pending;
            return PaymentStatus.Failed;
        }

        // Older orders - mostly successful with some failures
        var statusRoll = Random.Next(100);
        if (statusRoll < 75) return PaymentStatus.Successful;
        if (statusRoll < 90) return PaymentStatus.Failed;
        return PaymentStatus.Pending;
    }

    private static Payment CreateRetryPayment(DomainOrder order, DateTimeOffset originalPaymentDate)
    {
        var retryPaymentMethod = PaymentMethods[Random.Next(PaymentMethods.Length)];
        var retryPayment = Payment.Create(order.Id, order.TotalAmount, retryPaymentMethod);

        // Retry usually happens hours or a day later
        var retryDate = originalPaymentDate.AddHours(Random.Next(1, 48));
        SetCreatedAt(retryPayment, retryDate);

        // Retry is usually successful
        if (Random.Next(100) < 80)
        {
            retryPayment.UpdateStatus(PaymentStatus.Successful);
            retryPayment.SetTransactionId($"TXN-{Guid.NewGuid():N}");
        }
        else
        {
            retryPayment.UpdateStatus(PaymentStatus.Pending);
        }

        retryPayment.ClearDomainEvents();
        return retryPayment;
    }

    private static void SetCreatedAt(Payment payment, DateTimeOffset date)
    {
        var property = typeof(Payment).GetProperty("CreatedAt", BindingFlags.Public | BindingFlags.Instance);
        property?.SetValue(payment, date);
    }
}
