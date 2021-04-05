
export interface NoteItem {
  userId: string
  noteId: string
  createdAt: number
  note: string
  category: string
  question: string
  answer: string
  done: boolean
  endDate: number
  state: number
  attachmentUrl?: string
}
