import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonButtons,
  IonToast,
  IonSpinner,
  IonImg,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/react';
import { addOutline, cameraOutline, locationOutline, trashOutline } from 'ionicons/icons';
import { DeviceService, LocationData } from '../services/DeviceService';
import './TodoForm.css';

interface TodoFormProps {
  onAddTodo: (title: string, description: string, image?: string, location?: LocationData) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() && description.trim()) {
      onAddTodo(
        title.trim(), 
        description.trim(), 
        image || undefined, 
        location || undefined
      );
      setTitle('');
      setDescription('');
      setImage(null);
      setLocation(null);
    }
  };

  const handleTakePhoto = async () => {
    setLoading(true);
    try {
      const imageData = await DeviceService.captureImage();
      if (imageData) {
        setImage(imageData);
        setToastMessage('Imagen capturada exitosamente');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setToastMessage('Error al capturar imagen');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      const locationData = await DeviceService.getCurrentLocation();
      if (locationData) {
        setLocation(locationData);
        setToastMessage('Ubicación obtenida exitosamente');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setToastMessage('Error al obtener ubicación');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const removeLocation = () => {
    setLocation(null);
  };

  const isFormValid = title.trim() && description.trim();

  return (
    <>
      <IonCard className="todo-form-card">
        <IonCardHeader>
          <IonCardTitle className="form-title">
            <IonIcon icon={addOutline} />
            Nueva Tarea
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <form onSubmit={handleSubmit} className="todo-form">
            <IonInput
              value={title}
              onIonInput={(e) => setTitle(e.detail.value || '')}
              placeholder="Título de la tarea"
              className="form-input"
              required
            />
            <IonTextarea
              value={description}
              onIonInput={(e) => setDescription(e.detail.value || '')}
              placeholder="Descripción de la tarea"
              className="form-textarea"
              rows={3}
              required
            />

            {/* Camera and Location Controls */}
            <div className="media-controls">
              <IonButton
                fill="solid"
                size="small"
                className="camera-btn"
                onClick={handleTakePhoto}
                disabled={loading}
              >
                <IonIcon icon={cameraOutline} slot="start" />
                {loading ? <IonSpinner name="dots" /> : 'Tomar Foto'}
              </IonButton>

              <IonButton
                fill="solid"
                size="small"
                className="location-btn"
                onClick={handleGetLocation}
                disabled={loading}
              >
                <IonIcon icon={locationOutline} slot="start" />
                {loading ? <IonSpinner name="dots" /> : 'Obtener Ubicación'}
              </IonButton>
            </div>

            {/* Image Preview */}
            {image && (
              <div className="media-preview">
                <IonItem>
                  <IonLabel>
                    <IonText color="light">📸 Imagen capturada:</IonText>
                    <IonImg 
                      src={`data:image/jpeg;base64,${image}`} 
                      alt="Captured"
                      style={{ maxHeight: '120px', marginTop: '8px' }}
                    />
                  </IonLabel>
                  <IonButton 
                    fill="solid" 
                    size="small" 
                    className="remove-btn"
                    onClick={removeImage}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonItem>
              </div>
            )}

            {/* Location Display */}
            {location && (
              <div className="media-preview">
                <IonItem>
                  <IonLabel>
                    <IonText color="light">📍 Ubicación registrada:</IonText>
                    <p style={{ margin: '4px 0', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                    </p>
                  </IonLabel>
                  <IonButton 
                    fill="solid" 
                    size="small" 
                    className="remove-btn"
                    onClick={removeLocation}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonItem>
              </div>
            )}

            <IonButtons className="form-buttons">
              <IonButton
                type="submit"
                expand="block"
                fill="solid"
                disabled={!isFormValid || loading}
                className="submit-button"
              >
                <IonIcon icon={addOutline} />
                Agregar Tarea
              </IonButton>
            </IonButtons>
          </form>
        </IonCardContent>
      </IonCard>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
    </>
  );
};

export default TodoForm; 