import { useCallback, useRef, useState } from 'react';
import { Button } from '../shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shadcn/ui/dialog';
import { useFileImportModalStore } from './file-import-modal-store';

export const FileImportModal = () => {
  const { isOpen, title, closeModal } = useFileImportModalStore();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModal(null);
        setFile(null);
        setParsedData(null);
        setError(null);
        setIsDragging(false);
      }
    },
    [closeModal],
  );

  const validateAndParseFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setParsedData(null);

    if (!selectedFile.name.endsWith('.json')) {
      setError('File must be a JSON file (.json)');
      return;
    }

    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);
      setParsedData(parsed);
    } catch (err) {
      setError(
        `Invalid JSON file: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        validateAndParseFile(selectedFile);
      }
    },
    [validateAndParseFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        validateAndParseFile(droppedFile);
      }
    },
    [validateAndParseFile],
  );

  const handleBoxClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleConfirm = useCallback(() => {
    if (parsedData !== null) {
      closeModal(parsedData);
      setFile(null);
      setParsedData(null);
      setError(null);
      setIsDragging(false);
    }
  }, [closeModal, parsedData]);

  const handleCancel = useCallback(() => {
    closeModal(null);
    setFile(null);
    setParsedData(null);
    setError(null);
    setIsDragging(false);
  }, [closeModal]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleBoxClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors w-full ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <p className="text-lg font-medium mb-2">
              {file ? file.name : 'Drop JSON file here or click to browse'}
            </p>
            <p className="text-sm text-gray-500">
              {file
                ? 'Click to select a different file'
                : 'Accepts .json files only'}
            </p>
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {parsedData !== null && !error && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 text-sm font-medium">
                ✓ Valid JSON file loaded
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="cursor-pointer"
            disabled={parsedData === null || !!error}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
