// Global image cache to prevent reloading images across components
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();
  private blobUrlMap = new Map<string, string>();

  private async loadWithRetry(url: string, attempt = 0, maxRetries = 2): Promise<HTMLImageElement> {
    // Fetch as blob, create object URL, then decode into Image once to ensure it's decodable
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal, credentials: 'omit' });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.blobUrlMap.set(url, objectUrl);

      // Decode once into Image to warm decode cache
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.src = objectUrl;
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('decode failed'));
      });
      return img;
    } catch (e) {
      if (attempt < maxRetries) {
        const delay = 200 * Math.pow(2, attempt);
        await new Promise(r => setTimeout(r, delay));
        return this.loadWithRetry(url, attempt + 1, maxRetries);
      }
      throw e;
    }
  }

  async preloadImage(url: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create new loading promise with retry
    const loadingPromise = this.loadWithRetry(url)
      .then((img) => {
        this.cache.set(url, img);
        this.loadingPromises.delete(url);
        return img;
      })
      .catch((err) => {
        this.loadingPromises.delete(url);
        throw err;
      });

    this.loadingPromises.set(url, loadingPromise);
    return loadingPromise;
  }

  isImageCached(url: string): boolean {
    return this.cache.has(url) || this.blobUrlMap.has(url);
  }

  getCachedImage(url: string): HTMLImageElement | null {
    return this.cache.get(url) || null;
  }

  // Return the best URL to use in <img src>: prefer cached object URL
  getDisplayUrl(url: string): string {
    return this.blobUrlMap.get(url) || url;
  }

  async preloadMultiple(urls: string[], concurrency = 4): Promise<HTMLImageElement[]> {
    const results: HTMLImageElement[] = [];
    let index = 0;

    const worker = async () => {
      while (index < urls.length) {
        const current = urls[index++];
        try {
          const img = await this.preloadImage(current);
          results.push(img);
        } catch {
          // Swallow errors; preloading is best-effort
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () => worker());
    await Promise.all(workers);
    return results;
  }
}

// Global singleton instance
export const imageCache = new ImageCache();
