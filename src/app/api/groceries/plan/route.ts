import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return NextResponse.json(
            { error: 'Groq API key not configured. Set GROQ_API_KEY in .env.local' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { prompt, currentItems } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'A prompt is required' },
                { status: 400 }
            );
        }

        const currentItemNames = (currentItems || []).map((i: any) => i.name).join(', ');

        const groq = new Groq({ apiKey: GROQ_API_KEY });

        const completion = await groq.chat.completions.create({
            model: 'moonshotai/kimi-k2-instruct-0905',
            messages: [
                {
                    role: 'system',
                    content: `You are a smart grocery planning assistant for an Indian household.

RULES:
- Generate a JSON object containing "recipes" based on the user's request.
- Provide AT LEAST 5 distinct recipes/meal ideas.
- Structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "source": "Source (e.g., 'Traditional', 'YouTube - Chef Ranveer Brar', etc.)",
      "sourceUrl": "URL to the recipe source (e.g. YouTube video or blog post)",
      "instructions": ["Step 1", "Step 2", ...],
      "ingredients": [
        { "name": "Ingredient Name", "category": "Category", "isEssential": boolean }
      ]
    }
  ]
}
- Categories: Dairy, Vegetables, Fruits, Grains, Spices, Snacks, Beverages, Meat, Cleaning, Personal Care, Other.
- NEVER suggest lentils (dal) or fish — the user has dietary restrictions.
- Prefer Indian grocery items and brands where applicable.
- Mark staple items as essential (isEssential: true).
- Only return the JSON object, no other text.
- Do NOT include items the user already has: ${currentItemNames || 'none'}.`
                },
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            temperature: 0.7,
            max_completion_tokens: 4096,
        } as any);

        const rawContent = completion.choices[0]?.message?.content || '{}';

        // Try to parse the response
        let data;
        try {
            const cleaned = rawContent
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/gi, '')
                .trim();
            data = JSON.parse(cleaned);
        } catch {
            console.error('Failed to parse Groq response:', rawContent);
            return NextResponse.json(
                { error: 'AI returned an invalid response. Please try again.' },
                { status: 502 }
            );
        }

        // Validate structure
        if (!data.recipes || !Array.isArray(data.recipes)) {
            return NextResponse.json(
                { error: 'AI returned unexpected format.', raw: rawContent },
                { status: 502 }
            );
        }

        return NextResponse.json({ recipes: data.recipes });
    } catch (error: any) {
        console.error('Groq grocery plan error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate grocery plan' },
            { status: 500 }
        );
    }
}
