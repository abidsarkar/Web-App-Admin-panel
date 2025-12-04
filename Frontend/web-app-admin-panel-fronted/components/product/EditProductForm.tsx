import { useState } from "react";
import {
  useUpdateProductMutation,
  useUploadCoverImageMutation,
  useUploadProductImagesMutation,
} from "@/redux/Features/product/productApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { X, Upload } from "lucide-react";

interface Product {
  _id: string;
  productName: string;
  productDescription: string;
  productSize: string;
  productColor: string;
  productColorCode: string;
  productPrice: number;
  productStock: number;
  productSubCategoryId: string;
  productDeliveryOption: string;
  productPaymentOption: string;
  isSaleable: boolean;
  isDisplayable: boolean;
}

interface EditProductFormProps {
  product: Product;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditProductForm({
  product,
  onClose,
  onSuccess,
}: EditProductFormProps) {
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [uploadCover, { isLoading: isUploadingCover }] =
    useUploadCoverImageMutation();
  const [uploadImages, { isLoading: isUploadingImages }] =
    useUploadProductImagesMutation();
  const [error, setError] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [productImages, setProductImages] = useState<FileList | null>(null);

  const [formData, setFormData] = useState({
    productName: product.productName,
    productDescription: product.productDescription,
    productSize: product.productSize,
    productColor: product.productColor,
    productColorCode: product.productColorCode,
    productPrice: String(product.productPrice),
    productStock: String(product.productStock),
    productSubCategoryId: product.productSubCategoryId,
    productDeliveryOption: product.productDeliveryOption,
    productPaymentOption: product.productPaymentOption,
    isSaleable: product.isSaleable,
    isDisplayable: product.isDisplayable,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "isSaleable" || name === "isDisplayable"
          ? value === "true"
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await updateProduct({ _id: product._id, ...formData }).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update product.";
      setError(errorMessage);
    }
  };

  const handleUploadCover = async () => {
    if (!coverImage) return;
    const formDataObj = new FormData();
    formDataObj.append("_id", product._id);
    formDataObj.append("productCoverImage", coverImage);
    try {
      await uploadCover(formDataObj).unwrap();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to upload cover image");
    }
  };

  const handleUploadImages = async () => {
    if (!productImages) return;
    const formDataObj = new FormData();
    formDataObj.append("_id", product._id);
    Array.from(productImages).forEach((file) => {
      formDataObj.append("productImages", file);
    });
    try {
      await uploadImages(formDataObj).unwrap();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to upload product images");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="productDescription">Description</Label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="productPrice">Price</Label>
                <Input
                  id="productPrice"
                  name="productPrice"
                  type="number"
                  step="0.01"
                  value={formData.productPrice}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="productStock">Stock</Label>
                <Input
                  id="productStock"
                  name="productStock"
                  type="number"
                  value={formData.productStock}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="productSize">Size</Label>
                <Input
                  id="productSize"
                  name="productSize"
                  value={formData.productSize}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="productColor">Color</Label>
                <Input
                  id="productColor"
                  name="productColor"
                  value={formData.productColor}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="productColorCode">Color Code</Label>
                <Input
                  id="productColorCode"
                  name="productColorCode"
                  value={formData.productColorCode}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="productSubCategoryId">Sub-Category ID</Label>
                <Input
                  id="productSubCategoryId"
                  name="productSubCategoryId"
                  value={formData.productSubCategoryId}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="productDeliveryOption">Delivery Option</Label>
                <Input
                  id="productDeliveryOption"
                  name="productDeliveryOption"
                  value={formData.productDeliveryOption}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="productPaymentOption">Payment Option</Label>
                <Input
                  id="productPaymentOption"
                  name="productPaymentOption"
                  value={formData.productPaymentOption}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="isSaleable">Saleable</Label>
                <select
                  id="isSaleable"
                  name="isSaleable"
                  value={String(formData.isSaleable)}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <Label htmlFor="isDisplayable">Displayable</Label>
                <select
                  id="isDisplayable"
                  name="isDisplayable"
                  value={String(formData.isDisplayable)}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div>
              <Label>Update Cover Image</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleUploadCover}
                  disabled={!coverImage || isUploadingCover}
                  className="bg-green-600 hover:bg-green-500"
                >
                  {isUploadingCover ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label>Update Product Images</Label>
              <div className="flex gap-2 mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setProductImages(e.target.files)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={!productImages || isUploadingImages}
                  className="bg-green-600 hover:bg-green-500"
                >
                  {isUploadingImages ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
