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

// Rate limiter specifically for /api/start endpoint - 3 requests per 24 hours per IP
const startEndpointLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 requests per IP per 24 hours
  message: {
    success: false,
    message:
      "You've reached your daily limit of 3 image generations. Please try again in 24 hours.",
    error: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Get IP address, considering proxy headers
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      'unknown'
    )
  },
  skip: (req) => {
    // Skip rate limiting for development/testing if needed
    return (
      process.env.NODE_ENV === 'development' &&
      req.headers['x-skip-rate-limit'] === 'true'
    )
  },
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      message:
        "You've reached your daily limit of 3 image generations. Please try again in 24 hours.",
      error: 'RATE_LIMIT_EXCEEDED',
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  },
})

// Trust proxy to get real IP addresses (important for rate limiting)
app.set('trust proxy', 1)

const startHandler: RequestHandler = async (req, res) => {
  console.log(`Image generation request from IP: ${req.ip}`)

  if (isProcessing) {
    return res.status(429).json({
      success: false,
      message: 'Image generation already in progress. Please try again later.',
      error: 'GENERATION_IN_PROGRESS',
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

  console.log(`Started job ${jobId} for IP: ${req.ip}`)

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

      console.log(`Completed job ${jobId} successfully`)
      await clearMessages()
    })
    .catch((err) => {
      console.error(`Image generation failed for job ${jobId}:`, err)
      jobStore[jobId].status = 'error'
    })
    .finally(() => {
      isProcessing = false
    })

  res.json({
    success: true,
    jobId,
    userMessage: userMessage.split('.')[0],
  })
}

const streamHandler: RequestHandler = (req, res) => {
  const { jobId } = req.params
  const job = jobStore[jobId]

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found',
      error: 'JOB_NOT_FOUND',
    })
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
      res.write(
        `data: ${JSON.stringify({
          status: 'error',
          message: 'Image generation failed',
        })}\n\n`
      )
      clearInterval(interval)
      res.end()
    }
  }

  const interval = setInterval(sendStatus, 1000)

  req.on('close', () => {
    clearInterval(interval)
  })
}

// Test endpoints
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend 👋' })
})

app.get('/hi', (req, res) => {
  console.log('hi endpoint was hit', { ip: req.ip })
  res.json({ message: 'hi from Express backend 👋' })
})

// Rate limit status endpoint (helpful for debugging)
app.get('/api/rate-limit-status', (req, res) => {
  res.json({
    ip: req.ip,
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
    },
  })
})

// Apply rate limiter only to the start endpoint
app.get('/api/start', startEndpointLimiter, startHandler)
app.get('/api/stream/:jobId', streamHandler)

app.listen(port, () => {
  const deployedUrl = process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${port}`

  console.log(`✅ Server running at: ${deployedUrl}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🛡️  Rate limiting: 3 requests per IP per 24 hours on /api/start`)
})
