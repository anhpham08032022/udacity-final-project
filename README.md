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

* Show popup when the user does not input name of todo.

![Alt text](images/client/check_empty.png?raw=true "Image 4")

* Show popup when the user inputs name of todo that contains special characters.

![Alt text](images/client/check_special_characters.png?raw=true "Image 5")

* Disable Todo Item that is expired. Not to allow the user manipulates actions such as: edit/delete/check-uncheck

![Alt text](images/client/disabled.png?raw=true "Image 6")



