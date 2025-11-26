import Cookies from "js-cookie";

// Client-side cookie functions (for use in components)
export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  Cookies.set("accessToken", accessToken, {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  Cookies.set("refreshToken", refreshToken, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const clearAuthCookies = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};

// Server-side cookie parsing (for use in route handlers)
export interface ParsedCookie {
  name: string;
  value: string;
  options: {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "strict" | "lax" | "none";
  };
}

// This is a synchronous function since it doesn't do any async operations
export const parseSetCookieHeader = (setCookieHeader: string): ParsedCookie => {
  const [nameValue, ...attributes] = setCookieHeader
    .split(";")
    .map((part) => part.trim());
  const [name, ...valueParts] = nameValue.split("=");
  const value = valueParts.join("="); // In case value contains '='

  const options: ParsedCookie["options"] = {};

  attributes.forEach((attr) => {
    const [key, val] = attr.split("=").map((part) => part.trim());
    const lowerKey = key.toLowerCase();

    switch (lowerKey) {
      case "expires":
        options.expires = new Date(val);
        break;
      case "max-age":
        options.maxAge = parseInt(val, 10);
        break;
      case "domain":
        options.domain = val;
        break;
      case "path":
        options.path = val || "/";
        break;
      case "secure":
        options.secure = true;
        break;
      case "httponly":
        options.httpOnly = true;
        break;
      case "samesite":
        options.sameSite = val as "strict" | "lax" | "none";
        break;
    }
  });

  // Set default path if not provided
  if (!options.path) {
    options.path = "/";
  }

  return { name, value, options };
};

// Helper to convert parsed cookie to NextResponse compatible options
export const toNextResponseCookieOptions = (parsedCookie: ParsedCookie) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    path: parsedCookie.options.path,
    secure:
      parsedCookie.options.secure ?? process.env.NODE_ENV === "production",
    sameSite: parsedCookie.options.sameSite ?? "lax",
  };

  // Add httpOnly if present
  if (parsedCookie.options.httpOnly) {
    options.httpOnly = true;
  }

  // Use expires or maxAge (convert maxAge to expires for NextResponse)
  if (parsedCookie.options.expires) {
    options.expires = parsedCookie.options.expires;
  } else if (parsedCookie.options.maxAge) {
    options.maxAge = parsedCookie.options.maxAge;
  }

  // Add domain if present (be careful with this in production)
  if (parsedCookie.options.domain) {
    options.domain = parsedCookie.options.domain;
  }

  return options;
};

// Utility to process multiple Set-Cookie headers
export const processSetCookieHeaders = (
  setCookieHeaders: string[]
): ParsedCookie[] => {
  return setCookieHeaders.map((header) => parseSetCookieHeader(header));
};
