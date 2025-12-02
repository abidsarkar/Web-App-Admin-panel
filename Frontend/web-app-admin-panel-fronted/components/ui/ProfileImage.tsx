/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProfileImage({
  src,
  alt,
  className = "",
}: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // For localhost/development, use regular img tag to avoid Next.js private IP restrictions
  // For production, you should use a proper CDN or public domain

  const handleError = () => {
    console.error("Failed to load image:", src);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log("Image loaded successfully:", src);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
      >
        <span className="text-gray-500 text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`flex items-center justify-center bg-gray-100 ${className}`}
        >
          <span className="text-gray-400 text-xs">Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? "none" : "block" }}
        crossOrigin="anonymous"
      />
    </>
  );
}
