# Feature Specification: Product Management with Safe Deletion

**Feature Branch**: `feature/ui-commands`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "I want to be able to create, edit, deactivate (0 stock) and delete products but we need to consider this: A product cannot be deleted if already used in an order, in that case the button should be Deactivate and show a dialog with a warning that the stock will reset to 0. When creating or editing a product, you could add several images but only one that is primary. The images could be either URLS from AWS or Azure. Selecting any of Azure or AWS doesn't really matter, it just need to be an URL. You should be able to add, edit or delete image details."

## User Scenarios & Testing

### User Story 1 - Create New Product with Images (Priority: P1)

An admin user needs to add a new product to the catalog, including basic product information and product images with one designated as the primary display image.

**Why this priority**: This is the foundational operation for inventory management. Without the ability to create products, no other product operations are possible. This delivers immediate value by enabling catalog building.

**Independent Test**: Can be fully tested by creating a product with name, price, stock quantity, and multiple images (with one primary), then verifying the product appears in the catalog with the correct primary image displayed.

**Acceptance Scenarios**:

1. **Given** the admin is on the product creation form, **When** they enter product details (name, description, price, SKU, stock quantity) and add multiple image URLs with one marked as primary, **Then** the product is created successfully with all images attached and the primary image designated
2. **Given** the admin is adding images to a product, **When** they specify image URLs from cloud storage (AWS or Azure), **Then** the system accepts and stores the URLs regardless of the cloud provider
3. **Given** the admin is creating a product with multiple images, **When** they mark one image as primary, **Then** that image becomes the default display image for the product
4. **Given** the admin is creating a product, **When** they don't provide all required fields, **Then** the system shows validation errors and prevents creation

---

### User Story 2 - Edit Existing Product and Manage Images (Priority: P2)

An admin user needs to update product information and manage product images, including adding new images, editing image details, removing images, and changing which image is primary.

**Why this priority**: Products require ongoing maintenance as prices change, descriptions improve, or inventory levels adjust. Image management is essential for keeping product listings current and appealing.

**Independent Test**: Can be fully tested by editing an existing product's details, adding/removing/editing images, and changing the primary image designation, then verifying all changes are persisted and displayed correctly.

**Acceptance Scenarios**:

1. **Given** the admin is viewing a product, **When** they edit product details (name, description, price, stock) and save, **Then** the changes are persisted and reflected immediately
2. **Given** a product has existing images, **When** the admin adds new image URLs, **Then** the new images are added to the product's image gallery
3. **Given** a product has multiple images, **When** the admin changes which image is marked as primary, **Then** the new primary image becomes the default display image
4. **Given** a product has multiple images, **When** the admin removes a non-primary image, **Then** the image is deleted from the product
5. **Given** a product's primary image is the only image, **When** the admin attempts to remove it, **Then** the system prevents removal and shows a warning that at least one image must remain, or allows removal if adding a new primary image simultaneously
6. **Given** a product has images, **When** the admin edits image details (such as the URL or storage provider), **Then** the image details are updated

---

### User Story 3 - Delete Unused Product (Priority: P3)

An admin user needs to permanently remove a product that has never been ordered from the system.

**Why this priority**: Allows cleanup of test products, discontinued items that were never sold, or incorrectly created products. This is lower priority because deactivation serves most cleanup needs.

**Independent Test**: Can be fully tested by creating a product that has no associated orders, attempting deletion, and verifying the product is permanently removed from the system.

**Acceptance Scenarios**:

1. **Given** a product exists that has never been included in any order, **When** the admin clicks the delete button and confirms, **Then** the product is permanently removed from the system
2. **Given** a product exists with no orders, **When** the admin views the product actions, **Then** a "Delete" button is displayed
3. **Given** the admin has clicked delete on an unused product, **When** they are shown a confirmation dialog, **Then** they can either confirm deletion or cancel the operation

---

### User Story 4 - Deactivate Product Used in Orders (Priority: P2)

An admin user needs to remove a product from active catalog that has been ordered previously, while preserving historical order data.

**Why this priority**: Critical for maintaining data integrity. Products referenced in historical orders cannot be deleted without breaking order history. Deactivation provides a safe alternative while preventing new orders.

**Independent Test**: Can be fully tested by creating a product, including it in an order, then attempting to delete it and verifying the system prevents deletion and offers deactivation instead, which sets stock to 0 and marks the product inactive.

**Acceptance Scenarios**:

1. **Given** a product exists that has been included in one or more orders, **When** the admin views the product actions, **Then** the "Delete" button is replaced with a "Deactivate" button
2. **Given** a product used in orders is being deactivated, **When** the admin clicks "Deactivate", **Then** a warning dialog appears explaining that stock will be reset to 0 and the product will be hidden from the catalog
3. **Given** the admin has confirmed deactivation, **When** the deactivation completes, **Then** the product's stock is set to 0, IsActive is set to false, and the product no longer appears in active catalog listings
4. **Given** a product has been deactivated, **When** viewing order history, **Then** the product details are still visible in past orders

---

### User Story 5 - Manually Deactivate Any Product (Priority: P3)

An admin user needs to temporarily remove a product from the active catalog without deleting it, regardless of whether it has been ordered.

**Why this priority**: Provides flexibility for seasonal products, out-of-stock items, or products under review. Lower priority because it's a subset of the automatic deactivation flow.

**Independent Test**: Can be fully tested by manually deactivating a product through the edit form, then verifying it no longer appears in customer-facing catalog but remains in admin views.

**Acceptance Scenarios**:

1. **Given** the admin is editing any product, **When** they set the stock to 0 or toggle the "Active" status to inactive and save, **Then** the product is deactivated and hidden from the active catalog
2. **Given** a product has been manually deactivated, **When** the admin views the product list with filters, **Then** they can choose to show inactive products
3. **Given** an inactive product exists, **When** the admin edits it and sets stock above 0 and/or sets IsActive to true, **Then** the product is reactivated and appears in the active catalog

---

### Edge Cases

- What happens when an admin tries to set multiple images as primary simultaneously? System should enforce only one primary image.
- What happens when a product is deleted while an admin is creating an order with that product? If product is deleted (unused), order creation should fail gracefully with a clear error message. If product is deactivated, it should not be available for new order selection.
- What happens when an admin provides an invalid image URL (malformed, unreachable, or non-image content)? System should validate URL format but may accept any valid URL, as cloud storage URLs are pre-signed and validated by the storage provider.
- What happens when a product has been deactivated but an admin wants to permanently delete it? The delete operation should still check for order usage and prevent deletion if orders exist, even for inactive products.
- What happens when an admin removes the primary image and adds a new image simultaneously? System should designate the new image as primary automatically.
- What happens when viewing a product whose image URLs are no longer valid (expired, deleted from storage)? The UI should handle missing images gracefully with placeholder images.

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow administrators to create new products with name, description, price, SKU, initial stock quantity, low stock threshold, and active status
- **FR-002**: System MUST allow administrators to update all product fields for existing products
- **FR-003**: System MUST allow administrators to add multiple image URLs to products during creation or editing
- **FR-004**: System MUST enforce that exactly one product image is marked as primary at all times when images exist
- **FR-005**: System MUST accept image URLs from any cloud storage provider (AWS S3, Azure Blob Storage, or others)
- **FR-006**: System MUST allow administrators to add new images to existing products
- **FR-007**: System MUST allow administrators to remove images from products (except when it would leave zero images or remove the only/primary image without replacement)
- **FR-008**: System MUST allow administrators to change which image is designated as primary
- **FR-009**: System MUST allow administrators to edit image details (URL, storage mode)
- **FR-010**: System MUST check if a product has been used in any orders before allowing deletion
- **FR-011**: System MUST prevent deletion of products that appear in one or more orders
- **FR-012**: System MUST display a "Delete" button for products that have never been ordered
- **FR-013**: System MUST display a "Deactivate" button instead of "Delete" for products that have been ordered
- **FR-014**: System MUST show a warning dialog when deactivating a product, explaining that stock will be reset to 0
- **FR-015**: System MUST set stock to 0 and IsActive to false when a product is deactivated
- **FR-016**: System MUST allow administrators to manually deactivate products by setting stock to 0 or IsActive to false
- **FR-017**: System MUST hide deactivated products from customer-facing catalog views
- **FR-018**: System MUST preserve product data in historical orders even after product deactivation
- **FR-019**: System MUST allow administrators to reactivate deactivated products by setting stock above 0 and/or IsActive to true
- **FR-020**: System MUST require confirmation before permanently deleting a product
- **FR-021**: System MUST validate that required product fields (name, price, SKU) are provided before creation or update
- **FR-022**: System MUST provide filtering options to show/hide inactive products in admin product lists

### Non-Functional Requirements

- **NFR-001**: Product deletion check for order usage should complete within 2 seconds
- **NFR-002**: Image URL validation should verify URL format but not require URL accessibility checks (cloud storage URLs may be pre-signed and time-limited)
- **NFR-003**: Deactivation operations should complete within 1 second

### Key Entities

- **Product**: Represents an item in the catalog with properties including name, description, price, SKU, stock quantity, low stock threshold, IsActive status, and a collection of product images
- **ProductImage**: Represents an image associated with a product, including image URL, storage mode (AWS/Azure/Other), IsPrimary flag, and metadata (filename, creation date, creator)
- **Order**: Represents a customer order that may reference products; maintains a snapshot of product data at order time
- **OrderDetail**: Represents line items in an order with ProductId reference, allowing the system to check if a product has been ordered

## Success Criteria

### Measurable Outcomes

- **SC-001**: Administrators can create a product with multiple images in under 3 minutes
- **SC-002**: Administrators can update product details including image management in under 2 minutes
- **SC-003**: System prevents 100% of attempts to delete products that have been ordered, maintaining order history integrity
- **SC-004**: Deactivation warning dialog reduces accidental product removal by providing clear information about the consequences
- **SC-005**: Product image management operations (add, remove, change primary) complete in under 1 second
- **SC-006**: Zero historical orders are affected when products are deactivated or deleted
- **SC-007**: Administrators can distinguish between delete and deactivate actions based on product usage without consulting documentation

## Out of Scope

- Bulk product operations (bulk delete, bulk deactivate)
- Product import/export functionality
- Image upload functionality (only URL-based images are supported)
- Image optimization or thumbnail generation
- Automated image validation (checking if URLs point to actual images)
- Product versioning or change history
- Soft delete implementation (products are either active or permanently deleted)
- Product categories or taxonomies
- Product variants or options
- Inventory management beyond basic stock quantity

## Assumptions

- The backend GraphQL mutations (CreateProduct, UpdateProduct, DeleteProduct, AddProductImage, RemoveProductImage) already exist and will be used by the UI
- A new validation mechanism will be added to DeleteProduct mutation to check for order usage (currently not implemented)
- Image URLs are managed externally; the system only stores and displays URLs provided by administrators
- Cloud storage URLs (AWS S3, Azure Blob Storage) are pre-signed and secured by the storage provider
- Products can exist without images, but if images exist, exactly one must be primary
- The IsActive flag controls whether products appear in customer-facing catalogs
- Deactivating a product (setting stock to 0) is sufficient to remove it from customer purchase flows
- Order history must never be broken by product deletion
- Administrators have the necessary permissions to perform all product management operations
- The UI will be built as part of the Angular admin frontend application

## Dependencies

- Existing GraphQL API with product mutations
- Backend validation logic to check if products are used in orders (needs to be implemented)
- Angular admin frontend framework and routing
- GraphQL client (Apollo Angular) for API communication
- Dialog/modal component library for confirmation dialogs
- Product image display component that handles missing/invalid image URLs gracefully

## Notes

**Backend Validation Required**: The current DeleteProduct mutation does NOT validate whether a product has been used in orders. This validation must be implemented before the UI feature is complete. The validation should:
- Query OrderDetail records for the ProductId
- Return an error or specific response if orders exist
- Allow deletion only if no orders reference the product

**Alternative Deactivation Approach**: Instead of showing different buttons (Delete vs Deactivate), the UI could show a single "Remove" button that intelligently handles both cases based on order usage. However, the specification calls for distinct "Delete" and "Deactivate" buttons based on product usage.

**Image Management**: The current backend supports adding and removing images. The UI will need to call these mutations to manage the image gallery. When changing the primary image, the UI should call UpdateProduct with the new primary image designation or handle it through the existing image management flow if the backend supports it directly.
