using Astro.Domain.Products.Enums;

namespace Astro.Api.Products.GraphQL.Types;

/// <summary>
/// GraphQL enum type for StorageMode.
/// </summary>
public class StorageModeType : EnumType<StorageMode>
{
    protected override void Configure(IEnumTypeDescriptor<StorageMode> descriptor)
    {
        descriptor.Name("StorageMode");
        descriptor.Description("The storage mode for product images.");

        descriptor.Value(StorageMode.FileSystem)
            .Description("Stored on the file system.");

        descriptor.Value(StorageMode.Azure)
            .Description("Stored in Azure Blob Storage.");

        descriptor.Value(StorageMode.Aws)
            .Description("Stored in AWS S3.");
    }
}
