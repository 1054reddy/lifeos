"use client";

import { useEffect, useRef, useState, type DragEvent, } from "react";
import {
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";

import {
  deleteDocument,
  getUserDocuments,
  openDocumentFile,
  updateDocument,
  uploadDocument,
  type Document,
} from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        setError(null);

        const data = await getUserDocuments();

        setDocuments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load documents.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  async function handleRename(document: Document) {
    const currentName = document.name.replace(
      /\.pdf$/i,
      "",
    );

    const newName = window.prompt(
      "Enter a new document name:",
      currentName,
    );

    if (
      newName === null ||
      newName.trim() === "" ||
      newName.trim().replace(/\.pdf$/i, "") === currentName
    ) {
      return;
    }

    const normalizedName = newName
      .trim()
      .replace(/\.pdf$/i, "");

    try {
      setRenamingId(document.id);

      const updatedDocument = await updateDocument(
        document.id,
        {
          name: `${normalizedName}.pdf`,
        },
      );

      setDocuments((currentDocuments) =>
        currentDocuments.map((currentDocument) =>
          currentDocument.id === updatedDocument.id
            ? updatedDocument
            : currentDocument,
        ),
      );
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to rename document.",
      );
    } finally {
      setRenamingId(null);
    }
  }

  async function handleDelete(document: Document) {
    const confirmed = window.confirm(
      `Delete "${document.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(document.id);

      await deleteDocument(document.id);

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (currentDocument) =>
            currentDocument.id !== document.id,
        ),
      );
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete document.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!uploading) {
      setDragActive(true);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!uploading) {
      setDragActive(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    if (uploading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      window.alert("Only PDF documents are currently supported.");
      return;
    }

    void uploadSelectedFile(file);
  }

  async function uploadSelectedFile(file: File) {
    try {
      setUploading(true);
      setError(null);

      const document = await uploadDocument(file);

      setDocuments((currentDocuments) => [
        document,
        ...currentDocuments,
      ]);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to upload document.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      window.alert("Only PDF documents are currently supported.");
      return;
    }

    await uploadSelectedFile(file);
  }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Documents"
        description="Upload, organize, and interact with your documents."
      />

      <div className="space-y-4">
        <div
          className={`rounded-xl border p-4 transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "bg-card"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-medium">Your documents</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {dragActive
                  ? "Drop your PDF here to upload it."
                  : documents.length === 0
                    ? "No documents uploaded yet."
                    : `${documents.length} ${
                        documents.length === 1
                          ? "document"
                          : "documents"
                      }`}
              </p>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Upload />
              )}

              {uploading ? "Uploading..." : "Upload document"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>

          <div
            className={`mt-4 rounded-lg border border-dashed p-6 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
          >
            <Upload className="mx-auto size-6 text-muted-foreground" />

            <p className="mt-2 text-sm font-medium">
              {dragActive
                ? "Drop PDF to upload"
                : "Drag and drop a PDF here"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              PDF files only · Maximum file size will be enforced later
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" />
              Loading documents...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
            <div className="mb-4 rounded-xl bg-muted p-3">
              <FileText className="size-6 text-muted-foreground" />
            </div>

            <h3 className="font-medium">
              No documents yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Upload a PDF to start building your personal
              document library.
            </p>
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="divide-y">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {document.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {document.file_type.toUpperCase()}
                        </span>

                        <span>•</span>

                        <span>
                          {formatFileSize(document.file_size)}
                        </span>

                        <span>•</span>

                        <span>
                          {formatDate(document.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:justify-end">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {statusLabel(document.status)}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Open document"
                        onClick={async () => {
                          try {
                            await openDocumentFile(document.id);
                          } catch (err) {
                            window.alert(
                              err instanceof Error
                                ? err.message
                                : "Failed to open document.",
                            );
                          }
                        }}
                        disabled={
                          deletingId === document.id ||
                          renamingId === document.id
                        }
                        aria-label={`Open ${document.name}`}
                      >
                        <FileText />
                      </Button>                      
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Rename document"
                        onClick={() =>
                          handleRename(document)
                        }
                        disabled={
                          renamingId === document.id ||
                          deletingId === document.id
                        }
                        aria-label={`Rename ${document.name}`}
                      >
                        {renamingId === document.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Pencil />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete document"
                        onClick={() =>
                          handleDelete(document)
                        }
                        disabled={
                          deletingId === document.id ||
                          renamingId === document.id
                        }
                        aria-label={`Delete ${document.name}`}
                      >
                        {deletingId === document.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="More actions"
                        disabled
                        aria-label="More document actions"
                      >
                        <MoreHorizontal />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}