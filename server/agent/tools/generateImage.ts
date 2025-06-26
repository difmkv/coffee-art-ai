import type { ToolFn } from '../../types'
import { z } from 'zod'
import { openai } from '../ai'

export const generateImageToolDefinition = {
  name: 'generate_image',
  parameters: z.object({
    prompt: z.string().describe(
      `prompt for the image. Be sure to consider the user's original message when making the prompt. \
        If you are unsure, then ask the user to provide more details.`
    ),
  }),
  description: 'generate an image',
}

type Args = z.infer<typeof generateImageToolDefinition.parameters>

export const generateImage: ToolFn<Args, string> = async ({ toolArgs }) => {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: toolArgs.prompt,
    n: 1,
    size: '1024x1024',
  })

  if (!response.data || response.data.length === 0) {
    throw new Error('Image generation failed: No image data received.')
  }

  const imageUrl = response.data[0].url!

  return imageUrl
}
