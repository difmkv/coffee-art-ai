# 🎨 AI Image Generator

> Your Daily Dose of Bean-tiful Memes, Freshly Brewed ☕

A full-stack TypeScript application that generates AI-powered images with a beautiful React frontend and Express backend. Perfect for creating daily memes and shareable content!

## ✨ Features

- 🤖 **AI-Powered Generation** - Intelligent image creation using OpenAI and custom tools
- 🎯 **Multi-Tool Agent System** - Dad jokes, Reddit posts, weather data, and image generation
- 📱 **Real-time Updates** - Server-Sent Events (SSE) for live generation status
- 🛡️ **Rate Limiting** - Built-in protection with 3 requests per 24 hours
- 📥 **Download & Share** - Easy image downloading and WhatsApp sharing
- 🎨 **Modern UI** - Clean, responsive design with React 19 and Vite
- 🔒 **Type Safety** - Full TypeScript implementation for reliability
- 📊 **Local Database** - LowDB for lightweight data persistence
- 🎭 **Character System** - Dynamic animal prompt generation

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** or **Bun** (recommended for server)
- **npm** or **yarn** for client dependencies
- **OpenAI API Key** for AI functionality
- Environment variables configured (see configuration section)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/difmkv/coffee-art-ai.git
   cd ai-image-generator
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install
   # or if using Bun
   bun install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # In server directory
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the development servers**

   ```bash
   # Backend (Express server) - from server directory
   npm run start
   # or with Bun
   bun run start

   # Frontend (React app) - from client directory, in another terminal
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to start generating images!

## 🏗️ Architecture

### Backend (`/server`)

- **Express.js** server with TypeScript
- **AI Agent System** with multiple tools (dad jokes, Reddit, weather, image generation)
- **OpenAI Integration** for intelligent responses
- **Job Queue Management** with in-memory storage
- **Rate Limiting** to prevent API abuse
- **SSE Streaming** for real-time updates

### Frontend (`/client`)

- **React 19** with TypeScript
- **Vite** for fast development and building
- **CSS Modules** for styled components
- **Lucide React** for beautiful icons

## 🛠️ Tech Stack

| Category      | Technologies                            |
| ------------- | --------------------------------------- |
| **Backend**   | Bun/Node.js, Express.js, TypeScript     |
| **Frontend**  | React 19, Vite, TypeScript, CSS Modules |
| **AI/ML**     | OpenAI API, Custom Agent System         |
| **Database**  | LowDB (JSON-based)                      |
| **Real-time** | Server-Sent Events (SSE)                |
| **Icons**     | Lucide React                            |
| **Dev Tools** | ESLint, TypeScript, TSX, Prettier       |
| **Utilities** | Zod, UUID, Terminal Image               |

## 📁 Project Structure

```
├── server/
│   ├── agent/              # AI agent system
│   │   ├── tools/          # Available tools
│   │   │   ├── dadJoke.ts       # Dad jokes tool
│   │   │   ├── generateImage.ts # Image generation
│   │   │   ├── reddit.ts        # Reddit integration
│   │   │   └── weather.ts       # Weather data
│   │   ├── character/      # Character & prompt generation
│   │   │   ├── generateAnimalPrompt.ts
│   │   │   └── index.ts
│   │   ├── agent.ts        # Main agent logic
│   │   ├── ai.ts          # OpenAI integration
│   │   ├── memory.ts      # Message management
│   │   ├── systemPrompt.ts # System prompts
│   │   ├── toolRunner.ts  # Tool execution
│   │   └── ui.ts          # User interface helpers
│   ├── api/
│   │   └── index.ts       # Express server & API routes
│   ├── types.ts           # TypeScript definitions
│   └── db.json            # Local database
├── client/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ActionButton/   # Download/share buttons
│   │   │   ├── ErrorDialog/    # Error handling modal
│   │   │   ├── ImageGenerator/ # Main app component
│   │   │   └── Spinner/        # Loading animation
│   │   ├── utils/
│   │   │   └── imageActions.ts # Image utility functions
│   │   ├── styles/
│   │   │   └── global.css      # Global styles
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   ├── index.html         # HTML template
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript config
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Reddit API (optional - for Reddit tool)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret

# Weather API (optional - for weather tool)
WEATHER_STACK_API_KEY=your_weather_stack_api_key
```

### Rate Limiting

The application includes built-in rate limiting:

- **3 requests per IP** per 24-hour window
- Configurable in `server/index.ts`
- Prevents API abuse and manages costs

## 🎯 Usage

1. **Click "Generate Image"** - Start the AI generation process with automatic animal prompts
2. **Watch Real-time Updates** - See the prompt and generation status via SSE
3. **AI Tools in Action** - The agent may use dad jokes, Reddit posts, or weather data
4. **Download or Share** - Save your image or share directly to WhatsApp
5. **Daily Limit** - Enjoy 3 free generations per day per IP address

### Available AI Tools

- **🖼️ Image Generation** - Creates images based on prompts
- **😂 Dad Jokes** - Fetches random dad jokes for content
- **📱 Reddit Integration** - Pulls posts from various subreddits
- **🌤️ Weather Data** - Gets current weather information
- **🎭 Character Prompts** - Generates creative animal-themed prompts

## 🚦 API Endpoints

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| `GET`  | `/api/start`         | Start image generation job |
| `GET`  | `/api/stream/:jobId` | SSE stream for job status  |

### Response Examples

**Start Generation:**

```json
{
  "jobId": "1234567890",
  "userMessage": "A cute cat wearing sunglasses"
}
```

**Stream Updates:**

```json
{
  "status": "done",
  "imageUrl": "https://example.com/generated-image.jpg"
}
```

## 🎨 Components

### Key React Components

- **ImageGenerator** - Main application component
- **Spinner** - Loading animation
- **ErrorDialog** - Error handling modal
- **ActionButton** - Download/share buttons

### Utility Functions

- **handleDownloadImage** - Download generated images
- **handleShareToWhatsApp** - Share to WhatsApp
- **extractImageUrl** - Parse AI agent responses

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🌟 Acknowledgments

- Built with ❤️ using modern web technologies
- Powered by AI for creative image generation
- Inspired by the need for daily dose of creativity

## 📞 Support

Having issues? We're here to help!

- 📧 **Direct Contact**: diana.fudulache@gmail.com

---

<div align="center">
  <strong>Made with ☕ and lots of ✨</strong>
  <br>
  <sub>Don't forget to ⭐ this repo if you found it helpful!</sub>
</div>
