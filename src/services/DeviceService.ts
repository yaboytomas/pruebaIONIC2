import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export class DeviceService {
  // Request camera permissions
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  // Request location permissions
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Capture image from camera
  static async captureImage(): Promise<string | null> {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      const image: Photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      return image.base64String || null;
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    }
  }

  // Get current location
  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const location: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Try to get address using reverse geocoding (simplified)
      try {
        location.address = await this.reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (error) {
        console.warn('Could not get address:', error);
      }

      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  // Simple reverse geocoding (using a free service)
  private static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      return data.locality || data.city || data.principalSubdivision || 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  // Test device capabilities
  static async testDeviceCapabilities(): Promise<{
    camera: boolean;
    location: boolean;
  }> {
    const results = {
      camera: false,
      location: false,
    };

    try {
      results.camera = await this.requestCameraPermission();
    } catch (error) {
      console.error('Camera test failed:', error);
    }

    try {
      results.location = await this.requestLocationPermission();
    } catch (error) {
      console.error('Location test failed:', error);
    }

    return results;
  }
}
