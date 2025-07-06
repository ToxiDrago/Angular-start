import { Injectable } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  appTitle: string;
  version: string;
  features: {
    enableNotifications: boolean;
    enableImageCaching: boolean;
    enableAnalytics: boolean;
  };
  ui: {
    itemsPerPage: number;
    defaultLanguage: string;
    theme: 'light' | 'dark';
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig = {
    apiUrl: 'http://localhost:3000',
    appTitle: 'Tour Management System',
    version: '1.0.0',
    features: {
      enableNotifications: true,
      enableImageCaching: true,
      enableAnalytics: false
    },
    ui: {
      itemsPerPage: 12,
      defaultLanguage: 'ru',
      theme: 'light'
    }
  };

  private initialized = false;

  async initializeConfig(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🔧 Initializing application configuration...');
      
      // Simulate loading config from server or environment
      await this.loadConfigFromEnvironment();
      
      // Apply any runtime configurations
      this.applyRuntimeConfig();
      
      this.initialized = true;
      console.log('✅ Configuration initialized successfully:', this.config);
    } catch (error) {
      console.error('❌ Failed to initialize configuration:', error);
      // Use default config on error
      this.initialized = true;
    }
  }

  private async loadConfigFromEnvironment(): Promise<void> {
    // Simulate async config loading
    return new Promise((resolve) => {
      setTimeout(() => {
        // In real app, this would load from server or environment files
        const envConfig = {
          apiUrl: this.getEnvironmentValue('API_URL', this.config.apiUrl),
          enableAnalytics: this.getEnvironmentValue('ENABLE_ANALYTICS', false)
        };

        this.config = {
          ...this.config,
          ...envConfig,
          features: {
            ...this.config.features,
            enableAnalytics: envConfig.enableAnalytics
          }
        };

        resolve();
      }, 500);
    });
  }

  private getEnvironmentValue<T>(key: string, defaultValue: T): T {
    // In a real app, this would read from environment variables
    // For demo purposes, we'll use some mock logic
    const mockEnvValues: Record<string, any> = {
      'API_URL': 'http://localhost:3000',
      'ENABLE_ANALYTICS': false
    };

    return mockEnvValues[key] !== undefined ? mockEnvValues[key] : defaultValue;
  }

  private applyRuntimeConfig(): void {
    // Apply any runtime-specific configurations
    if (typeof window !== 'undefined') {
      // Browser-specific config
      if (window.location.hostname === 'localhost') {
        this.config.features.enableAnalytics = false;
      }
    }
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    if (!this.initialized) {
      console.warn('⚠️ Config accessed before initialization');
    }
    return this.config[key];
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('📝 Configuration updated:', updates);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getApiUrl(): string {
    return 'http://localhost:3000'; // Make sure this doesn't include /tours
  }
}