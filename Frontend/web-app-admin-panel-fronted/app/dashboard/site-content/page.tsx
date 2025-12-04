"use client";

import { useState, useEffect } from "react";
import {
  useGetAllContentQuery,
  useUpsertContentMutation,
  useLazyExportContentQuery,
} from "@/redux/Features/content/contentApi";
import Button from "@/components/ui/button/Button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Spinner } from "@/_components/ui/spinner";
import { Download, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SiteContentPage() {
  const {
    data: content,
    isLoading,
    refetch,
  } = useGetAllContentQuery(undefined);
  const [upsertContent, { isLoading: isUpdating }] = useUpsertContentMutation();
  const [triggerExport] = useLazyExportContentQuery();

  const [formData, setFormData] = useState({
    aboutUs: "",
    achievements: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    cookiePolicy: "",
    disclaimer: "",
    facebookLink: "",
    githubLink: "",
    instagramLink: "",
    linkedinLink: "",
    map: "",
    officeHours: "",
    privacyPolicy: "",
    refundPolicy: "",
    returnPolicy: "",
    shippingPolicy: "",
    shippingRestriction: "",
    termsOfService: "",
    tiktokLink: "",
    xLink: "",
    youtubeLink: "",
  });

  // Populate form when data loads
  useEffect(() => {
    if (content) {
      setFormData({
        aboutUs: content.aboutUs || "",
        achievements: content.achievements || "",
        address: content.address || "",
        contactEmail: content.contactEmail || "",
        contactPhone: content.contactPhone || "",
        cookiePolicy: content.cookiePolicy || "",
        disclaimer: content.disclaimer || "",
        facebookLink: content.facebookLink || "",
        githubLink: content.githubLink || "",
        instagramLink: content.instagramLink || "",
        linkedinLink: content.linkedinLink || "",
        map: content.map || "",
        officeHours: content.officeHours || "",
        privacyPolicy: content.privacyPolicy || "",
        refundPolicy: content.refundPolicy || "",
        returnPolicy: content.returnPolicy || "",
        shippingPolicy: content.shippingPolicy || "",
        shippingRestriction: content.shippingRestriction || "",
        termsOfService: content.termsOfService || "",
        tiktokLink: content.tiktokLink || "",
        xLink: content.xLink || "",
        youtubeLink: content.youtubeLink || "",
      });
    }
  }, [content]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertContent(formData).unwrap();
      toast.success("Content updated successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to update content");
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await triggerExport(undefined).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "site-content.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Content exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export content");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const sections = [
    {
      title: "About & Info",
      fields: [
        { name: "aboutUs", label: "About Us", type: "textarea" },
        { name: "achievements", label: "Achievements", type: "textarea" },
        { name: "address", label: "Address", type: "input" },
        { name: "officeHours", label: "Office Hours", type: "input" },
        { name: "map", label: "Map Embed URL", type: "input" },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        { name: "contactEmail", label: "Contact Email", type: "input" },
        { name: "contactPhone", label: "Contact Phone", type: "input" },
      ],
    },
    {
      title: "Social Media Links",
      fields: [
        { name: "facebookLink", label: "Facebook", type: "input" },
        { name: "instagramLink", label: "Instagram", type: "input" },
        { name: "xLink", label: "X (Twitter)", type: "input" },
        { name: "linkedinLink", label: "LinkedIn", type: "input" },
        { name: "youtubeLink", label: "YouTube", type: "input" },
        { name: "tiktokLink", label: "TikTok", type: "input" },
        { name: "githubLink", label: "GitHub", type: "input" },
      ],
    },
    {
      title: "Policies & Legal",
      fields: [
        { name: "privacyPolicy", label: "Privacy Policy", type: "textarea" },
        { name: "termsOfService", label: "Terms of Service", type: "textarea" },
        { name: "cookiePolicy", label: "Cookie Policy", type: "textarea" },
        { name: "disclaimer", label: "Disclaimer", type: "textarea" },
        { name: "refundPolicy", label: "Refund Policy", type: "textarea" },
        { name: "returnPolicy", label: "Return Policy", type: "textarea" },
        { name: "shippingPolicy", label: "Shipping Policy", type: "textarea" },
        {
          name: "shippingRestriction",
          label: "Shipping Restriction",
          type: "input",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Site Content</h2>
          <p className="text-muted-foreground">
            Manage reusable text content for your website.
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-500"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={field.name}
                  className={field.type === "textarea" ? "md:col-span-2" : ""}
                >
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      rows={4}
                      className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {content?.lastUpdatedBy && (
        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          Last updated by {content.lastUpdatedBy.email} (
          {content.lastUpdatedBy.role}) on{" "}
          {new Date(content.lastUpdatedBy.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
