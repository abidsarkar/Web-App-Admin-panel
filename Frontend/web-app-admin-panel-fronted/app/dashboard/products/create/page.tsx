"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateProductMutation,
  useGetCategoriesQuery,
} from "@/redux/features/product/productApi";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export default function CreateProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const [error, setError] = useState("");

  const categories = categoriesData?.data?.category || [];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    discount: "0",
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      files.forEach((file) => {
        data.append("images", file);
      });

      await createProduct(data).unwrap();
      router.push("/dashboard/products");
    } catch (err: any) {
      setError(err.data?.message || "Failed to create product.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
        <p className="text-muted-foreground">
          Create a new product to add to your store.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Premium Wireless Headphones"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Product description..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="99.99"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              placeholder="100"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={formData.discount}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">Product Images</Label>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                {files.length > 0
                  ? `${files.length} files selected`
                  : "Drag & drop images here, or click to select"}
              </p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                >
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link href="/dashboard/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-pink-600 hover:bg-pink-500"
          >
            {isLoading ? (
              <Spinner className="w-4 h-4 mr-2" />
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
