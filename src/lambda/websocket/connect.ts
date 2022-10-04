import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

// cr8 handler fn that use apigatewayproxyhandler
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket connect', event)

  //get the connectionId
  const connectionId = event.requestContext.connectionId
  
  //get the time a connection was established
  const timestamp = new Date().toISOString()

  //cr8 an item that will be stored in a dynamodb table
  const item = {
    id: connectionId,
    timestamp
  }

  console.log('Storing item: ', item)

  //use put method to store this item in dynamodb table 'connectionsTable'
  await docClient.put({
    TableName: connectionsTable,
    Item: item
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
}
