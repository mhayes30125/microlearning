import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateNoteRequest } from '../../requests/UpdateNoteRequest'
import { createLogger } from '../../utils/logger'
import {updateNote} from '../../businessLogic/note'

const cloudwatch = new AWS.CloudWatch();
const logger = createLogger('updateNote')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  let requestWasSuccessful;

  try{
    const noteId = event.pathParameters.noteId
    const updatedNote: UpdateNoteRequest = JSON.parse(event.body)
  
    const authorization = event.headers.Authorization;
    const split = authorization.split(' ');
    const jwtToken = split[1];
      
    const note = await updateNote(updatedNote,noteId, jwtToken);
  
    logger.info('UpdatedNote',note);
    requestWasSuccessful = true;
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(note)
    }
  }
  catch(e)
  {
    requestWasSuccessful = false
    logger.error('Updated Note caused error.', {error: e});
  }
  
  // Write Matric
  await successfulInvocations(requestWasSuccessful);

  return {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}

async function successfulInvocations(requestWasSuccessful)
{
  
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Success',
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: 'UpdateNote'
          }
        ],
        Unit: 'Count',
        Value: requestWasSuccessful ? 1 : 0
      }
    ],
    Namespace: 'microlearning'
  }).promise()
}
