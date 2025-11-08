import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../errors/ApiError"; // Assuming you have an ApiError class to handle errors
import {
  MAX_FILE_SIZE,
  MAX_PRODUCT_COVER_PIC_SIZE,
  MAX_PROFILE_PIC_SIZE,
} from "../config/envConfig";

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
// productCoverPicture Multer
const productCoverPictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, createUploadFolder("productCoverPicture"));
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
//many picture upload for product

const productManyPicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, createUploadFolder("productImages"));
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
//customer profile picture
const customerPictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, createUploadFolder("customer_profile_picture"));
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
        'Invalid file type for profile picture. Allowed types: jpeg,JPG, PNG,webp,avif.And filed "profilePicture" required'
      )
    );
  }
};

export const profilePictureUpload = multer({
  storage: profilePictureStorage,
  fileFilter: profilePictureFilter,
  limits: { fileSize: MAX_PROFILE_PIC_SIZE }, // 5MB size limit for profile picture
}).single("profilePicture");
//customer profile picture upload
const customerProfilePictureFilter = (req: any, file: any, cb: any) => {
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
        'Invalid file type for profile picture. Allowed types: jpeg,JPG, PNG,webp,avif.And filed "profilePicture" required'
      )
    );
  }
};
export const customerProfilePictureUpload = multer({
  storage: customerPictureStorage,
  fileFilter: customerProfilePictureFilter,
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
        'Invalid file type for logo. Allowed types: jpeg,JPG, PNG,webp,avif.And filed "logo" required'
      )
    );
  }
};

export const logoUpload = multer({
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
        'Invalid file type for banner picture. Allowed types: jpeg,JPG, PNG,webp,avif.And filed "banner" required'
      )
    );
  }
};

export const bannerUpload = multer({
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
        'Invalid file type for CV. Allowed types: PDF, DOC, DOCX.And filed "cv" required'
      )
    );
  }
};

export const cvUpload = multer({
  storage: cvStorage,
  fileFilter: cvFilter,
  limits: { fileSize: MAX_FILE_SIZE }, // 10MB size limit for CV
}).single("cv");
//product cover picture
const productCoverPictureFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
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
        'Invalid file type for product cover image. Allowed types: /jpeg|jpg|png|gif.And filed "cv" required'
      )
    );
  }
};

export const productCoverPictureUpload = multer({
  storage: productCoverPictureStorage,
  fileFilter: productCoverPictureFilter,
  limits: { fileSize: MAX_PRODUCT_COVER_PIC_SIZE },
}).single("productCoverImage");
//many picture for one product
const productManyPicFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (mimeType && extname) {
    return cb(null, true);
  } else {
    return cb(
      new ApiError(
        400,
        'Invalid file type for product images.Allowed types: /jpeg|jpg|png|gif.And filed "productImages" required.max 10 image at a time'
      )
    );
  }
};
export const uploadManyProductPic = multer({
  storage: productManyPicStorage,
  fileFilter: productManyPicFilter,
  limits: { fileSize: MAX_PRODUCT_COVER_PIC_SIZE },
}).array("productImages", 10); // Allow up to 10 images
export const uploadSingleReplaceImage = multer({
  storage: productManyPicStorage, // reuse from before
  fileFilter: productManyPicFilter,
  limits: { fileSize: MAX_PRODUCT_COVER_PIC_SIZE },
}).single("newImage");


