"use client";

import { useState } from "react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/redux/features/product/productApi";
import { Button } from "@/_components/ui/button";
import { Plus, Trash2, Edit, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Input } from "@/_components/ui/input";
import { Spinner } from "@/_components/ui/spinner";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
}

export default function ProductsPage() {
  const { data, isLoading, error } = useGetProductsQuery(undefined);
  const [deleteProduct] = useDeleteProductMutation();
  const [searchTerm, setSearchTerm] = useState("");

  const products: Product[] = data?.data?.product || [];

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory.
          </p>
        </div>
        <Link href="/dashboard/products/create">
          <Button className="bg-pink-600 hover:bg-pink-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm max-w-md">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner className="w-8 h-8 text-pink-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load products.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="bg-white border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        {product.name}
                      </td>
                      <td className="px-6 py-4">${product.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${product.stock < 10 ? "text-red-500" : "text-green-600"}`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {typeof product.category === "string"
                            ? product.category
                            : "Category"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-red-600"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
