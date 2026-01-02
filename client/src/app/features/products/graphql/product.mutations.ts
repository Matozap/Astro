import { gql } from 'apollo-angular';

/**
 * Mutation to create a new product
 * HotChocolate mutation conventions wrap result in CreateProductPayload
 */
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($command: CreateProductCommandInput!) {
    createProduct(input: { command: $command }) {
      product {
        id
        sku
        name
        description
        price {
          amount
          currency
        }
        stockQuantity
        lowStockThreshold
        isActive
        createdAt
        updatedAt
        createdBy
      }
    }
  }
`;

/**
 * Mutation to update an existing product
 * HotChocolate mutation conventions wrap result in UpdateProductPayload
 */
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($command: UpdateProductCommandInput!) {
    updateProduct(input: { command: $command }) {
      product {
        id
        sku
        name
        description
        price {
          amount
          currency
        }
        stockQuantity
        lowStockThreshold
        isActive
        createdAt
        updatedAt
        createdBy
        modifiedBy
        images {
          id
          url
          isPrimary
        }
      }
    }
  }
`;

/**
 * Mutation to delete a product
 * Note: Will throw ProductInUseException if product is referenced in orders
 * HotChocolate mutation conventions wrap result in DeleteProductPayload
 */
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($command: DeleteProductCommandInput!) {
    deleteProduct(input: { command: $command }) {
      errors {
        ... on ProductNotFoundError {
          message
          productId
        }
        ... on ProductInUseError {
          message
          productId
        }
      }
      deleteResponse {
        objectDeleted
        executedAt
      }
    }
  }
`;

/**
 * Mutation to add an image to a product
 * HotChocolate mutation conventions wrap result in AddProductImagePayload
 */
export const ADD_PRODUCT_IMAGE = gql`
  mutation AddProductImage($command: AddProductImageCommandInput!) {
    addProductImage(input: { command: $command }) {
      productImage {
        id
        url
        isPrimary
      }
    }
  }
`;

/**
 * Mutation to remove an image from a product
 * HotChocolate mutation conventions wrap result in RemoveProductImagePayload
 */
export const REMOVE_PRODUCT_IMAGE = gql`
  mutation RemoveProductImage($command: RemoveProductImageCommandInput!) {
    removeProductImage(input: { command: $command }) {
      errors {
        ... on ProductNotFoundError {
          message
          productId
        }
      }
      deleteResponse {
        objectDeleted
        executedAt
      }
    }
  }
`;
