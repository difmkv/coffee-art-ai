import { generateImageToolDefinition } from './generateImage'
import { redditToolDefinition } from './reddit'
import { dadJokeToolDefinition } from './dadJoke'
import { weatherToolDefinition } from './weather'

export const tools = [
  generateImageToolDefinition,
  redditToolDefinition,
  dadJokeToolDefinition,
  weatherToolDefinition,
]
