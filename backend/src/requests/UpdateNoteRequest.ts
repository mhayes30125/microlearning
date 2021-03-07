/**
 * Fields in a request to update a single Note item.
 */
export interface UpdateNoteRequest {
  note: string
  category: string
  question: string
  answer: string
  done: boolean
  attachmentUrl: string
}