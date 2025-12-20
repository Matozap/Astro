using Astro.Application.Common;
using Astro.Application.Payments.Exceptions;
using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Payments.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Astro.Application.Payments.Commands.UpdatePaymentStatus;

/// <summary>
/// Handler for UpdatePaymentStatusCommand.
/// </summary>
public sealed class UpdatePaymentStatusCommandHandler : IRequestHandler<UpdatePaymentStatusCommand, Payment>
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdatePaymentStatusCommandHandler> _logger;

    public UpdatePaymentStatusCommandHandler(
        IPaymentRepository paymentRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdatePaymentStatusCommandHandler> logger)
    {
        _paymentRepository = paymentRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Payment> Handle(UpdatePaymentStatusCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating status for payment {PaymentId} to {NewStatus}", request.PaymentId, request.NewStatus);

        var payment = await _paymentRepository.GetByIdAsync(request.PaymentId, cancellationToken)
            ?? throw new PaymentNotFoundException(request.PaymentId);

        var oldStatus = payment.Status;
        payment.UpdateStatus(request.NewStatus);

        _paymentRepository.Update(payment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Payment {PaymentId} status changed from {OldStatus} to {NewStatus}",
            request.PaymentId,
            oldStatus,
            request.NewStatus);

        return payment;
    }
}
