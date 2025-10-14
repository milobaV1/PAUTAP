import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useUploadCertificate } from "./api/upload-certificate";
import type { UploadCertificatePayload } from "@/service/interfaces/certificate.interface";

interface CertificateUploadDialogProps {
  userId: string;
  onSuccess?: () => void;
}

export function CertificateUploadDialog({
  userId,
  onSuccess,
}: CertificateUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [issuedDate, setIssuedDate] = useState("");

  const { mutateAsync: uploadCertificate, isPending } = useUploadCertificate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        alert("Please select a PDF file");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload: UploadCertificatePayload = {
        title,
        issuedBy: issuedBy || undefined,
        issuedDate: issuedDate || undefined,
        file,
      };

      await uploadCertificate({ userId, payload });

      // Reset form
      setFile(null);
      setTitle("");
      setIssuedBy("");
      setIssuedDate("");
      setOpen(false);

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload certificate. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="pau-gradient">
          <Upload className="w-4 h-4 mr-2" />
          Upload Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload External Certificate</DialogTitle>
          <DialogDescription>
            Add certificates from external courses (Udemy, Coursera, etc.)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">PDF File *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition">
              <input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">
                  {file ? file.name : "Click to select PDF"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF files only, max 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Certificate Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Advanced Python Programming"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Issued By */}
          <div className="space-y-2">
            <Label htmlFor="issuedBy">Issued By (Optional)</Label>
            <Input
              id="issuedBy"
              placeholder="e.g., Udemy, Coursera, Google"
              value={issuedBy}
              onChange={(e) => setIssuedBy(e.target.value)}
            />
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label htmlFor="issuedDate">Issue Date (Optional)</Label>
            <Input
              id="issuedDate"
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="pau-gradient flex-1"
              disabled={isPending}
            >
              {isPending ? "Uploading..." : "Upload Certificate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
