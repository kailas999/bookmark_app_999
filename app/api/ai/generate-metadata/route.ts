import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { url, title } = await request.json()

        if (!url || !title) {
            return NextResponse.json(
                { error: 'URL and title are required' },
                { status: 400 }
            )
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            )
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // Create the prompt for generating metadata
        const prompt = `You are a helpful assistant that generates bookmark metadata.

Given this bookmark:
- URL: ${url}
- Title: ${title}

Generate the following in JSON format:
1. A concise description (1-2 sentences, max 150 characters) that summarizes what this bookmark is about
2. An array of 3-5 relevant tags (single words or short phrases, lowercase)

Return ONLY a valid JSON object with this exact structure:
{
  "description": "your description here",
  "tags": ["tag1", "tag2", "tag3"]
}

Important:
- Description should be informative and concise
- Tags should be relevant, searchable keywords
- Return ONLY the JSON object, no additional text`

        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        // Extract JSON from markdown code blocks if present
        let jsonText = text.trim()
        const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
            jsonText = jsonMatch[1]
        } else {
            // Try to find JSON object directly
            const directMatch = text.match(/\{[\s\S]*\}/)
            if (directMatch) {
                jsonText = directMatch[0]
            }
        }

        const metadata = JSON.parse(jsonText)

        // Validate the response structure
        if (!metadata.description || !Array.isArray(metadata.tags)) {
            throw new Error('Invalid response structure from AI')
        }

        // Ensure tags are strings and lowercase
        metadata.tags = metadata.tags
            .filter((tag: any) => typeof tag === 'string')
            .map((tag: string) => tag.toLowerCase().trim())
            .slice(0, 5) // Max 5 tags

        // Truncate description if too long
        if (metadata.description.length > 200) {
            metadata.description = metadata.description.substring(0, 197) + '...'
        }

        return NextResponse.json(metadata)
    } catch (error) {
        console.error('AI metadata generation error:', error)

        // Return a user-friendly error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        return NextResponse.json(
            {
                error: 'Failed to generate metadata with AI',
                details: errorMessage,
            },
            { status: 500 }
        )
    }
}
