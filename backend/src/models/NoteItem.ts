
export interface NoteItem {
  userId: string
  noteId: string
  createdAt: string
  note: string
  category: string
  question: string
  answer: string
  done: boolean
  startDate: string
  state: number
  attachmentUrl?: string
}
