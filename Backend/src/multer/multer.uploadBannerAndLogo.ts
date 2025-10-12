import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../errors/ApiError";

// Common function for creating upload folders with error handling
const createUploadFolder = (folder: string) => {
  const baseDir = "./public/uploads"; // Using public directory as in your old file
  const folderPath = path.join(baseDir, folder);

  try {
    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Create specific folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    return folderPath;
  } catch (error: any) {
    throw new ApiError(
      500,
      `Failed to create upload directory: ${error.message}`
    );
  }
};

// Configure Multer storage with proper error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      if (file.fieldname === "logo") {
        cb(null, createUploadFolder("logos"));
      } else if (file.fieldname === "banner") {
        cb(null, createUploadFolder("banners"));
      } else {
        // Return both null for error and empty string for destination
        cb(new ApiError(400, "Invalid field name for file upload"), "");
      }
    } catch (error: any) {
      cb(null, error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, uniqueSuffix + extname);
  },
});

// Enhanced file filter with better error messages
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extname) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type for ${file.fieldname}. Allowed types: JPG, JPEG, PNG, WEBP, AVIF.`
      )
    );
  }
};

// Initialize Multer with enhanced error handling
const uploadLogoAndBanner = (req: any, res: any, next: any) => {
  const multerInstance = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit per file
      files: 2, // Maximum of 2 files (logo and banner)
    },
  }).fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]);

  // Wrap the multer middleware to handle errors properly
  multerInstance(req, res, (err: any) => {
    if (err) {
      // Handle different types of errors
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(413, "File size too large. Maximum 5MB allowed.")
          );
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return next(new ApiError(400, "Too many files uploaded."));
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return next(
            new ApiError(
              400,
              "Unexpected file field. Only logo and banner are allowed."
            )
          );
        }
      } else if (err.code === "ENOENT") {
        return next(
          new ApiError(500, "Upload directory could not be created.")
        );
      }
      return next(err);
    }
    next();
  });
};

export { uploadLogoAndBanner };
