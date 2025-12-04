import { X } from "lucide-react";
import { Button } from "@/_components/ui/button";
import Image from "next/image";

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
}: ProductDetailsModalProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="flex gap-6">
            <div className="w-48 h-48 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={`${API_URL}/${product.productCoverImage?.filePathURL}`}
                alt={product.productName}
                fill
                className="object-cover"
              />
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
                <span
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: product.productColorCode }}
                ></span>
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
