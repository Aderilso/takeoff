import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { UploadFile } from '@/types';
import { cn } from '@/lib/utils';

interface UploaderProps {
  files: UploadFile[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function Uploader({
  files,
  onFilesAdd,
  onFileRemove,
  maxFiles = 50,
  maxSizeMB = 100,
}: UploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    const maxSize = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type !== 'application/pdf') continue;
      if (file.size > maxSize) continue;
      if (files.some(f => f.file.name === file.name)) continue;
      validFiles.push(file);
    }

    return validFiles.slice(0, maxFiles - files.length);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        onFilesAdd(validFiles);
      }
    },
    [files, maxFiles, onFilesAdd]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        onFilesAdd(validFiles);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          'rounded-2xl border-2 border-dashed p-8 transition-colors',
          dragActive && 'border-primary bg-primary/5'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Arraste arquivos PDF aqui</p>
            <p className="text-xs text-muted-foreground mt-1">ou clique no botão abaixo</p>
          </div>
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Selecionar PDFs
            </label>
          </Button>
          <p className="text-xs text-muted-foreground">
            Máx. {maxFiles} arquivos • {maxSizeMB} MB por arquivo
          </p>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Arquivos ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.file.size)}
                    </p>
                    {file.status === 'Uploading' && (
                      <Progress value={file.progress} className="h-1 mt-2" />
                    )}
                    {file.error && (
                      <div className="flex items-center gap-1 mt-1 text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">{file.error}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => onFileRemove(file.id)}
                    disabled={file.status === 'Uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
