import { useRef, useState, useCallback } from 'react';
import {
  loadImageFromFile,
  getImageFromClipboard,
  ImageLoadError,
} from '~/lib/utils/image';
import type { LoadedImage } from '~/lib/utils/image';

interface ImageUploadProps {
  onImageLoaded: (image: LoadedImage) => void;
}

export function ImageUpload({ onImageLoaded }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsLoading(true);
      try {
        const loaded = await loadImageFromFile(file);
        onImageLoaded(loaded);
      } catch (err) {
        if (err instanceof ImageLoadError) {
          setError(err.message);
        } else {
          setError('Failed to load image. Please try another file.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onImageLoaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [handleFile],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const file = getImageFromClipboard(e.nativeEvent);
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      ref={dropZoneRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Upload a lure image"
      className={[
        'relative flex flex-col items-center justify-center',
        'mx-auto min-h-[400px] w-full max-w-3xl rounded-2xl',
        'cursor-pointer border-2 border-dashed',
        'transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e17]',
        isDragOver
          ? 'scale-[1.01] border-cyan-400 bg-cyan-400/5'
          : 'border-blue-900 bg-[#0d1426] hover:border-blue-600 hover:bg-[#111d35]',
        isLoading ? 'pointer-events-none opacity-60' : '',
      ].join(' ')}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInput}
        aria-hidden="true"
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-blue-300">Loading image...</p>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center gap-6 p-12 text-center select-none">
          {/* Upload icon */}
          <div
            className={[
              'flex h-20 w-20 items-center justify-center rounded-2xl',
              'transition-colors duration-200',
              isDragOver ? 'bg-cyan-500/20' : 'bg-blue-950',
            ].join(' ')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className={[
                'h-10 w-10 transition-colors duration-200',
                isDragOver ? 'text-cyan-400' : 'text-blue-400',
              ].join(' ')}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          <div>
            <p className="mb-1 text-lg font-medium text-slate-200">
              {isDragOver
                ? 'Drop your lure photo here'
                : 'Upload your lure photo'}
            </p>
            <p className="text-sm text-slate-400">
              Drag & drop, click to browse, or paste from clipboard
            </p>
            <p className="mt-2 text-xs text-slate-600">
              JPEG, PNG, WebP — max 10MB
            </p>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-px w-16 bg-blue-900" />
            <span className="text-xs tracking-wider text-slate-600 uppercase">
              or try a sample
            </span>
            <div className="h-px w-16 bg-blue-900" />
          </div>
        </div>
      )}

      {error && (
        <div className="absolute right-4 bottom-4 left-4 rounded-lg border border-red-700 bg-red-900/80 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
