import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import {deleteNote} from '../../businessLogic/note'

const logger = createLogger('deleteNote')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const noteId = event.pathParameters.noteId
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    await deleteNote(jwtToken,noteId);
  
    logger.info('Deleted Note',noteId);
  
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        noteId
      })
    }
  }
  catch(e)
  {
    logger.error('Delete Note caused error.', {error: e});
  }
  
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
