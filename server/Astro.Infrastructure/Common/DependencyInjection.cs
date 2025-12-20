using Astro.Application.Common;
using Astro.Domain.Orders.Abstractions;
using Astro.Domain.Payments.Abstractions;
using Astro.Domain.Products.Abstractions;
using Astro.Infrastructure.Orders.Persistence;
using Astro.Infrastructure.Payments.Persistence;
using Astro.Infrastructure.Products.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Astro.Infrastructure.Common;

/// <summary>
/// Extension methods for registering Infrastructure layer services.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Infrastructure layer services to the dependency injection container.
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // Register Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Register Repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();

        return services;
    }

    /// <summary>
    /// Configures the AstroDbContext with Aspire PostgreSQL integration.
    /// </summary>
    public static IHostApplicationBuilder AddAstroDbContext(this IHostApplicationBuilder builder, string connectionName = "astrodb")
    {
        builder.AddNpgsqlDbContext<AstroDbContext>(connectionName, configureDbContextOptions: options =>
        {
            options.UseNpgsql(npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(AstroDbContext).Assembly.FullName);
            });
        });

        return builder;
    }
}
