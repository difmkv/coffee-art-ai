import { JSONFilePreset } from 'lowdb/node'
import type { AIMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'

export type MessageWithMetadata = AIMessage & {
  id: string
  createdAt: string
}

type Data = {
  messages: MessageWithMetadata[]
}

export const addMetadata = (message: AIMessage) => {
  return {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

export const removeMetadata = (message: MessageWithMetadata) => {
  const { id, createdAt, ...rest } = message
  return rest
}

const defaultData: Data = { messages: [] }

export const getDb = async () => {
  const db = await JSONFilePreset<Data>('db.json', defaultData)
  return db
}

export const addMessages = async (messages: AIMessage[]) => {
  const db = await getDb()
  db.data.messages.push(...messages.map(addMetadata))
  await db.write()
}

export const getMessages = async () => {
  const db = await getDb()
  return db.data.messages.map(removeMetadata)
}

export const getImage = async () => {
  const db = await getDb()
  const lastMessage = db.data.messages[db.data.messages.length - 1]

  if (lastMessage && typeof lastMessage.content === 'string') {
    const imageUrlMatch = lastMessage.content.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i)
    if (imageUrlMatch) {
      return imageUrlMatch[0]
    }
  }
  return 'ooops. something went wrong'
}

export const saveToolResponse = async (
  toolCallId: string,
  toolResponse: string
) => {
  return await addMessages([
    {
      role: 'tool',
      content: toolResponse,
      tool_call_id: toolCallId,
    },
  ])
}

export const clearMessages = async () => {
  const db = await getDb()
  db.data.messages = []
  await db.write()
}
