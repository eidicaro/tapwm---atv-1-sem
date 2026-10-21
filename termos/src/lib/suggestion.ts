export type SuggestionPayload = { termo: string; descricao: string; status: 'pendente'; data: Date };

// One in-flight request at a time; an uncertain retry retains its original ID and date.
export function createSuggestionSender(allocateId: () => string, write: (id: string, payload: SuggestionPayload) => Promise<void>) {
  let pending: { key: string; id: string; payload: SuggestionPayload } | null = null;
  let inFlight: Promise<void> | null = null;
  return (term: string, description: string): Promise<void> => {
    if (inFlight) return inFlight;
    const key = JSON.stringify([term.trim(), description.trim()]);
    if (pending?.key !== key) pending = { key, id: allocateId(), payload: { termo: term.trim(), descricao: description.trim(), status: 'pendente', data: new Date() } };
    const submission = pending;
    inFlight = Promise.resolve().then(() => write(submission.id, submission.payload)).finally(() => { inFlight = null; });
    return inFlight;
  };
}