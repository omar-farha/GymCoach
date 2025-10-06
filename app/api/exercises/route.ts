import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bodyPart = searchParams.get('bodyPart')

    const url = bodyPart && bodyPart !== 'all'
      ? `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=50`
      : 'https://exercisedb.p.rapidapi.com/exercises?limit=1300'

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': process.env.EXERCISE_DB_API_KEY!,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch exercises')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}
