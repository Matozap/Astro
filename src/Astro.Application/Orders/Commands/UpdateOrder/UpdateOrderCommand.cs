using Astro.Domain.Orders.Entities;
using MediatR;

namespace Astro.Application.Orders.Commands.UpdateOrder;

/// <summary>
/// Command to update an existing order.
/// </summary>
public sealed record UpdateOrderCommand(
    Guid Id,
    string? CustomerName,
    string? CustomerEmail,
    string? Street,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? Notes,
    string ModifiedBy) : IRequest<Order>;
