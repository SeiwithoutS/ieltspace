import React, { useState, useRef } from 'react';

export type ImageAssetInfo = {
  path?: string | null;
  url?: string | null;
  name: string;
};

export type ImageUploaderProps = {
  currentImage?: ImageAssetInfo | null;
  onUpload: (file: File) => Promise<ImageAssetInfo>;
  onRemove: () => void;
  label?: string;
  disabled?: boolean;
  aspectRatio?: string;
};

export default function ImageUploader({
  currentImage,
  onUpload,
  onRemove,
  label = 'Tải hình ảnh',
  disabled = false,
  aspectRatio,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh (PNG, JPEG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước ảnh tối đa 10 MB.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh thất bại.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-[12px] bg-[#FDF3F0] text-[#C0412A] border border-[#F2B8B5] px-3 py-1.5 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {currentImage?.url || currentImage?.path ? (
        <div className="relative group border border-[#E5E0D8] rounded-xl overflow-hidden bg-[#FAF9F7]">
          <div className={`w-full flex items-center justify-center p-2 ${aspectRatio ? aspectRatio : 'max-h-64'}`}>
            <img
              src={currentImage.url || currentImage.path || ''}
              alt={currentImage.name}
              className="max-h-56 object-contain rounded-lg"
            />
          </div>

          <div className="px-3 py-2 bg-white/90 backdrop-blur-2xs border-t border-[#E5E0D8] flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#352637] truncate max-w-[200px]" title={currentImage.name}>
              {currentImage.name}
            </span>

            {!disabled && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-[#2963CC] hover:underline font-semibold"
                >
                  Thay ảnh
                </button>
                <span className="text-[#D6D4D0]">|</span>
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={uploading}
                  className="text-[#C0412A] hover:underline font-semibold"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !uploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !uploading) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-[#2963CC] bg-[#E3ECFD]'
              : 'border-[#D6D4D0] hover:border-[#8E8392] bg-[#FAF9F7]'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2 text-[#706473]">
              <svg className="animate-spin w-6 h-6 text-[#2963CC]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-[13px] font-medium">Đang tải ảnh lên...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5 text-[#706473]">
              <svg className="w-8 h-8 text-[#A89CA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[13px] font-semibold text-[#352637]">{label}</span>
              <span className="text-[11px] text-[#A89CA8]">Kéo thả tệp hoặc bấm để chọn (PNG, JPG, WebP tối đa 10 MB)</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFileInputChange}
        className="hidden"
      />
    </div>
  );
}
