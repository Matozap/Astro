using Astro.Domain.Payments.Entities;
using MediatR;

namespace Astro.Application.Payments.Queries.GetPayments;

/// <summary>
/// Query to get all payments.
/// </summary>
public sealed record GetPaymentsQuery : IRequest<IQueryable<Payment>>;
