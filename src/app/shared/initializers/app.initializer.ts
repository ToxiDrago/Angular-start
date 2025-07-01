import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { ImageService } from '../services/image.service';

export function appInitializerFactory(): () => Promise<void> {
  return async (): Promise<void> => {
    console.log('🚀 Starting application initialization...');
    
    const configService = inject(ConfigService);
    const imageService = inject(ImageService);

    try {
      await configService.initializeConfig();

      await initializeServices(configService, imageService);
      
      console.log('✅ Application initialization completed successfully');
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      throw error;
    }
  };
}

async function initializeServices(
  configService: ConfigService, 
  imageService: ImageService
): Promise<void> {
  const config = configService.getConfig();
  
  if (config.features.enableImageCaching) {
    console.log('🖼️ Initializing image caching...');
    await preloadCriticalImages(imageService);
  }

  if (config.features.enableAnalytics) {
    console.log('📊 Initializing analytics...');
  }

  console.log('🔧 Services initialized with configuration');
}

async function preloadCriticalImages(imageService: ImageService): Promise<void> {
  const criticalImages = [
    'assets/images/placeholder.jpg',
    'assets/images/ocean.jpg',
    'assets/images/pic1.jpg'
  ];

  try {
    await imageService.preloadImages(criticalImages).toPromise();
    console.log('✅ Critical images preloaded');
  } catch (error) {
    console.warn('⚠️ Some critical images failed to preload:', error);
  }
}

export function createAppInitializer() {
  return () => {
    const configService = inject(ConfigService);
    return configService.initializeConfig();
  };
}