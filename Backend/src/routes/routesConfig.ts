import { getTestPage } from "../modules/test/test.controller";
import { postRoutes } from "../modules/post/post.route";
import path from "path";
export const routesConfig = [
  //testing route
  { path: "/test", handler: getTestPage },
  { path: "/api/v1/posts", handler: postRoutes },
  //other routes
];
