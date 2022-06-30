# Serverless TODO - Enhancement
Basically, this project enhanced new features based on Todo project of course 4.
You can refer to github of course 4 to see evidence: https://github.com/anhpham08032022/udacity-c4-serverless-todo-app


# Functionality of the application

This application will add more one feature called: *Notify users who has tasks has one day left*

![Alt text](images/lambda/structure.png?raw=true "Image 1")
   
# Functions to be implemented

To enhance this project, I added 2 functions to notify the users in `serverless.yml` file:

* `filterWarningMessage.ts` - This function is triggerd by scheduler (time to trigger depends on the config) to get all todo items in which value of **done** column is *false* and publish message to SNS. (Note: Since I have to find all item which the value of **done** is *false* not based on userId so I used **scan()**).

```ts
const result = await this.docClient.scan({
            TableName: this.todosTable,
            FilterExpression: 'done = :done',
            ExpressionAttributeValues: {
                ':done': false
            },
        }).promise()
```

  * Send message to SNS

  ![Alt text](images/lambda/filter_warning_todo_scheduler.png?raw=true "Image 2")

* `sendWarningMsgNotification.ts` - receive todo items need to notify to user. To simpler I just write the content of message out to console. 

![Alt text](images/lambda/sns-receive-msg.png?raw=true "Image 3")

## Serverless.yml :
```yml

functions:
  ....
  FilterWarningTodo:
    handler: src/lambda/scheduler/filterWarningMessage.handler
    events:
      - schedule:
          rate: rate(1 minute)
          enabled: true
    iamRoleStatements:
      - Effect: Allow
        Action:
          - sns:*
        Resource: "*"
      - Effect: Allow
        Action:
          - dynamodb:Scan
          - dynamodb:GetItem
        Resource: arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}
    environment:
      AWS_ACCOUNT_ID: ${aws:accountId}

  SendWarningMsgNotification:
    handler: src/lambda/sns/sendWarningMsgNotification.handler
    events:
      - sns:
          arn:
            Fn::Join:
              - ':'
              - - arn:aws:sns
                - Ref: AWS::Region
                - Ref: AWS::AccountId
                - ${self:provider.environment.SNS_WARNING_TOPIC}
          topicName: ${self:provider.environment.SNS_WARNING_TOPIC}

```


# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

To implement authentication in your application, you would have to create an Auth0 application and copy "domain" and "client id" to the `config.ts` file in the `client` folder. We recommend using asymmetrically encrypted JWT tokens.

# Best practices

To complete this exercise, please follow the best practices from the 6th lesson of this course.

## Logging

The starter code comes with a configured [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. You can use it to write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```


# Grading the submission

Once you have finished developing your application, please set `apiId` and Auth0 parameters in the `config.ts` file in the `client` folder. A reviewer would start the React development server to run the frontend that should be configured to interact with your serverless application.

**IMPORTANT**

*Please leave your application running until a submission is reviewed. If implemented correctly it will cost almost nothing when your application is idle.*

# Suggestions

To store TODO items, you might want to use a DynamoDB table with local secondary index(es). A create a local secondary index you need to create a DynamoDB resource like this:

```yml

TodosTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: partitionKey
        AttributeType: S
      - AttributeName: sortKey
        AttributeType: S
      - AttributeName: indexKey
        AttributeType: S
    KeySchema:
      - AttributeName: partitionKey
        KeyType: HASH
      - AttributeName: sortKey
        KeyType: RANGE
    BillingMode: PAY_PER_REQUEST
    TableName: ${self:provider.environment.TODOS_TABLE}
    LocalSecondaryIndexes:
      - IndexName: ${self:provider.environment.INDEX_NAME}
        KeySchema:
          - AttributeName: partitionKey
            KeyType: HASH
          - AttributeName: indexKey
            KeyType: RANGE
        Projection:
          ProjectionType: ALL # What attributes will be copied to an index

```

To query an index you need to use the `query()` method like:

```ts
await this.dynamoDBClient
  .query({
    TableName: 'table-name',
    IndexName: 'index-name',
    KeyConditionExpression: 'paritionKey = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': partitionKeyValue
    }
  })
  .promise()
```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")
