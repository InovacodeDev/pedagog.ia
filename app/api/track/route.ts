// app/api/track/route.ts (App Router)
import { NextRequest, NextResponse } from 'next/server';
import { trackServerEvent } from '@/lib/amplitude-server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { eventName, userId, properties } = body;

  await trackServerEvent(eventName, userId, properties);

  return NextResponse.json({ success: true });
}
