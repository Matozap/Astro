using Astro.Domain.Orders.Entities;
using MediatR;

namespace Astro.Application.Orders.Commands.CreateOrder;

/// <summary>
/// Command to create a new order.
/// </summary>
public sealed record CreateOrderCommand(
    string CustomerName,
    string CustomerEmail,
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country,
    string? Notes,
    string CreatedBy,
    List<CreateOrderDetailDto> OrderDetails) : IRequest<Order>;

/// <summary>
/// DTO for order detail in create command.
/// </summary>
public sealed record CreateOrderDetailDto(Guid ProductId, int Quantity);
