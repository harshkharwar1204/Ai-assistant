import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const limit = searchParams.get('limit') || '20';
    const SPLITWISE_ACCESS_TOKEN = process.env.SPLITWISE_ACCESS_TOKEN;

    if (!SPLITWISE_ACCESS_TOKEN) {
        return NextResponse.json(
            { error: 'Splitwise access token not configured. Set SPLITWISE_ACCESS_TOKEN in .env.local' },
            { status: 500 }
        );
    }

    try {
        // Fetch recent expenses from Splitwise
        let url = `https://secure.splitwise.com/api/v3.0/get_expenses?limit=${limit}`;
        if (groupId) {
            url += `&group_id=${groupId}`;
        }

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${SPLITWISE_ACCESS_TOKEN}`,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error('Splitwise API error:', text);
            return NextResponse.json(
                { error: `Splitwise API returned ${res.status}` },
                { status: 502 }
            );
        }

        const data = await res.json();
        const splitwiseExpenses = data.expenses || [];

        // Get current user to determine their share
        const meRes = await fetch('https://secure.splitwise.com/api/v3.0/get_current_user', {
            headers: { 'Authorization': `Bearer ${SPLITWISE_ACCESS_TOKEN}` },
        });
        const meData = await meRes.json();
        const myId = meData.user?.id;

        if (!myId) {
            return NextResponse.json({ error: 'Could not determine Splitwise user' }, { status: 500 });
        }

        // Map Splitwise expenses to our format
        const expenses = splitwiseExpenses
            .filter((e: any) => !e.deleted_at && parseFloat(e.cost) > 0)
            .map((e: any) => {
                // Find user's share
                const myShare = e.users?.find((u: any) => u.user_id === myId);
                const owedAmount = myShare ? parseFloat(myShare.owed_share) : 0;

                // Simple category mapping based on description
                const desc = (e.description || '').toLowerCase();
                let category = 'Other';
                if (desc.includes('food') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('breakfast') || desc.includes('restaurant') || desc.includes('swiggy') || desc.includes('zomato')) {
                    category = 'Food';
                } else if (desc.includes('uber') || desc.includes('ola') || desc.includes('cab') || desc.includes('metro') || desc.includes('fuel') || desc.includes('petrol')) {
                    category = 'Transport';
                } else if (desc.includes('electric') || desc.includes('rent') || desc.includes('wifi') || desc.includes('internet') || desc.includes('bill')) {
                    category = 'Bills';
                } else if (desc.includes('shop') || desc.includes('amazon') || desc.includes('flipkart')) {
                    category = 'Shopping';
                }

                return {
                    amount: owedAmount,
                    category,
                    note: `[Splitwise] ${e.description || 'Expense'}`,
                    date: e.date || new Date().toISOString(),
                };
            })
            .filter((e: any) => e.amount > 0);

        return NextResponse.json(expenses);
    } catch (error: any) {
        console.error('Splitwise sync error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to sync with Splitwise' },
            { status: 500 }
        );
    }
}
