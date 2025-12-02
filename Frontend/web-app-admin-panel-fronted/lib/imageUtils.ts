/**
 * Constructs the full URL for a profile picture from the backend
 * @param filePathURL - The file path from the backend (e.g., "public/uploads/profile_pictures/image.jpg")
 * @returns The full URL to access the image
 */
export function getProfileImageUrl(filePathURL: string): string {
  if (!filePathURL) return "";

  // Remove leading "./" or "/" if present
  const cleanPath = filePathURL.replace(/^\.?\/?/, "");

  // Remove "public/" prefix if present, as backend typically serves from public directory
  const pathWithoutPublic = cleanPath.replace(/^public\//, "");

  // Construct the full URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  return `${backendUrl}/${pathWithoutPublic}`;
}
