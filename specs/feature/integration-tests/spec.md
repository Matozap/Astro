# Feature Specification: GraphQL Integration Tests

**Feature Branch**: `feature/integration-tests`
**Created**: 2025-12-18
**Status**: Draft
**Input**: User description: "Create integration tests for all GraphQL operations with minimal code, external JSON payloads or snapshot testing, using .NET Aspire testing features. No FluentAssertions, no database value assertions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Product Query Integration Tests (Priority: P1)

Developers can verify that Product query GraphQL operations return valid responses through integration tests that use the real Aspire-hosted application with PostgreSQL.

**Why this priority**: Products are the core entity and query operations are the foundation for verifying the GraphQL API is correctly exposed and responding.

**Independent Test**: Can be fully tested by running integration tests against the `products` query and `productById` query endpoints, verifying response shape via snapshot testing.

**Acceptance Scenarios**:

1. **Given** the Aspire application is running, **When** a `products` query is executed, **Then** the response structure matches the expected GraphQL schema snapshot
2. **Given** the Aspire application is running, **When** a `productById` query is executed with a valid ID format, **Then** the response structure is valid (null product or product shape)

---

### User Story 2 - Product Mutation Integration Tests (Priority: P2)

Developers can verify that Product mutation GraphQL operations (create, update, delete, stock, images) execute successfully and return expected response structures.

**Why this priority**: Mutations modify state and are critical for ensuring the write path of the Product module works correctly.

**Independent Test**: Can be fully tested by executing each mutation type and verifying response structure via snapshot testing.

**Acceptance Scenarios**:

1. **Given** the Aspire application is running, **When** a `createProduct` mutation is executed with valid input, **Then** the response contains a product with expected fields
2. **Given** a product exists, **When** an `updateProduct` mutation is executed, **Then** the response reflects the update shape
3. **Given** a product exists, **When** a `deleteProduct` mutation is executed, **Then** the response contains a deletion confirmation
4. **Given** a product exists, **When** an `updateStock` mutation is executed, **Then** the response reflects the stock update
5. **Given** a product exists, **When** `addProductImage`/`removeProductImage` mutations are executed, **Then** the responses are structurally valid

---

### User Story 3 - Order Query Integration Tests (Priority: P3)

Developers can verify that Order query GraphQL operations return valid responses through integration tests.

**Why this priority**: Orders are the second core module and queries provide read access verification.

**Independent Test**: Can be fully tested by running integration tests against the `orders` query and `orderById` query endpoints.

**Acceptance Scenarios**:

1. **Given** the Aspire application is running, **When** an `orders` query is executed, **Then** the response structure matches the expected schema snapshot
2. **Given** the Aspire application is running, **When** an `orderById` query is executed, **Then** the response structure is valid

---

### User Story 4 - Order Mutation Integration Tests (Priority: P4)

Developers can verify that Order mutation GraphQL operations (create, update, cancel, status) execute and return expected response structures.

**Why this priority**: Order mutations are essential for the order lifecycle but depend on products existing.

**Independent Test**: Can be fully tested by executing each order mutation type and verifying response structure via snapshot testing.

**Acceptance Scenarios**:

1. **Given** the Aspire application is running with a product, **When** a `createOrder` mutation is executed, **Then** the response contains an order with expected fields
2. **Given** an order exists, **When** an `updateOrder` mutation is executed, **Then** the response reflects the update
3. **Given** an order exists, **When** an `updateOrderStatus` mutation is executed, **Then** the response reflects the new status
4. **Given** an order exists, **When** a `cancelOrder` mutation is executed, **Then** the response confirms cancellation

---

### Edge Cases

- What happens when GraphQL queries/mutations have malformed JSON? System should return appropriate GraphQL error responses
- What happens when the Aspire application fails to start? Tests should timeout gracefully with clear error messages
- How does the system handle invalid UUIDs in queries? GraphQL validation errors should be returned

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Test project MUST use `Aspire.Hosting.Testing` with `DistributedApplicationTestingBuilder`
- **FR-002**: GraphQL payloads MUST be stored in external `.graphql` or `.json` files for readability
- **FR-003**: Response assertions MUST use `Verify.Xunit` snapshot testing for structural validation
- **FR-004**: Tests MUST NOT use FluentAssertions library
- **FR-005**: Tests MUST NOT assert on specific database row counts or values
- **FR-006**: Tests MUST verify response structure and GraphQL operation success, not data correctness
- **FR-007**: Tests MUST use xUnit as the test framework (consistent with existing project)
- **FR-008**: Tests MUST use Shouldly for simple assertions (consistent with existing project)
- **FR-009**: Dynamic values (IDs, timestamps) MUST be scrubbed from snapshots using Verify's scrubbing features

### Key Entities *(included as this feature involves data)*

- **IntegrationTestBase**: Base class providing Aspire app hosting, HttpClient creation, and common utilities
- **GraphQL Request/Response**: JSON structures for GraphQL queries and mutations
- **Snapshot Files**: `.verified.json` files storing expected response structures

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All GraphQL operations (2 queries + 6 mutations for Products, 2 queries + 4 mutations for Orders) have corresponding integration tests
- **SC-002**: All GraphQL payloads are stored in external files, not inline in test code
- **SC-003**: Tests pass consistently without relying on specific database state
- **SC-004**: Snapshot files capture response structure with dynamic values properly scrubbed
- **SC-005**: Test project builds and runs successfully with `dotnet test`
