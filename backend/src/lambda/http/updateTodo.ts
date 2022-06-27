import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import 'source-map-support/register'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    
    const isUpdatedSuccess = updateTodo(userId, todoId, updatedTodo)
    if (!isUpdatedSuccess) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "There was an error while updating. Please try again."
        })
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Todo ${todoId} was updated successfully.`
      })
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
