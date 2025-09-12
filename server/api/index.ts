import 'dotenv/config'
import express, { type RequestHandler } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import { runAgent } from '../agent/agent'
import { tools } from '../agent/tools'
import { generateAnimalPrompt } from '../agent/character'
import { clearMessages } from '../agent/memory'
import type { AIMessage } from '../types'

const app = express()
const port = 8000
let isProcessing = false
const jobStore: Record<
  string,
  {
    status: 'processing' | 'done' | 'error'
    userMessage: string
    imageUrl: string | null
  }
> = {}

app.use(cors({ origin: 'http://localhost:5173' }))

const dailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: 'Too many requests from this IP, please try again after 24 hours.',
  standardHeaders: true,
  legacyHeaders: false,
})

const startHandler: RequestHandler = async (_req, res) => {
  if (isProcessing) {
    return void res.status(429).json({
      success: false,
      message: 'Image generation already in progress. Please try again later.',
    })
  }

  isProcessing = true

  const jobId = Date.now().toString()
  const userMessage = generateAnimalPrompt()

  jobStore[jobId] = {
    status: 'processing',
    userMessage,
    imageUrl: null,
  }

  runAgent({ userMessage, tools })
    .then(async (messages) => {
      const assistantMessageWithTools = messages.find(
        (
          msg
        ): msg is AIMessage & { role: 'assistant'; tool_calls: Array<any> } =>
          msg.role === 'assistant' &&
          'tool_calls' in msg &&
          msg.tool_calls != null &&
          msg.tool_calls.some((tool) => tool.function.name === 'generate_image')
      )

      const toolCallId = assistantMessageWithTools?.tool_calls[0]?.id

      const toolMessage = messages.find(
        (
          msg
        ): msg is AIMessage & {
          role: 'tool'
          content: string
          tool_call_id: string
        } =>
          msg.role === 'tool' &&
          'tool_call_id' in msg &&
          msg.tool_call_id === toolCallId
      )

      const imageUrl = toolMessage?.content

      jobStore[jobId].status = 'done'
      jobStore[jobId].imageUrl = imageUrl ?? null

      await clearMessages()
    })
    .catch((err) => {
      console.error('Image generation failed:', err)
      jobStore[jobId].status = 'error'
    })
    .finally(() => {
      isProcessing = false
    })

  res.json({ jobId, userMessage: userMessage.split('.')[0] })
}

const streamHandler: RequestHandler = (req, res) => {
  const { jobId } = req.params
  const job = jobStore[jobId]

  if (!job) {
    return void res.status(404).end()
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendStatus = () => {
    if (job.status === 'done') {
      res.write(
        `data: ${JSON.stringify({
          status: 'done',
          imageUrl: job.imageUrl,
        })}\n\n`
      )
      clearInterval(interval)
      res.end()
    } else if (job.status === 'error') {
      res.write(`data: ${JSON.stringify({ status: 'error' })}\n\n`)
      clearInterval(interval)
      res.end()
    }
  }

  const interval = setInterval(sendStatus, 1000)

  req.on('close', () => {
    clearInterval(interval)
  })
}

app.get('/api/hello', (req, res) => {
  res.json({ message: '|???Hello from Express backend 👋' })
})

app.get('/hi', (req, res) => {
  console.log('hi endpoint was hit', { req, res })
  res.json({ message: '|???hi from Express backend 👋' })
})

app.post('/api/start', dailyLimiter, startHandler)
app.get('/api/stream/:jobId', streamHandler)

app.listen(port, () => {
  const deployedUrl = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${port}`

  console.log(`✅ Server running at: ${deployedUrl}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
