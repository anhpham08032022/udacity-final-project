import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// Implement businessLogic acts as service layer

const todosAccess = new TodosAccess()
const logger = createLogger('todos')
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
    return await todosAccess.getTodosByUserId(userId)
}

export async function createTodos(createTodoRequest:CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid.v4()
    logger.info(`Creating new todo with todoId: ${todoId}`, {todoId})
    return await todosAccess.createTodos({
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        ...createTodoRequest,
        done: false,
        attachmentUrl: getAttachmentUrl(todoId)
    })
}

export async function deleteTodoItem(userId: string, todoId: string): Promise<Boolean> {
    logger.info(`Deleting todo ${todoId} for user ${userId}`, { todoId, userId })
    return await todosAccess.deleteTodoItem(userId, todoId)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<Boolean> {
    logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, updatedTodo: updatedTodo })
    return await todosAccess.updateTodo(userId, todoId, updatedTodo)
  }

export async function getSignedUploadUrl(todoId: string): Promise<string> {
    logger.info(`Start getting signedUrl with todo id ${todoId}`)
    return await todosAccess.getSignedUploadUrl(todoId)
}

function getAttachmentUrl(attachmentId: string): string {
    return `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
}