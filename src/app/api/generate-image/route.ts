import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.IMAGE_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const response = await openai.images.generate({
      model: 'dall-e-2',
      prompt: `A high-quality, appetizing photo of ${prompt}, on a clean plate, in a restaurant setting.`,
      n: 1,
      size: '256x256',
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL returned from API.');
    }
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
  }
}
