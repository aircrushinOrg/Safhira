import { NextRequest, NextResponse } from 'next/server';

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const url = `${NOMINATIM_ENDPOINT}?format=json&limit=1&addressdetails=1&countrycodes=my&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SafhiraApp/1.0 (support@safhira.app)',
        'Accept-Language': 'en',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch geocode results' }, { status: 502 });
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 });
    }

    const { lat, lon, display_name: displayName } = results[0] as {
      lat: string;
      lon: string;
      display_name?: string;
    };

    const latitude = Number(lat);
    const longitude = Number(lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: 'Invalid coordinates received' }, { status: 500 });
    }

    return NextResponse.json({
      lat: latitude,
      lon: longitude,
      displayName,
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: 'Failed to process geocode request' }, { status: 500 });
  }
}
