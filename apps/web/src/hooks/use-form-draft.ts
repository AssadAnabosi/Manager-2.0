import { useEffect } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * What was typed in the "new" forms, kept for as long as the page stays open, so closing a
 * dialog or drawer (or tapping outside it by mistake) and opening it again brings it back.
 * Memory only: nothing is written to storage, and a reload starts clean.
 */
const drafts = new Map<string, Record<string, unknown>>();

/** The draft of a new-record form, if there is one and `fresh` says this form may use it. */
export function draftOf<T extends FieldValues>(
  key: string,
  fresh: boolean
): Partial<T> | undefined {
  return fresh ? (drafts.get(key) as Partial<T> | undefined) : undefined;
}

/** Forget every draft, e.g. when someone logs out. */
export function clearAllDrafts() {
  drafts.clear();
}

/** Forget a draft: the record was saved. */
export function clearDraft(key: string) {
  drafts.delete(key);
}

/**
 * Keeps `form`'s values as the draft under `key` while `fresh` (a new record, not one being
 * edited and not one opened with prefilled values). `skip` names fields that are never kept,
 * such as passwords.
 */
export function useFormDraft<T extends FieldValues>(
  form: UseFormReturn<T>,
  key: string,
  fresh: boolean,
  skip: string[] = []
) {
  const { watch } = form;
  useEffect(() => {
    if (!fresh) return;
    const subscription = watch((values) => {
      const draft: Record<string, unknown> = {};
      for (const [field, value] of Object.entries(values)) {
        if (value !== undefined && !skip.includes(field)) draft[field] = value;
      }
      drafts.set(key, draft);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, key, fresh]);
}
