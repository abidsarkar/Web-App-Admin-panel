import  httpStatus  from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ApiError from '../../errors/ApiError';
import { loginService } from './test.service';
import { sendAccessCookie, sendRefreshCookie } from '../auth/auth.utils';
import z from 'zod';
import { loginSchema } from './test.zodSchema';

// export const deleteSubCategoryController = catchAsync(
//   async (req: Request, res: Response) => {
//     const parsed = deleteSubCategorySchema.safeParse(req.query);
//     if (!parsed.success) {
//       return res.status(httpStatus.BAD_REQUEST).json({
//         success: false,
//         message: "delete sub category Validation Error",
//         errors: z.treeifyError(parsed.error),
//       });
//     }
//     const admin_id = req.user?.id; //supper admin id form accessToken
//     const admin_role = req.user?.role; //supper admin role form accessToken
//     const admin_email = req.user?.email; //supper admin email form accessToken
//     const { statusCode, success, message, error, data } =
//       await deleteSubCategoryService(
//         parsed.data,
//         admin_id!,
//         admin_role!,
//         admin_email!
//       );
//     sendAccessCookie(res, data?.accessToken);
//     sendResponse(res, {
//       statusCode,
//       success,
//       message,
//       error,
//       data: {
//         accessToken: data?.accessToken,
//         deletedSubCategoryId: data?.deletedSubCategoryId,
//         user: data?.user,
//       },
//     });
//   }
// );
export const getTestPage = (req: Request, res: Response) => {
  const currentTime = new Date().toLocaleString(); // Get the current time as a string
  // HTML content for the test page
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          font-size: 28px;
        }
        p {
          color: #666;
          font-size: 16px;
        }
        .time {
          font-size: 18px;
          color: #4CAF50;
        }
        .footer {
          font-size: 12px;
          color: #888;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Abid's API!</h1>
        <p>This is a test endpoint to ensure the API is working.</p>
        <p class="time">Current Time: ${currentTime}</p>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Abid's API</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send the HTML response
  res.status(200).send(htmlContent);
};
