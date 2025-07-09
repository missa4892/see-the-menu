import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.IMAGE_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log('--- Upload API route started (OpenAI Vision) ---');
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    console.log('Converting file to base64...');
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');
    const mimeType = file.type;
    console.log('File converted to base64.');

    const prompt = `
      You are an expert menu analyst. Your task is to analyze the following image of a restaurant menu and convert it into a structured JSON format.
      The output must be a single JSON object with one key: "menuItems".
      The value of "menuItems" must be an array of objects, where each object represents a single menu item.
      Each menu item object must have two fields: "title" and "description".

      - "title": The name of the dish.
      - "description": The descriptive text for the dish. If there is no description, use an empty string.

      Analyze the layout, font sizes, and structure of the menu in the image to accurately distinguish titles from descriptions.
      Your response must be only the JSON object, with no other text, explanations, or markdown formatting.
    `;

    console.log('Calling OpenAI Vision API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });
    console.log('OpenAI Vision API call complete.');

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('AI returned empty content.');
    }

    const parsedJson = JSON.parse(content);
    const menuItems = parsedJson.menuItems;

    if (!Array.isArray(menuItems)) {
      throw new Error('AI response was not in the expected format (object with menuItems key containing an array).');
    }

    console.log(`AI parsed ${menuItems.length} menu items from image.`);
    return NextResponse.json({ menuItems });

    } catch (error) {
    const typedError = error as { response?: { data?: { error?: { message?: string } } }, message?: string };
    console.error('--- ERROR in OpenAI Vision API route ---', error);
    return NextResponse.json({ error: typedError.message || 'Failed to process image.' }, { status: 500 });
  }
}
