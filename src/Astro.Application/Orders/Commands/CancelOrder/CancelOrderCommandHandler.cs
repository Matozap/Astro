using Astro.Application.Common;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using Astro.Domain.Orders.Enums;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Orders.Commands.CancelOrder;

/// <summary>
/// Handler for CancelOrderCommand.
/// </summary>
public sealed class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand, Order>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CancelOrderCommandHandler> _logger;

    public CancelOrderCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork,
        ILogger<CancelOrderCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Order> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cancelling order {OrderId}", request.OrderId);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new OrderNotFoundException(request.OrderId);

        if (order.Status == OrderStatus.Cancelled)
        {
            _logger.LogWarning("Order {OrderId} is already cancelled", request.OrderId);
            return order;
        }

        order.Cancel(request.Reason, request.CancelledBy);

        _orderRepository.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Order {OrderId} cancelled successfully", request.OrderId);

        return order;
    }
}
