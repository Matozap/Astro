import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/products/products-list/products-list.component').then(
                (m) => m.ProductsListComponent
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/products/product-create/product-create.component').then(
                (m) => m.ProductCreateComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/products/product-detail/product-detail.component').then(
                (m) => m.ProductDetailComponent
              ),
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/orders/orders-list/orders-list.component').then(
                (m) => m.OrdersListComponent
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/orders/components/order-create/order-create.component').then(
                (m) => m.OrderCreateComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/orders/order-detail/order-detail.component').then(
                (m) => m.OrderDetailComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/orders/components/order-edit/order-edit.component').then(
                (m) => m.OrderEditComponent
              ),
          },
        ],
      },
      {
        path: 'payments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/payments/payments-list/payments-list.component').then(
                (m) => m.PaymentsListComponent
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/payments/components/payment-create/payment-create.component').then(
                (m) => m.PaymentCreateComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/payments/payment-detail/payment-detail.component').then(
                (m) => m.PaymentDetailComponent
              ),
          },
        ],
      },
      {
        path: 'shipments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/shipments/shipments-list/shipments-list.component'
              ).then((m) => m.ShipmentsListComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/shipments/shipment-detail/shipment-detail.component'
              ).then((m) => m.ShipmentDetailComponent),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
