import { useState } from "react";
import {
  useCreateProductMutation,
  useUploadCoverImageMutation,
} from "@/redux/Features/product/productApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { X } from "lucide-react";

interface CreateProductFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateProductForm({
  onClose,
  onSuccess,
}: CreateProductFormProps) {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [uploadCover, { isLoading: isUploading }] =
    useUploadCoverImageMutation();
  const [error, setError] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    productDescription: "",
    productSize: "",
    productColor: "",
    productColorCode: "",
    productPrice: "",
    productStock: "",
    productSubCategoryId: "",
    productDeliveryOption: "",
    productPaymentOption: "",
    isSaleable: true,
    isDisplayable: true,
    searchKeyword: "",
    extraComment: "",
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

    // Basic client-side validation
    const requiredFields = [
      "productId",
      "productName",
      "productDescription",
      "productSize",
      "productColor",
      "productColorCode",
      "productPrice",
      "productStock",
      "productSubCategoryId",
      "productDeliveryOption",
      "productPaymentOption",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );
    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    try {
      // 1. Create Product (JSON)
      // Convert numeric fields
      const submitData = {
        ...formData,
        productPrice: Number(formData.productPrice),
        productStock: Number(formData.productStock),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await createProduct(submitData).unwrap();
      const newProductId = response?.data?.product?._id;

      if (!newProductId) {
        throw new Error("Failed to get new product ID");
      }

      // 2. Upload Cover Image (FormData) if exists
      if (coverImage) {
        const formDataObj = new FormData();
        formDataObj.append("_id", newProductId);
        formDataObj.append("productCoverImage", coverImage);
        await uploadCover(formDataObj).unwrap();
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to create product.";
      setError(errorMessage);
    }
  };

  const isLoading = isCreating || isUploading;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Add New Product</h2>
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
                <Label htmlFor="productId">
                  Product ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productName">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="productDescription">
                  Description <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="productDescription"
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="productPrice">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productPrice"
                  name="productPrice"
                  type="number"
                  step="0.01"
                  value={formData.productPrice}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productStock">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productStock"
                  name="productStock"
                  type="number"
                  value={formData.productStock}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productSize">
                  Size <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productSize"
                  name="productSize"
                  value={formData.productSize}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productColor">
                  Color <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productColor"
                  name="productColor"
                  value={formData.productColor}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productColorCode">
                  Color Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productColorCode"
                  name="productColorCode"
                  value={formData.productColorCode}
                  onChange={handleChange}
                  placeholder="#000000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="productSubCategoryId">
                  Sub-Category ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productSubCategoryId"
                  name="productSubCategoryId"
                  value={formData.productSubCategoryId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productDeliveryOption">
                  Delivery Option <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productDeliveryOption"
                  name="productDeliveryOption"
                  value={formData.productDeliveryOption}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="productPaymentOption">
                  Payment Option <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productPaymentOption"
                  name="productPaymentOption"
                  value={formData.productPaymentOption}
                  onChange={handleChange}
                  required
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
              <div className="col-span-2">
                <Label htmlFor="searchKeyword">Search Keywords</Label>
                <Input
                  id="searchKeyword"
                  name="searchKeyword"
                  value={formData.searchKeyword}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="extraComment">Extra Comment</Label>
                <textarea
                  id="extraComment"
                  name="extraComment"
                  value={formData.extraComment}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="coverImage">Cover Image</Label>
                <input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
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
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
