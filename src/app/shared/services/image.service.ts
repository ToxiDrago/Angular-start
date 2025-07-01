import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';

export interface ImageCache {
  [url: string]: {
    loaded: boolean;
    error: boolean;
    timestamp: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private imageCache: ImageCache = {};
  private cacheTimeout = 30 * 60 * 1000;
  
  private placeholders = {
    landscape: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTc1IDEyNUgxODVWMTM1SDE3NVYxMjVaIiBmaWxsPSIjOUNBM0FGIi8+PHBhdGggZD0iTTE2NSAxNDBIMTk1VjE0NUgxNjVWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNTUgMTUwSDIwNVYxNTVIMTU1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNMTc1IDEwNUMxODguODA3IDEwNSAyMDAgMTE2LjE5MyAyMDAgMTMwQzIwMCAxNDMuODA3IDE4OC44MDcgMTU1IDE3NSAxNTVDMTYxLjE5MyAxNTUgMTUwIDE0My44MDcgMTUwIDEzMEMxNTAgMTE2LjE5MyAxNjEuMTkzIDEwNSAxNzUgMTA1WiIgZmlsbD0iIzlDQTNBRiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY3Nzg1IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFNlZ29lIFVJLCBSb2JvdG8iIGZvbnQtc2l6ZT0iMTQiPtCY0LfQvtCx0YDQsNC20LXQvdC40LUg0L3QtNC00L7RgdGC0YPQv9C90L48L3RleHQ+PC9zdmc+',
    square: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTM1IDEyNUgxNjVWMTM1SDEzNVYxMjVaIiBmaWxsPSIjOUNBM0FGIi8+PHBhdGggZD0iTTEyNSAxNDBIMTc1VjE0NUgxMjVWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xMTUgMTUwSDE4NVYxNTVIMTE1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNMTUwIDEwNUMxNjMuODA3IDEwNSAxNzUgMTE2LjE5MyAxNzUgMTMwQzE3NSAxNDMuODA3IDE2My44MDcgMTU1IDE1MCAxNTVDMTM2LjE5MyAxNTUgMTI1IDE0My44MDcgMTI1IDEzMEMxMjUgMTE2LjE5MyAxMzYuMTkzIDEwNSAxNTAgMTA1WiIgZmlsbD0iIzlDQTNBRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY3Nzg1IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFNlZ29lIFVJLCBSb2JvdG8iIGZvbnQtc2l6ZT0iMTQiPtCY0LfQvtCx0YDQsNC20LXQvdC40LUg0L3QtdC00L7RgdGC0YPQv9C90L48L3RleHQ+PC9zdmc+',
    portrait: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTM1IDE3NUgxNjVWMTg1SDEzNVYxNzVaIiBmaWxsPSIjOUNBM0FGIi8+PHBhdGggZD0iTTEyNSAxOTBIMTc1VjE5NUgxMjVWMTkwWiIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xMTUgMjAwSDE4NVYyMDVIMTE1VjIwMFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNMTUwIDE1NUMxNjMuODA3IDE1NSAxNzUgMTY2LjE5MyAxNzUgMTgwQzE3NSAxOTMuODA3IDE2My44MDcgMjA1IDE1MCAyMDVDMTM2LjE5MyAyMDUgMTI1IDE5My44MDcgMTI1IDE4MEMxMjUgMTY2LjE5MyAxMzYuMTkzIDE1NSAxNTAgMTU1WiIgZmlsbD0iIzlDQTNBRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY3Nzg1IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFNlZ29lIFVJLCBSb2JvdG8iIGZvbnQtc2l6ZT0iMTQiPtCY0LfQvtCx0YDQsNC20LXQvdC40LUg0L3QtdLC04L7RgdGC0YPQv9C90L48L3RleHQ+PC9zdmc+'
  };

  constructor() {
    setInterval(() => this.cleanCache(), this.cacheTimeout);
  }

  getPlaceholder(aspectRatio: 'landscape' | 'square' | 'portrait' = 'landscape'): string {
    return this.placeholders[aspectRatio];
  }

  processImageUrl(imageUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return this.getPlaceholder();
    }

    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    try {
      const url = new URL(imageUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return imageUrl;
      }
    } catch {
    }

    if (imageUrl.startsWith('./') || imageUrl.startsWith('../') || 
        imageUrl.match(/^[^\/]*\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return imageUrl;
    }

    return this.getPlaceholder();
  }

  preloadImage(imageUrl: string): Observable<boolean> {
    const processedUrl = this.processImageUrl(imageUrl);
    
    if (processedUrl.startsWith('data:')) {
      return from(Promise.resolve(true));
    }

    const cached = this.imageCache[processedUrl];
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return from(Promise.resolve(cached.loaded && !cached.error));
    }

    return from(this.loadImage(processedUrl));
  }

  private async loadImage(imageUrl: string): Promise<boolean> {
    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      this.imageCache[imageUrl] = {
        loaded: true,
        error: false,
        timestamp: Date.now()
      };

      return true;
    } catch {
      this.imageCache[imageUrl] = {
        loaded: false,
        error: true,
        timestamp: Date.now()
      };

      return false;
    }
  }

  isImageLoaded(imageUrl: string): boolean {
    const processedUrl = this.processImageUrl(imageUrl);
    const cached = this.imageCache[processedUrl];
    
    if (!cached || (Date.now() - cached.timestamp) > this.cacheTimeout) {
      return false;
    }

    return cached.loaded && !cached.error;
  }

  hasImageError(imageUrl: string): boolean {
    const processedUrl = this.processImageUrl(imageUrl);
    const cached = this.imageCache[processedUrl];
    
    if (!cached || (Date.now() - cached.timestamp) > this.cacheTimeout) {
      return false;
    }

    return cached.error;
  }

  getFallbackUrl(originalUrl: string): string {
    if (originalUrl.includes('portrait') || originalUrl.includes('vertical')) {
      return this.getPlaceholder('portrait');
    } else if (originalUrl.includes('square')) {
      return this.getPlaceholder('square');
    }
    
    return this.getPlaceholder('landscape');
  }

  private cleanCache(): void {
    const now = Date.now();
    Object.keys(this.imageCache).forEach(url => {
      if (now - this.imageCache[url].timestamp > this.cacheTimeout) {
        delete this.imageCache[url];
      }
    });
  }

  clearCache(): void {
    this.imageCache = {};
  }

  getCacheStats(): { total: number; loaded: number; errors: number; expired: number } {
    const now = Date.now();
    let total = 0;
    let loaded = 0;
    let errors = 0;
    let expired = 0;

    Object.values(this.imageCache).forEach(entry => {
      total++;
      if (now - entry.timestamp > this.cacheTimeout) {
        expired++;
      } else if (entry.error) {
        errors++;
      } else if (entry.loaded) {
        loaded++;
      }
    });

    return { total, loaded, errors, expired };
  }

  preloadImages(imageUrls: string[]): Observable<{ url: string; success: boolean }[]> {
    const loadPromises = imageUrls.map(async (url) => {
      const success = await this.preloadImage(url).toPromise();
      return { url, success };
    });

    return from(Promise.all(loadPromises));
  }
}