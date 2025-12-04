import Button from "@/components/ui/button/Button";
import { Trash2, Edit, Eye } from "lucide-react";
import Image from "next/image";

interface Product {
  _id: string;
  productId: string;
  productName: string;
  productCoverImage: {
    filePathURL: string;
    fileOriginalName: string;
  };
  productPrice: number;
  productStock: number;
  categoryName: string;
  subCategoryName: string;
  isSaleable: boolean;
  isDisplayable: boolean;
}

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (_id: string) => void;
}

export default function ProductTable({
  products,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
        No products found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium">Product Name</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Stock</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Sub-Category</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={`${API_URL}/${product.productCoverImage.filePathURL}`}
                      alt={product.productName}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-product.png";
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {product.productName}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  ${product.productPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {product.productStock}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {product.categoryName}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {product.subCategoryName}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        product.isSaleable
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-gray-50 text-gray-700 ring-gray-600/20"
                      }`}
                    >
                      {product.isSaleable ? "Sale" : "No Sale"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        product.isDisplayable
                          ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                          : "bg-red-50 text-red-700 ring-red-600/20"
                      }`}
                    >
                      {product.isDisplayable ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(product)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-transparent hover:border-blue-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-transparent hover:border-green-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(product._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
