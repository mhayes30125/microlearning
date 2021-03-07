
import { DataAccessManager } from '../dataLayer/dataAccessManager'
import 'source-map-support/register'
import * as uuid from 'uuid'
import { getUserId } from '../utils/auth'
import { createLogger } from '../utils/logger'
import { NoteItem } from '../models/NoteItem'
import {UpdateNoteRequest} from '../requests/UpdateNoteRequest'
import {CreateNoteRequest} from '../requests/CreateNoteRequest'
const dataAccessManager = new DataAccessManager();
const logger = createLogger('business-note')
const states = [0,3,5,9]

export async function createNote(createNoteItem:CreateNoteRequest, jwtToken: string): Promise<NoteItem> {

    const userId = getUserId(jwtToken);

    logger.info(`Create Note for: ${userId}`);
    
    return await dataAccessManager.createNote({
        noteId : uuid.v4(),
        userId : userId,
        createdAt: new Date().toISOString(),
        note : createNoteItem.note,
        category : createNoteItem.category,
        question : createNoteItem.question,
        answer : '',
        startDate: new Date().toISOString(),
        state: states[1],
        done: false
    });
  }

export async function deleteNote(jwtToken:string,noteId:string) {
    
    const userId = getUserId(jwtToken);

    logger.info(`Delete Note for: ${userId} ${noteId}`);

    return await dataAccessManager.deleteNote(userId,noteId);
}

export async function getNote(noteId:string, jwtToken: string): Promise<NoteItem> {

    const userId = getUserId(jwtToken);

    logger.info(`Get Note for: ${userId} ${noteId}`);
    
    return await dataAccessManager.getNote(userId,noteId);
  }

export async function getNotes(jwtToken: string): Promise<NoteItem[]> {

    const userId = getUserId(jwtToken);

    logger.info(`Get Notes for: ${userId}`);
    
    return await dataAccessManager.getNotes(userId);
  }

export async function updateNote(noteItemRequest: UpdateNoteRequest,noteId: string, jwtToken: string): Promise<NoteItem> {
    
    logger.info(`Update Notes for: ${noteId}`);
    // 1. Get the current note
    const currentNote = await getNote(noteId,jwtToken);

    // 2. Determine the appropriate state for this note

    var setNewState = 0;

    if(currentNote.done === true)
    {
      const currentIndex = states.indexOf(currentNote.state);
      const nextIndex = currentIndex + 1;
      if(nextIndex <= states.length - 1)
      {
        setNewState = states[nextIndex];
      }
    }
    else{
      // If I have marked the answer as not done, then I do not want to 
      // increment the state.
      setNewState = currentNote.state;
    }    

    // 3. Update current Note
    currentNote.note = noteItemRequest.note;
    currentNote.category = noteItemRequest.category;
    currentNote.question = noteItemRequest.question;
    currentNote.answer = noteItemRequest.answer;
    currentNote.done = noteItemRequest.done;
    currentNote.state = setNewState;
    currentNote.attachmentUrl = noteItemRequest.attachmentUrl;
    
    // 4. Call the data access layer
    const result = dataAccessManager.updateNote(currentNote);

    return result;
}