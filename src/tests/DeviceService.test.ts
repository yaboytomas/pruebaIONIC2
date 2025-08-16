import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeviceService } from '../services/DeviceService';

// Mock Capacitor plugins with constants
vi.mock('@capacitor/camera', () => ({
  Camera: {
    requestPermissions: vi.fn(),
    getPhoto: vi.fn(),
  },
  CameraResultType: {
    Base64: 'base64',
    Uri: 'uri',
  },
  CameraSource: {
    Camera: 'camera',
    Photos: 'photos',
  },
}));

vi.mock('@capacitor/geolocation', () => ({
  Geolocation: {
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn(),
  }
}));

// Mock fetch for geocoding
global.fetch = vi.fn();

describe('DeviceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Camera functionality', () => {
    it('should request camera permission successfully', async () => {
      const { Camera } = await import('@capacitor/camera');
      vi.mocked(Camera.requestPermissions).mockResolvedValue({ camera: 'granted', photos: 'granted' } as any);

      const result = await DeviceService.requestCameraPermission();
      
      expect(result).toBe(true);
      expect(Camera.requestPermissions).toHaveBeenCalled();
    });

    it('should handle camera permission denial', async () => {
      const { Camera } = await import('@capacitor/camera');
      vi.mocked(Camera.requestPermissions).mockResolvedValue({ camera: 'denied', photos: 'denied' } as any);

      const result = await DeviceService.requestCameraPermission();
      
      expect(result).toBe(false);
    });

    it('should capture image successfully', async () => {
      const { Camera } = await import('@capacitor/camera');
      vi.mocked(Camera.requestPermissions).mockResolvedValue({ camera: 'granted', photos: 'granted' } as any);
      vi.mocked(Camera.getPhoto).mockResolvedValue({
        base64String: 'test-base64-string',
        format: 'jpeg',
        saved: false
      } as any);

      const result = await DeviceService.captureImage();
      
      expect(result).toBe('test-base64-string');
      expect(Camera.getPhoto).toHaveBeenCalled();
    });

    it('should handle image capture failure', async () => {
      const { Camera } = await import('@capacitor/camera');
      vi.mocked(Camera.requestPermissions).mockRejectedValue(new Error('Permission denied'));

      await expect(DeviceService.captureImage()).rejects.toThrow('Camera permission denied');
    });
  });

  describe('Location functionality', () => {
    it('should request location permission successfully', async () => {
      const { Geolocation } = await import('@capacitor/geolocation');
      vi.mocked(Geolocation.requestPermissions).mockResolvedValue({ 
        location: 'granted', 
        coarseLocation: 'granted' 
      } as any);

      const result = await DeviceService.requestLocationPermission();
      
      expect(result).toBe(true);
      expect(Geolocation.requestPermissions).toHaveBeenCalled();
    });

    it('should get current location successfully', async () => {
      const { Geolocation } = await import('@capacitor/geolocation');
      const mockPosition = {
        coords: {
          latitude: -33.4489,
          longitude: -70.6693,
          accuracy: 10,
          altitudeAccuracy: null,
          altitude: null,
          speed: null,
          heading: null,
        },
        timestamp: Date.now(),
      };

      vi.mocked(Geolocation.requestPermissions).mockResolvedValue({ 
        location: 'granted', 
        coarseLocation: 'granted' 
      } as any);
      vi.mocked(Geolocation.getCurrentPosition).mockResolvedValue(mockPosition as any);
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ locality: 'Santiago' }),
      } as Response);

      const result = await DeviceService.getCurrentLocation();
      
      expect(result).toEqual({
        latitude: -33.4489,
        longitude: -70.6693,
        address: 'Santiago',
      });
    });

    it('should handle location without geocoding', async () => {
      const { Geolocation } = await import('@capacitor/geolocation');
      const mockPosition = {
        coords: {
          latitude: -33.4489,
          longitude: -70.6693,
          accuracy: 10,
          altitudeAccuracy: null,
          altitude: null,
          speed: null,
          heading: null,
        },
        timestamp: Date.now(),
      };

      vi.mocked(Geolocation.requestPermissions).mockResolvedValue({ 
        location: 'granted', 
        coarseLocation: 'granted' 
      } as any);
      vi.mocked(Geolocation.getCurrentPosition).mockResolvedValue(mockPosition as any);
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await DeviceService.getCurrentLocation();
      
      expect(result).toEqual({
        latitude: -33.4489,
        longitude: -70.6693,
        address: '-33.4489, -70.6693',
      });
    });
  });

  describe('Device capabilities testing', () => {
    it('should test all device capabilities', async () => {
      const { Camera } = await import('@capacitor/camera');
      const { Geolocation } = await import('@capacitor/geolocation');
      
      vi.mocked(Camera.requestPermissions).mockResolvedValue({ 
        camera: 'granted', 
        photos: 'granted' 
      } as any);
      vi.mocked(Geolocation.requestPermissions).mockResolvedValue({ 
        location: 'granted', 
        coarseLocation: 'granted' 
      } as any);

      const result = await DeviceService.testDeviceCapabilities();
      
      expect(result).toEqual({
        camera: true,
        location: true,
      });
    });

    it('should handle mixed capabilities', async () => {
      const { Camera } = await import('@capacitor/camera');
      const { Geolocation } = await import('@capacitor/geolocation');
      
      vi.mocked(Camera.requestPermissions).mockResolvedValue({ 
        camera: 'denied', 
        photos: 'denied' 
      } as any);
      vi.mocked(Geolocation.requestPermissions).mockResolvedValue({ 
        location: 'granted', 
        coarseLocation: 'granted' 
      } as any);

      const result = await DeviceService.testDeviceCapabilities();
      
      expect(result).toEqual({
        camera: false,
        location: true,
      });
    });
  });
});