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
        loadComponent: () =>
          import('./features/products/products-list/products-list.component').then(
            (m) => m.ProductsListComponent
          ),
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
            path: ':id',
            loadComponent: () =>
              import('./features/orders/order-detail/order-detail.component').then(
                (m) => m.OrderDetailComponent
              ),
          },
        ],
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payments-list/payments-list.component').then(
            (m) => m.PaymentsListComponent
          ),
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
