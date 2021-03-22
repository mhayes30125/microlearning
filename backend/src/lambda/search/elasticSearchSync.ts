import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record))
    if (record.eventName !== 'INSERT') {
      continue
    }

    const newImage = record.dynamodb.NewImage

    const imageId = newImage.imageId.S

    // const body = {
    //     userId: newImage.userId.S,
    //     noteId: newImage.noteId.S,
    //     note: newImage.note.S,
    //     category: newImage.category.S,
    //     question: newImage.question.S,
    //     answer: newImage.answer.S,
    // }

    const body = {
        userId: newImage.userId.S,
        noteId: newImage.noteId.S,
        note: newImage.note.S,
        category: newImage.category.S,
        question: newImage.question.S
    }

    await es.index({
      index: 'notes-index',
      type: 'note',
      id: imageId,
      body
    })

  }
}
