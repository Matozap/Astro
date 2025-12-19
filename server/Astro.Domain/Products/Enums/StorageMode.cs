namespace Astro.Domain.Products.Enums;

/// <summary>
/// Defines where product images are stored.
/// </summary>
public enum StorageMode
{
    /// <summary>
    /// Images stored on local file system.
    /// </summary>
    FileSystem = 0,

    /// <summary>
    /// Images stored in Azure Blob Storage.
    /// </summary>
    Azure = 1,

    /// <summary>
    /// Images stored in Amazon S3.
    /// </summary>
    Aws = 2
}
