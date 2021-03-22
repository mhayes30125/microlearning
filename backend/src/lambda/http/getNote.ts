import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { createLogger } from '../../utils/logger'
import { getNote} from '../../businessLogic/note'

const logger = createLogger('getNote')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  try{
    const noteId = event.pathParameters.noteId

    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
  
    logger.info(`Get Note Item ${noteId}`);

    const item = await getNote(noteId,jwtToken );
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item
      })
    }
  }
  catch(e)
  {
    logger.error('Get Note caused error.', {error: e});
  }
  
  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
