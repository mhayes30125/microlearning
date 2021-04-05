
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
const states = [1,3,5,9]
const millisecondsInADay = 86400000;

export async function createNote(createNoteItem:CreateNoteRequest, jwtToken: string): Promise<NoteItem> {

    const userId = getUserId(jwtToken);

    logger.info(`Create Note for: ${userId}`);
    
    return await dataAccessManager.createNote({
        noteId : uuid.v4(),
        userId : userId,
        createdAt: Date.now(),
        note : createNoteItem.note,
        category : createNoteItem.category,
        question : createNoteItem.question,
        answer : '',
        attachmentUrl: '',
        endDate: Date.now(),
        state: states[0],
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
    
    const notes = await dataAccessManager.getNotes(userId);

    return notes.filter(note =>
      {
        return note.done == false? true: false;
      });
  }

export async function updateNote(noteItemRequest: UpdateNoteRequest,noteId: string, jwtToken: string): Promise<NoteItem> {
    
    logger.info(`Update Notes for: ${noteId}`);
    // 1. Get the current note
    const currentNote = await getNote(noteId,jwtToken);

    // 2. Determine the appropriate state for this note

    var setNewState = 0;

    // Check the incoming request to see if we are done and want to move on to the next state.
    // If there is not another state to move to, then done = true will be saved in the db.
    // Saving done = true means we are done studying this item.
    if(noteItemRequest.done === true)
    {
      const currentIndex = states.indexOf(currentNote.state);
      const nextIndex = currentIndex + 1;
      if(nextIndex <= states.length - 1)
      {
        setNewState = states[nextIndex];
        
        // Reset done for the next state
        noteItemRequest.done = false;
      }      
    }
    else{
      // If I have marked the answer as not done, then I do not want to 
      // increment the state.
      setNewState = currentNote.state;
    }    

    //# of milliseconds since Jan 1, 1970 + (days (state) * millisecondsInADay)
    //before I want to see the note again. aka spaced repetition.
    const calculatedEndDateByState = currentNote.createdAt + (setNewState * millisecondsInADay)

    // 3. Update current Note
    currentNote.note = noteItemRequest.note;
    currentNote.category = noteItemRequest.category;
    currentNote.question = noteItemRequest.question;
    currentNote.answer = noteItemRequest.answer;
    currentNote.done = noteItemRequest.done;
    currentNote.state = setNewState;
    currentNote.endDate = calculatedEndDateByState;
    currentNote.attachmentUrl = noteItemRequest.attachmentUrl;
    
    // 4. Call the data access layer
    const result = dataAccessManager.updateNote(currentNote);

    return result;
}