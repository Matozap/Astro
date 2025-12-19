using Astro.Application.Common;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Orders.Commands.UpdateOrder;

/// <summary>
/// Handler for UpdateOrderCommand.
/// </summary>
public sealed class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, Order>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateOrderCommandHandler> _logger;

    public UpdateOrderCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Order> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating order {OrderId}", request.Id);

        var order = await _orderRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new OrderNotFoundException(request.Id);

        // Update customer info
        order.UpdateCustomerInfo(
            customerName: request.CustomerName,
            customerEmail: request.CustomerEmail,
            notes: request.Notes,
            modifiedBy: request.ModifiedBy);

        // Update shipping address if provided
        if (request.Street is not null &&
            request.City is not null &&
            request.State is not null &&
            request.PostalCode is not null &&
            request.Country is not null)
        {
            order.UpdateShippingAddress(
                street: request.Street,
                city: request.City,
                state: request.State,
                postalCode: request.PostalCode,
                country: request.Country,
                modifiedBy: request.ModifiedBy);
        }

        _orderRepository.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Order {OrderId} updated successfully", request.Id);

        return order;
    }
}
