import { X, Trash2, Upload } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { baseUrl_public_image } from "@/utils/baseUrl";
import ProfileImage from "@/components/ui/ProfileImage";
import { useState } from "react";
import {
  useGetSingleProductQuery,
  useDeleteProductImageMutation,
  useReplaceProductImageMutation,
} from "@/redux/Features/product/productApi";

interface ProductDetailsModalProps {
  productId: string;
  onClose: () => void;
}

export default function ProductDetailsModal({
  productId,
  onClose,
}: ProductDetailsModalProps) {
  const API_URL = baseUrl_public_image || "http://localhost:5001";

  // Fetch product data - will auto-refresh when cache is invalidated
  const { data: product, isLoading } = useGetSingleProductQuery(productId);

  const [deleteImage, { isLoading: isDeleting }] =
    useDeleteProductImageMutation();
  const [replaceImage, { isLoading: isReplacing }] =
    useReplaceProductImageMutation();
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await deleteImage({ productId, imageId }).unwrap();
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Failed to delete image");
    }
  };

  const handleReplaceImage = async (imageId: string, file: File) => {
    setReplacingImageId(imageId);
    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("imageId", imageId);
    formData.append("newImage", file);

    try {
      await replaceImage(formData).unwrap();
    } catch (error) {
      console.error("Failed to replace image:", error);
      alert("Failed to replace image");
    } finally {
      setReplacingImageId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cover Image and Basic Info */}
          <div className="flex gap-6">
            <div className="w-64 h-64 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {product.productCoverImage?.filePathURL ? (
                <ProfileImage
                  src={`${API_URL}/${product.productCoverImage.filePathURL.replace(
                    /^\.?\/?/,
                    ""
                  )}`}
                  alt={product.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400 font-bold text-lg">
                  {product.productName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-2xl font-bold">{product.productName}</h3>
              <p className="text-gray-600">{product.productDescription}</p>
              <div className="flex gap-4 pt-2">
                <div>
                  <span className="text-sm text-gray-500">Price:</span>{" "}
                  <span className="text-lg font-semibold text-green-600">
                    ${product.productPrice?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Stock:</span>{" "}
                  <span className="text-lg font-semibold">
                    {product.productStock}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Images Gallery */}
          {product.productImages && product.productImages.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-lg font-semibold mb-3">Product Gallery</h4>
              <div className="grid grid-cols-3 gap-4">
                {product.productImages.map((image: any, index: number) => (
                  <div
                    key={image._id || index}
                    className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <div className="w-full h-40">
                      <ProfileImage
                        src={`${API_URL}/${image.filePathURL.replace(
                          /^\.?\/?/,
                          ""
                        )}`}
                        alt={`${product.productName} - ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Image Actions */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <label
                        htmlFor={`replace-${image._id}`}
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors"
                        title="Replace image"
                      >
                        <Upload className="w-4 h-4" />
                        <input
                          id={`replace-${image._id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleReplaceImage(image._id, file);
                            }
                          }}
                          disabled={isReplacing}
                        />
                      </label>
                      <button
                        onClick={() => handleDeleteImage(image._id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition-colors disabled:opacity-50"
                        title="Delete image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Loading overlay */}
                    {(isDeleting ||
                      (isReplacing && replacingImageId === image._id)) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm">Processing...</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-500">
                Product ID
              </span>
              <p className="text-gray-900 mt-1">{product.productId}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Size</span>
              <p className="text-gray-900 mt-1">{product.productSize}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Color</span>
              <p className="text-gray-900 mt-1 flex items-center gap-2">
                {product.productColor}{" "}
                {product.productColorCode && (
                  <span
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: product.productColorCode }}
                  ></span>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Category
              </span>
              <p className="text-gray-900 mt-1">{product.categoryName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Sub-Category
              </span>
              <p className="text-gray-900 mt-1">{product.subCategoryName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Delivery
              </span>
              <p className="text-gray-900 mt-1">
                {product.productDeliveryOption}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Payment</span>
              <p className="text-gray-900 mt-1">
                {product.productPaymentOption}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Status</span>
              <div className="flex gap-2 mt-1">
                <span
                  className={`px-2 py-1 text-xs rounded ${product.isSaleable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {product.isSaleable ? "Saleable" : "Not Saleable"}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded ${product.isDisplayable ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                >
                  {product.isDisplayable ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          {product.searchKeyword && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-500">
                Search Keywords
              </span>
              <p className="text-gray-900 mt-1">{product.searchKeyword}</p>
            </div>
          )}

          {product.extraComment && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-500">
                Extra Comment
              </span>
              <p className="text-gray-900 mt-1">{product.extraComment}</p>
            </div>
          )}

          {product.createdBy && (
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-500">
                Created By
              </span>
              <p className="text-gray-700 mt-1">
                {product.createdBy.email} ({product.createdBy.role}) on{" "}
                {new Date(
                  product.createdBy.createdAt || product.createdAt
                ).toLocaleString()}
              </p>
            </div>
          )}

          {product.updatedBy && product.updatedBy.updatedAt && (
            <div>
              <span className="text-sm font-medium text-gray-500">
                Last Updated
              </span>
              <p className="text-gray-700 mt-1">
                {product.updatedBy.email
                  ? `${product.updatedBy.email} (${product.updatedBy.role})`
                  : ""}{" "}
                on {new Date(product.updatedBy.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
