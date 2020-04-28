declare module NodeJS {
  interface Global {
    Weather: Record<string, number>
  }
}

interface Reading {
  temperature: string
  humidity: string
  speed: string
  deg: string
  pressure: string
  visibility: string
  rain: string
  uv: string
  time: string
}
