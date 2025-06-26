import { z } from 'zod'
import fetch from 'node-fetch'

export const weatherToolDefinition = {
  name: 'weather',
  parameters: z.object({}),
  description: 'use this to get the weather for today in Iasi, Ro',
}

export const weather = async () => {
  const data = await fetch(
    `https://api.weatherstack.com/current?access_key=${process.env.WEATHER_STACK_API_KEY}&query=Iasi`
  ).then((res) => res.json())

  const temperature = data?.current?.temperature

  return String(temperature)
}
