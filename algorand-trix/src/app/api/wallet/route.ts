import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Wallet from '@/models/Wallet';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const lowerAddress = address.toLowerCase().trim();

    let wallet = await Wallet.findOne({ address: lowerAddress });

    if (!wallet) {
      wallet = await Wallet.create({ address: lowerAddress });
      return NextResponse.json({ message: 'Wallet created', wallet }, { status: 201 });
    }

    return NextResponse.json({ message: 'Wallet already exists', wallet }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Wallet API Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error('Wallet API Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
