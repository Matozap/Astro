using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Payments.Entities;
using MediatR;

namespace Astro.Application.Payments.Queries.GetPayments;

/// <summary>
/// Handler for GetPaymentsQuery.
/// Returns IQueryable for deferred execution and LINQ composition.
/// </summary>
public sealed class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, IQueryable<Payment>>
{
    private readonly IPaymentRepository _paymentRepository;

    public GetPaymentsQueryHandler(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public Task<IQueryable<Payment>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(_paymentRepository.GetAll());
    }
}
