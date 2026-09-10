"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import {
  createNote,
  deleteNote,
  getUserNotes,
  updateNote,
  type Note,
} from "@/lib/api";

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    async function loadNotes() {
      try {
        setError(null);

        const data = await getUserNotes();
        setNotes(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load notes.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return notes;
    }

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(normalizedSearch) ||
        note.content.toLowerCase().includes(normalizedSearch),
    );
  }, [notes, searchQuery]);

  async function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const note = await createNote({
        title: title.trim(),
        content,
      });

      setNotes((currentNotes) => [note, ...currentNotes]);

      setTitle("");
      setContent("");
      setShowCreateForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create note.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function startEditingNote(note: Note) {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setError(null);
  }

  function cancelEditingNote() {
    setEditingNoteId(null);
    setEditTitle("");
    setEditContent("");
  }

  async function handleSaveNote(noteId: string) {
    if (!editTitle.trim()) {
      return;
    }

    try {
      setSavingNoteId(noteId);
      setError(null);

      const updatedNote = await updateNote(noteId, {
        title: editTitle.trim(),
        content: editContent,
      });

      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note,
        ),
      );

      cancelEditingNote();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update note.",
      );
    } finally {
      setSavingNoteId(null);
    }
  }

  async function handleTogglePin(note: Note) {
    try {
      setSavingNoteId(note.id);
      setError(null);

      const updatedNote = await updateNote(note.id, {
        is_pinned: !note.is_pinned,
      });

      setNotes((currentNotes) =>
        currentNotes
          .map((currentNote) =>
            currentNote.id === updatedNote.id
              ? updatedNote
              : currentNote,
          )
          .sort(
            (a, b) =>
              Number(b.is_pinned) - Number(a.is_pinned) ||
              new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime(),
          ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update note.",
      );
    } finally {
      setSavingNoteId(null);
    }
  }

  async function handleDeleteNote(note: Note) {
    const confirmed = window.confirm(
      `Delete "${note.title}"?\n\nThis will permanently delete the note.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingNoteId(note.id);
      setError(null);

      await deleteNote(note.id);

      setNotes((currentNotes) =>
        currentNotes.filter((currentNote) => currentNote.id !== note.id),
      );

      if (editingNoteId === note.id) {
        cancelEditingNote();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete note.",
      );
    } finally {
      setDeletingNoteId(null);
    }
  }

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <PageHeader
        title="Notes"
        description="Capture ideas, information, and thoughts in one place."
      />

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <label htmlFor="note-search" className="sr-only">
            Search notes
          </label>

          <input
            id="note-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {showCreateForm ? (
            <>
              <X className="size-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="size-4" />
              New Note
            </>
          )}
        </button>
      </div>

      {showCreateForm && (
        <section className="rounded-xl border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Create a note</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Write down an idea, reminder, or anything you want to keep.
            </p>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="note-title" className="text-sm font-medium">
                Title
              </label>

              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Project ideas"
                maxLength={200}
                required
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="note-content" className="text-sm font-medium">
                Content
              </label>

              <textarea
                id="note-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing..."
                rows={8}
                className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreating || !title.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create Note"}
              </button>
            </div>
          </form>
        </section>
      )}

      {!isLoading && notes.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {filteredNotes.length}{" "}
          {filteredNotes.length === 1 ? "note" : "notes"}
          {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <FileText className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold">
            {searchQuery.trim() ? "No matching notes" : "No notes yet"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {searchQuery.trim()
              ? "Try a different search term."
              : "Create your first note to start capturing your ideas."}
          </p>

          {!searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Create your first note
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => {
            const isEditing = editingNoteId === note.id;
            const isSaving = savingNoteId === note.id;
            const isDeleting = deletingNoteId === note.id;

            return (
              <article
                key={note.id}
                className="flex min-h-56 flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm"
              >
                {isEditing ? (
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor={`edit-note-title-${note.id}`}
                        className="text-sm font-medium"
                      >
                        Title
                      </label>

                      <input
                        id={`edit-note-title-${note.id}`}
                        type="text"
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(event.target.value)
                        }
                        maxLength={200}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-2">
                      <label
                        htmlFor={`edit-note-content-${note.id}`}
                        className="text-sm font-medium"
                      >
                        Content
                      </label>

                      <textarea
                        id={`edit-note-content-${note.id}`}
                        value={editContent}
                        onChange={(event) =>
                          setEditContent(event.target.value)
                        }
                        rows={7}
                        className="min-h-32 flex-1 resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingNote}
                        disabled={isSaving}
                        className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveNote(note.id)}
                        disabled={isSaving || !editTitle.trim()}
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">
                          {note.title}
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Updated {formatUpdatedAt(note.updated_at)}
                        </p>
                      </div>

                      {note.is_pinned && (
                        <Pin className="size-4 shrink-0 text-primary" />
                      )}
                    </div>

                    <div className="mt-4 flex-1">
                      <p className="line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">
                        {note.content || "No content yet."}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <button
                        type="button"
                        onClick={() => startEditingNote(note)}
                        className="text-sm font-medium hover:underline"
                      >
                        Edit
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(note)}
                          disabled={isSaving || isDeleting}
                          title={note.is_pinned ? "Unpin note" : "Pin note"}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                        >
                          {note.is_pinned ? (
                            <PinOff className="size-4" />
                          ) : (
                            <Pin className="size-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note)}
                          disabled={isSaving || isDeleting}
                          title="Delete note"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}