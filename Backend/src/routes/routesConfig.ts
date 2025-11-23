import { getTestPage } from "../modules/test/test.controller";

import { authRoutes } from "../modules/auth/auth.route";
import path from "path";
import { employeeManagementRouts } from "../modules/managedEmployer/managedEmployer.route";
import { textRouts } from "../modules/text/text.route";
import { categoryRouts } from "../modules/category/category.route";
import { productRouts } from "../modules/product/product.route";
import { customerAuthRoutes } from "../modules/customerAuth/customerAuth.route";
import { customerManagementRouts } from "../modules/managedCustomer/managedCustomer.route";
import { healthRoutes } from "../redis/health.route";
import { cartRoutes } from "../modules/cart/cart.route";
export const routesConfig = [
  //testing route
  { path: "/test", handler: getTestPage },
  // Health check routes - Add this
  { path: "/api/v1/health", handler: healthRoutes },
  //other routes
  { path: "/api/v1/auth", handler: authRoutes },
  { path: "/api/v1/employee", handler: employeeManagementRouts },
  { path: "/api/v1/text", handler: textRouts },
  { path: "/api/v1/category", handler: categoryRouts },
  { path: "/api/v1/product", handler: productRouts },
  { path: "/api/v1/customer-auth", handler: customerAuthRoutes },
  { path: "/api/v1/customer", handler: customerManagementRouts },
  { path: "/api/v1/cart", handler: cartRoutes },
];
