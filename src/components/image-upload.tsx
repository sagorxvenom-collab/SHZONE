import { useState, useRef, useCallback } from "react";
import { uploadToImgBB } from "@/lib/app";
import { ImagePlus, X, Loader2, GripVertical, Star } from "lucide-react";

export interface UploadedImage {
  url: string;
  thumbUrl: string;
  isMain?: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 6 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const allowed = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      const remaining = maxImages - images.length;
      const toUpload = allowed.slice(0, remaining);
      if (toUpload.length === 0) return;

      setUploading(true);
      setProgress({ done: 0, total: toUpload.length });

      const uploaded: UploadedImage[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        try {
          const result = await uploadToImgBB(toUpload[i]);
          uploaded.push({ url: result.url, thumbUrl: result.thumbUrl });
          setProgress({ done: i + 1, total: toUpload.length });
        } catch (e) {
          console.error("Upload failed:", e);
        }
      }

      const newImages = [...images, ...uploaded].map((img, idx) => ({
        ...img,
        isMain: idx === 0,
      }));
      onChange(newImages);
      setUploading(false);
    },
    [images, onChange, maxImages]
  );

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx).map((img, i) => ({
      ...img,
      isMain: i === 0,
    }));
    onChange(newImages);
  };

  const setMain = (idx: number) => {
    const newImages = images.map((img, i) => ({ ...img, isMain: i === idx }));
    const main = newImages.splice(idx, 1)[0];
    onChange([main, ...newImages]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div key={img.url} className="relative group aspect-[3/4] overflow-hidden rounded-md border border-border/40 bg-muted/20">
              <img src={img.thumbUrl || img.url} alt="" className="w-full h-full object-cover" />
              {img.isMain && (
                <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-yellow-500 text-black text-[9px] font-bold px-1 py-0.5 rounded">
                  <Star className="h-2.5 w-2.5" /> Main
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isMain && (
                  <button
                    type="button"
                    onClick={() => setMain(idx)}
                    className="w-7 h-7 rounded-full bg-yellow-500 text-black flex items-center justify-center"
                    title="Set as main image"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-md transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 py-6 text-center ${
            dragOver
              ? "border-accent bg-accent/10"
              : "border-border/50 hover:border-accent/60 hover:bg-muted/10"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Uploading {progress.done}/{progress.total} to ImgBB...
              </p>
            </>
          ) : (
            <>
              <ImagePlus className="h-7 w-7 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-foreground">Click or drag & drop images</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Upload to ImgBB · {images.length}/{maxImages} images · PNG, JPG, WebP
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
