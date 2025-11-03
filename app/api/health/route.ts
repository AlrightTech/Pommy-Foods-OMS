import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    message: "Pommy Foods API is running" 
  })
}

