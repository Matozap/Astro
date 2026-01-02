import { gql } from 'apollo-angular';

/**
 * Fragment for basic product fields used in lists and summaries
 */
export const PRODUCT_BASIC_FIELDS = gql`
  fragment ProductBasicFields on Product {
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
    isLowStock
    createdAt
    updatedAt
  }
`;

/**
 * Fragment for product image fields
 */
export const PRODUCT_IMAGE_FIELDS = gql`
  fragment ProductImageFields on ProductImage {
    id
    productId
    fileName
    url
    altText
    storageMode
    isPrimary
    createdAt
    createdBy
  }
`;

/**
 * Fragment for detailed product fields including images
 */
export const PRODUCT_DETAIL_FIELDS = gql`
  fragment ProductDetailFields on Product {
    ...ProductBasicFields
    createdBy
    modifiedBy
    images {
      ...ProductImageFields
    }
  }
  ${PRODUCT_BASIC_FIELDS}
  ${PRODUCT_IMAGE_FIELDS}
`;
