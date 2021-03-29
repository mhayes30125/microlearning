import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay  from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { NoteItem } from '../models/NoteItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS);

export class DataAccessManager{

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly notesTable = process.env.NOTES_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX,
        private readonly logger = createLogger('dataAccessManager')){
    }

    async createNote(noteItem:NoteItem): Promise<NoteItem>{
    
        await this.docClient.put({
          TableName: this.notesTable,
          Item: noteItem
        }).promise()
      
        this.logger.info('Created Note Item',noteItem);

        return noteItem;
    }

    async deleteNote(userId:string,noteId:string){
      
      await this.docClient.delete({
        TableName:this.notesTable,
        Key:{
          "userId" : userId,
          "noteId" : noteId,
        },
        ConditionExpression:"userId=:userId and noteId=:noteId",
        ExpressionAttributeValues: {
            ":userId": userId,
            ":noteId" : noteId
        }
      }).promise();

      this.logger.info(`Delete Note Item ${userId} ${noteId}`);
    }

    async updateNote(updatedNote:NoteItem): Promise<NoteItem>{

      let expressionAttributeValues = {
        ":note":updatedNote.note,
        ":category":updatedNote.category,
        ":question":updatedNote.question,
        ":answer":updatedNote.answer,
        ":done":updatedNote.done
      }
  
      let updateExpression = "set #note=:note, category=:category, question=:question, answer=:answer, done=:done"
  
      if(!!updatedNote.attachmentUrl)
      {
        expressionAttributeValues[":attachmentUrl"] = updatedNote.attachmentUrl;
        updateExpression = `${updateExpression},attachmentUrl=:attachmentUrl`
      }
  
      const result = await this.docClient.update({
        TableName: this.notesTable,
        Key:{
          "userId" : updatedNote.userId,
          "noteId" : updatedNote.noteId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues:expressionAttributeValues,
        ExpressionAttributeNames:
        {
            "#note":"note"
        },
        ReturnValues:"UPDATED_NEW"
      }).promise();

      this.logger.info('Update Note Item',result);

      return updatedNote;
    }

    async getNote(userId:string,noteId:string):Promise<NoteItem>{
      
      const result = await this.docClient.query({
        TableName : this.notesTable,
        KeyConditionExpression: 'userId = :userId and noteId = :noteId',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':noteId' : noteId
        }
        }).promise()
    
      const item = result.Items[0] as NoteItem;

      this.logger.info('Get Note Item',item);

      return item;
    }

    async getNotes(userId:string):Promise<NoteItem[]>{

      const result = await this.docClient.query({
        TableName : this.notesTable,
        IndexName : this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
      }).promise();
    
      const items = result.Items as NoteItem[];
      
      this.logger.info('Get Note Items');

      return items;
    }
}


