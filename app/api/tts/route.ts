import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: text or voiceId' },
        { status: 400 }
      );
    }

    const apiKey = process.env.TTS_API_KEY;
    const modelId = process.env.TTS_MODEL_ID || 'eleven_flash_v2_5';
    const baseUrl = process.env.TTS_BASE_URL || 'https://api.elevenlabs.io/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'TTS_API_KEY not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${baseUrl}/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
