import { getTestPage } from "../modules/test/test.controller";
import { postRoutes } from "../modules/post/post.route";
import { authRoutes } from "../modules/auth/auth.route";
import path from "path";
import { employeeManagementRouts } from "../modules/managedEmployer/managedEmployer.route";
import { textRouts } from "../modules/text/text.route";
export const routesConfig = [
  //testing route
  { path: "/test", handler: getTestPage },
  { path: "/api/v1/posts", handler: postRoutes },
  { path: "/api/v1/auth", handler: authRoutes },
  { path: "/api/v1/employee", handler: employeeManagementRouts },
  { path: "/api/v1/text", handler: textRouts },
  //other routes
];
