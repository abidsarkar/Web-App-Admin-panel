import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../errors/ApiError"; // Assuming you have an ApiError class to handle errors
import { MAX_PROFILE_PIC_SIZE } from "../config/envConfig";

// Common function for creating the upload folder
const createUploadFolder = (folder: string) => {
  const folderPath = `./public/uploads/${folder}`;
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
};

// Profile Picture Multer
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, createUploadFolder("profile_pictures"));
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
//logo
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, createUploadFolder("logos"));
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

// Banner Multer
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, createUploadFolder("banners"));
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

// CV Multer
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, createUploadFolder("cvs"));
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

// **Profile Picture File Filter and Size Limit**
const profilePictureFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true); // Allow the file if it matches the filter
  } else {
    return cb(
      new ApiError(
        400,
        "Invalid file type for profile picture. Allowed types: jpeg,JPG, PNG,webp,avif.And filed \"profilePicture\" required"
      )
    );
  }
};

const profilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter: profilePictureFilter,
  limits: { fileSize: MAX_PROFILE_PIC_SIZE }, // 5MB size limit for profile picture
}).single("profilePicture");
//! optional profile picture upload
const optionalProfilePictureFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true); // Allow the file if it matches the filter
  } else {
     return cb(null, false);
  }
};

export const optionalProfilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter: optionalProfilePictureFilter,
  limits: { fileSize: MAX_PROFILE_PIC_SIZE }, // 5MB size limit for profile picture
}).single("profilePicture");
// **logo image File Filter and Size Limit**
const logoFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true); // Allow the file if it matches the filter
  } else {
    return cb(
      new ApiError(
        400,
        "Invalid file type for logo. Allowed types: jpeg,JPG, PNG,webp,avif.And filed \"logo\" required"
      )
    );
  }
};

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: logoFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit for profile picture
}).single("logo");

// **Banner File Filter and Size Limit**
const bannerFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true); // Allow the file if it matches the filter
  } else {
    return cb(
      new ApiError(
        400,
        "Invalid file type for banner picture. Allowed types: jpeg,JPG, PNG,webp,avif.And filed \"banner\" required"
      )
    );
  }
};

const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter: bannerFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB size limit for banner
}).single("banner");

// **CV File Filter and Size Limit**
const cvFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /pdf|doc|docx/; // Only PDF, DOC, DOCX allowed for CV
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true); // Allow the file if it matches the filter
  } else {
    return cb(
      new ApiError(
        400,
        "Invalid file type for CV. Allowed types: PDF, DOC, DOCX.And filed \"cv\" required"
      )
    );
  }
};

const cvUpload = multer({
  storage: cvStorage,
  fileFilter: cvFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB size limit for CV
}).single("cv");

// Export all the separate multer instances
export { profilePictureUpload, logoUpload, bannerUpload, cvUpload };
