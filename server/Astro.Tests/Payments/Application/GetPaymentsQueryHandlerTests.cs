using Astro.Application.Payments.Queries.GetPayments;
using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Payments.Entities;
using Astro.Domain.Shared.ValueObjects;
using NSubstitute;
using Shouldly;
using Xunit;

namespace Astro.Tests.Payments.Application;

public class GetPaymentsQueryHandlerTests
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly GetPaymentsQueryHandler _handler;

    public GetPaymentsQueryHandlerTests()
    {
        _paymentRepository = Substitute.For<IPaymentRepository>();
        _handler = new GetPaymentsQueryHandler(_paymentRepository);
    }

    [Fact]
    public async Task Handle_ShouldReturnQueryableFromRepository()
    {
        var payments = new List<Payment>
        {
            Payment.Create(Guid.NewGuid(), Money.FromDecimal(100.00m, "USD"), "Credit Card"),
            Payment.Create(Guid.NewGuid(), Money.FromDecimal(250.50m, "USD"), "PayPal"),
            Payment.Create(Guid.NewGuid(), Money.FromDecimal(75.25m, "USD"), "Bank Transfer")
        };

        _paymentRepository.GetAll().Returns(payments.AsQueryable());

        var query = new GetPaymentsQuery();

        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(3);
    }

    [Fact]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyQueryable()
    {
        var emptyPayments = new List<Payment>();
        _paymentRepository.GetAll().Returns(emptyPayments.AsQueryable());
        var query = new GetPaymentsQuery();

        var result = await _handler.Handle(query, CancellationToken.None);

        result.ShouldNotBeNull();
        result.Count().ShouldBe(0);
    }
}
