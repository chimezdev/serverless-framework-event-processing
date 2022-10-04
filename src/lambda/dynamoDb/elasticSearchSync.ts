import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ES_ENDPOINT
//cr8 an instance of elasticsrch client we will use to write to es
const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record))
    //check the name of event we are processing in a particular record
    if (record.eventName !== 'INSERT') {
      continue
    }
    //get the dynamodb item that was added to dynadb
    const newItem = record.dynamodb.NewImage
    //get an id of the image that was added to dynamodb
    const imageId = newItem.imageId.S
    //create a doc that we want to store on elasticsearch copying all fields from the dydb item to this new object
    const body = {
      imageId: newItem.imageId.S,
      groupId: newItem.groupId.S,
      imageUrl: newItem.imageUrl.S,
      title: newItem.title.S,
      timestamp: newItem.timestamp.S
    }
    //upload this doc to elasticsrch
    await es.index({
      index: 'images-index',
      type: 'images',
      id: imageId,
      body
    })

  }
}
