import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const customsearch = google.customsearch('v1');

export async function POST(req: NextRequest) {
  console.log('--- Google Image Search API route started ---');
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Search query is required.' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
      console.error('Google API Key or CX is not configured in .env.local');
      return NextResponse.json({ error: 'Server configuration error: Google API credentials are not set.' }, { status: 500 });
    }

    console.log(`Searching for images with query: "${prompt}"`);
    const res = await customsearch.cse.list({
      auth: apiKey,
      cx: cx,
      q: prompt,
      searchType: 'image',
      num: 1, // We only need the top result
      safe: 'high', // Filter for safe search results
    });

    const firstResult = res.data.items?.[0];
    const imageUrl = firstResult?.link;

    if (!imageUrl) {
      console.log(`No image found for query: "${prompt}"`);
      return NextResponse.json({ error: 'No image found for this item.' }, { status: 404 });
    }

    console.log(`Found image URL: ${imageUrl}`);
    return NextResponse.json({ imageUrl });

    } catch (error) {
    const typedError = error as { response?: { data?: { error?: { message?: string } } }, message?: string };
    console.error('--- ERROR in Google Image Search API route ---', error);
    const errorMessage = typedError.response?.data?.error?.message || typedError.message || 'Failed to search for image.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
