using Astro.Application.Common;
using Astro.Application.Orders.Exceptions;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Payments.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Payments.Commands.CreatePayment;

/// <summary>
/// Handler for CreatePaymentCommand.
/// </summary>
public sealed class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Payment>
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreatePaymentCommandHandler> _logger;

    public CreatePaymentCommandHandler(
        IPaymentRepository paymentRepository,
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreatePaymentCommandHandler> logger)
    {
        _paymentRepository = paymentRepository;
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Payment> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating payment for order {OrderId}", request.OrderId);

        // Validate order exists
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order is null)
        {
            throw new OrderNotFoundException(request.OrderId);
        }

        // Create the payment
        var payment = Payment.Create(request.OrderId);

        await _paymentRepository.AddAsync(payment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment {PaymentId} created for order {OrderId}", payment.Id, request.OrderId);

        return payment;
    }
}
