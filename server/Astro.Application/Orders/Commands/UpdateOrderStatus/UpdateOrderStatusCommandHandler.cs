using Astro.Application.Common;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Orders.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Orders.Commands.UpdateOrderStatus;

/// <summary>
/// Handler for UpdateOrderStatusCommand.
/// </summary>
public sealed class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, Order>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateOrderStatusCommandHandler> _logger;

    public UpdateOrderStatusCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateOrderStatusCommandHandler> logger)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Order> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating status for order {OrderId} to {NewStatus}", request.OrderId, request.NewStatus);

        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new OrderNotFoundException(request.OrderId);

        var oldStatus = order.Status;
        order.UpdateStatus(request.NewStatus, request.ModifiedBy);

        _orderRepository.Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Order {OrderId} status changed from {OldStatus} to {NewStatus}",
            request.OrderId,
            oldStatus,
            request.NewStatus);

        return order;
    }
}
