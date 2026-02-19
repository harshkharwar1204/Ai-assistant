import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const getLocalDateKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const SYSTEM_PROMPT = `You are a personal life assistant for the user's "Omni" app.
You have access to structured tools to help the user manage their life.

TOOLS AVAILABLE:
1. addTask(title: string, date?: string, time?: string)
   - Use when user wants to do something, schedule something, or create a reminder.
   - If 'today', 'tomorrow' is said, convert to YYYY-MM-DD.
   - If no date is specified, default to today.

2. addHabit(name: string)
   - Use when user wants to build a new habit or routine.

3. addGrocery(name: string, category?: string)
   - Use when user wants to buy something or adds to shopping list.
   - Infer category if possible (Dairy, Veg, Fruits, etc).

4. logExpense(amount: number, description: string, category: string)
   - Use when user spends money.
   - Categories: Food, Transport, Bills, Shopping, Entertainment, Health, Other.

5. clearPantry()
   - Use when user explicitly asks to clear all grocery/pantry items.

6. clearTasks(date: string)
   - Use when user explicitly asks to clear all tasks for a specific date.
   - Convert relative dates (today, tomorrow, etc.) to YYYY-MM-DD.

RESPONSE FORMAT:
You must respond in JSON format ONLY.
If the user's intent matches one or more tools, return:
{
  "requests": [
    { "tool": "toolName", "args": { ... } }
  ],
  "message": "Confirmation message to show user"
}

If the user just wants to chat, asks a question, or their request does NOT match any available tool:
{
  "message": "Your conversational response here"
}

CRITICAL RULES:
- ONLY execute tools for the user's LATEST message. Never re-execute tools from prior turns.
- Do NOT re-execute tools for actions that were already confirmed in the conversation history.
- If the user's latest request does NOT match any available tool, respond conversationally. Do NOT fall back to executing a previous tool.
- If you are unsure whether the user wants a tool action or is just chatting, respond conversationally without any tool calls.
- Keep confirmation messages concise and friendly.

Current Date: ${getLocalDateKey()}
`;

export async function POST(request: NextRequest) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return NextResponse.json({ error: 'Groq API Key missing' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { message, history = [] } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        const groq = new Groq({ apiKey: GROQ_API_KEY });

        // Convert simplistic history to Groq format if needed, 
        // but for now we'll just append the new user message to the system prompt context 
        // or strictly follow chat format.

        const messages: any[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: message }
        ];

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            temperature: 0.1, // Low temp for precise tool calling
            response_format: { type: 'json_object' }
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from LLM');
        }

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse LLM JSON:', content);
            // Fallback for malformed JSON
            return NextResponse.json({
                message: "I didn't quite get that. Could you try again?"
            });
        }

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('Assistant API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
