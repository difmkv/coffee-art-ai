import type OpenAI from 'openai'
import {
  generateImage,
  generateImageToolDefinition,
} from './tools/generateImage'
import { reddit, redditToolDefinition } from './tools/reddit'
import { dadJoke, dadJokeToolDefinition } from './tools/dadJoke'
import { weather, weatherToolDefinition } from './tools/weather'

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments) || '{}',
  }

  switch (toolCall.function.name) {
    case weatherToolDefinition.name:
      return weather()

    case generateImageToolDefinition.name:
      return generateImage(input)

    case redditToolDefinition.name:
      return reddit(input)

    case dadJokeToolDefinition.name:
      return dadJoke(input)

    default:
      throw new Error(`Unknown tool: ${toolCall.function.name}`)
  }
}
