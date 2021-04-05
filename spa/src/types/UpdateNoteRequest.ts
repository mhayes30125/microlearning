export interface UpdateNoteRequest {
  note: string
  category: string
  question: string
  answer: string
  done: boolean
  attachmentUrl: string
}