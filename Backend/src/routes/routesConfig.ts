import { getTestPage } from "../modules/test/test.controller";

import { authRoutes } from "../modules/auth/auth.route";
import path from "path";
import { employeeManagementRouts } from "../modules/managedEmployer/managedEmployer.route";
import { textRouts } from "../modules/text/text.route";
import { categoryRouts } from "../modules/category/category.route";
import { productRouts } from "../modules/product/product.route";
export const routesConfig = [
  //testing route
  { path: "/test", handler: getTestPage },
  //other routes
  { path: "/api/v1/auth", handler: authRoutes },
  { path: "/api/v1/employee", handler: employeeManagementRouts },
  { path: "/api/v1/text", handler: textRouts },
  { path: "/api/v1/category", handler: categoryRouts },
  { path: "/api/v1/product", handler: productRouts },
];
