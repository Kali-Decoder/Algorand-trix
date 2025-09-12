import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tickers: string[] = body?.tickers || [];

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: "No tickers provided" },
        { status: 400 }
      );
    }

    // Fetch all tokens from SimpleSwap API
    const { data } = await axios.get(
      'https://simpleswap.io/api/v3/currencies',
      {
        params: {
          fixed: false,
          includeDisabled: false,
        },
      }
    );

    const filtered = data.filter((token: any) =>
      tickers.includes(token?.symbol?.toLowerCase()) ||
      tickers.includes(token?.cmcTicker?.toLowerCase())
    );

    return NextResponse.json(filtered);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Quotes API Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Quotes API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
