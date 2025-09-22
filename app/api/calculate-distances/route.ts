/**
 * Distance calculation API route using Google Maps Distance Matrix API for provider location services.
 * This endpoint calculates travel distances and times between user locations and healthcare providers.
 * Features batch processing, coordinate validation, and integration with Google Maps services for accurate distance calculations.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userLatitude, userLongitude, providers } = await request.json();

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    // Filter providers that have coordinates
    const providersWithCoords = providers.filter((p: any) => p.latitude && p.longitude);
    
    // Process in batches of 10 (Google Maps API limit)
    const batchSize = 10;
    const updatedProviders = [...providers];

    for (let i = 0; i < providersWithCoords.length; i += batchSize) {
      const batch = providersWithCoords.slice(i, i + batchSize);
      const destinations = batch.map((p: any) => `${p.latitude},${p.longitude}`).join('|');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLatitude},${userLongitude}&destinations=${destinations}&units=metric&mode=driving&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        data.rows[0].elements.forEach((element: any, index: number) => {
          if (element.status === 'OK') {
            const providerIndex = providers.findIndex((p: any) => p.id === batch[index].id);
            if (providerIndex !== -1) {
              updatedProviders[providerIndex] = {
                ...updatedProviders[providerIndex],
                distance: parseFloat((element.distance.value / 1000).toFixed(1)), // Convert meters to km
                drivingTime: element.duration.text
              };
            }
          }
        });
      }
    }

    return NextResponse.json({ providers: updatedProviders });
  } catch (error) {
    console.error('Error calculating distances:', error);
    return NextResponse.json({ error: 'Failed to calculate distances' }, { status: 500 });
  }
}