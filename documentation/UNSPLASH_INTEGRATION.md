# Unsplash Integration Documentation

## Overview

This document describes the implementation of Unsplash image integration for FreeNomad city cards, including caching mechanisms, performance optimizations, and best practices.

## Architecture

### Components

1. **Unsplash Service** (`src/lib/unsplash.ts`)
   - Core service for fetching images from Unsplash API
   - Implements intelligent search with fallback queries
   - Server-side caching using Next.js `unstable_cache`
   - Rate limiting and batch processing

2. **API Routes** (`src/app/api/cities/images/route.ts`)
   - RESTful endpoints for image fetching
   - Request validation with Zod schemas
   - CDN and browser caching headers
   - Error handling and fallback responses

3. **React Hooks** (`src/hooks/use-city-image.ts`)
   - Client-side image fetching with caching
   - Optimistic loading and error handling
   - Batch fetching capabilities
   - Memory management

4. **City Card Integration** (`src/components/city-card.tsx`)
   - Seamless integration with existing image system
   - Fallback to existing images
   - Attribution display
   - Loading states and error handling

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Unsplash API Configuration
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
UNSPLASH_SECRET_KEY="your-unsplash-secret-key"
```

### Getting Unsplash API Keys

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Copy the Access Key and Secret Key
4. Add them to your environment variables

## Features

### Intelligent Image Search

The system uses multiple search strategies with fallbacks:

1. `{cityName} {countryName} skyline`
2. `{cityName} {countryName} cityscape`
3. `{cityName} {countryName} architecture`
4. `{cityName} {countryName}`
5. `{countryName} city`

### Multi-Level Caching

#### Server-Side Caching

- **Duration**: 24 hours (production), 1 hour (development)
- **Technology**: Next.js `unstable_cache`
- **Scope**: Per search query
- **Invalidation**: Time-based with tags

#### CDN Caching

- **Browser Cache**: 24 hours with stale-while-revalidate
- **CDN Cache**: 24 hours for single requests, 1 hour for batch
- **Vercel Edge**: Optimized for global distribution

#### Client-Side Caching

- **Duration**: 24 hours in memory
- **Storage**: Map-based cache with timestamps
- **Management**: Automatic cleanup and error caching

### Performance Optimizations

#### Rate Limiting

- Batch processing with 5 images per batch
- 1-second delay between batches
- Request timeout: 10 seconds

#### Image Optimization

- Uses Unsplash's `regular` size (1080px width)
- Lazy loading with priority for featured cities
- Progressive enhancement with fallbacks

#### Error Handling

- Graceful degradation to fallback images
- Error caching to prevent repeated failed requests
- Network error detection and retry mechanisms

## API Endpoints

### GET `/api/cities/images`

Fetch a single city image.

**Query Parameters:**

- `cityName` (required): Name of the city
- `countryName` (required): Name of the country
- `cityId` (optional): City identifier for tracking

**Response:**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://images.unsplash.com/...",
    "imageAttribution": "Photo by John Doe on Unsplash",
    "imageId": "abc123",
    "cityName": "Paris",
    "countryName": "France"
  }
}
```

### POST `/api/cities/images`

Batch fetch multiple city images.

**Request Body:**

```json
{
  "cities": [
    {
      "id": "city-1",
      "name": "Paris",
      "country": "France"
    },
    {
      "id": "city-2",
      "name": "Tokyo",
      "country": "Japan"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "cityId": "city-1",
      "cityName": "Paris",
      "countryName": "France",
      "imageUrl": "https://images.unsplash.com/...",
      "imageAttribution": "Photo by John Doe on Unsplash",
      "imageId": "abc123",
      "success": true
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  }
}
```

## Usage Examples

### Basic Usage in Components

```tsx
import { useCityImage } from "@/hooks/use-city-image";

function CityComponent({ city }) {
  const { imageUrl, imageAttribution, isLoading, error } = useCityImage(
    city.name,
    city.country,
    {
      enabled: true,
      priority: city.featured,
      fallbackImage: "/default-city.jpg",
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <img src={imageUrl} alt={`${city.name}, ${city.country}`} />
      {imageAttribution && <p>{imageAttribution}</p>}
    </div>
  );
}
```

### Batch Fetching

```tsx
import { useCityImages } from "@/hooks/use-city-image";

function CityGrid({ cities }) {
  const { images, isLoading, error } = useCityImages(cities);

  if (isLoading) return <div>Loading images...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid">
      {cities.map(city => (
        <div key={city.id}>
          <img src={images[city.id]?.imageUrl} alt={city.name} />
        </div>
      ))}
    </div>
  );
}
```

### Preloading Images

```tsx
import { preloadCityImage } from "@/hooks/use-city-image";

// Preload important images
useEffect(() => {
  featuredCities.forEach(city => {
    preloadCityImage(city.name, city.country);
  });
}, [featuredCities]);
```

## Best Practices

### Performance

1. **Use Priority Loading**: Set `priority: true` for above-the-fold images
2. **Implement Fallbacks**: Always provide fallback images
3. **Batch Requests**: Use batch API for multiple images
4. **Preload Critical Images**: Preload featured city images

### Error Handling

1. **Graceful Degradation**: Show fallback content on errors
2. **Retry Mechanisms**: Implement retry logic for network errors
3. **User Feedback**: Show loading states and error messages
4. **Monitoring**: Log errors for debugging

### Caching

1. **Respect Cache Headers**: Use appropriate cache durations
2. **Memory Management**: Clear cache when needed
3. **Error Caching**: Cache errors to prevent repeated failures
4. **Cache Invalidation**: Implement cache busting when needed

## Monitoring and Analytics

### Key Metrics

- **Cache Hit Rate**: Percentage of requests served from cache
- **API Response Time**: Average time for Unsplash API calls
- **Error Rate**: Percentage of failed image requests
- **Image Load Time**: Time to display images to users

### Logging

The system logs the following events:

- Successful image fetches
- API errors and failures
- Cache hits and misses
- Rate limiting events

## Troubleshooting

### Common Issues

#### No Images Loading

1. Check Unsplash API keys in environment variables
2. Verify API key permissions and rate limits
3. Check network connectivity
4. Review browser console for errors

#### Slow Loading

1. Check cache configuration
2. Verify CDN settings
3. Monitor API response times
4. Consider image preloading

#### High API Usage

1. Verify cache is working correctly
2. Check for unnecessary API calls
3. Implement request deduplication
4. Use batch requests for multiple images

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

## Future Enhancements

### Planned Features

1. **Image Optimization**: WebP format support
2. **Advanced Caching**: Redis integration for distributed caching
3. **Analytics**: Detailed usage analytics and reporting
4. **AI Enhancement**: AI-powered image selection and cropping
5. **Offline Support**: Service worker integration for offline images

### Performance Improvements

1. **Edge Computing**: Move image processing to edge functions
2. **Compression**: Implement advanced image compression
3. **Lazy Loading**: Enhanced lazy loading with intersection observer
4. **Prefetching**: Intelligent image prefetching based on user behavior

## Security Considerations

### API Key Protection

- Store API keys in environment variables
- Never expose keys in client-side code
- Use server-side proxy for all API calls
- Implement rate limiting to prevent abuse

### Content Security

- Validate image URLs before display
- Implement content filtering
- Monitor for inappropriate content
- Use HTTPS for all image requests

## Conclusion

The Unsplash integration provides a robust, performant solution for city images with comprehensive caching and error handling. The system is designed to scale with the application while maintaining excellent user experience through optimized loading and fallback mechanisms.
