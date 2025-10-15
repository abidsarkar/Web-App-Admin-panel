import { getTestPage } from "../modules/test/test.controller";
import { postRoutes } from "../modules/post/post.route";
import { authRoutes } from "../modules/auth/auth.route";
import path from "path";
export const routesConfig = [
  //testing route
  { path: "/test", handler: getTestPage },
  { path: "/api/v1/posts", handler: postRoutes },
  { path: "/api/v1/auth", handler: authRoutes },
  //other routes
];
