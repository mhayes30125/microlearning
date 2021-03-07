import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateNoteRequest } from '../../requests/CreateNoteRequest'
import { createLogger } from '../../utils/logger'
import {createNote} from '../../businessLogic/note'

const logger = createLogger('createNote')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const newNote: CreateNoteRequest = JSON.parse(event.body)

    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    const newToDoItem = await createNote(newNote.name,newNote.dueDate,jwtToken);

    logger.info('Created Note Item',newToDoItem);
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item : newToDoItem
      })
    }
  }
  catch(e)
  {
    logger.error('Create ToDo caused error.', {error: e});
  }
  
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
