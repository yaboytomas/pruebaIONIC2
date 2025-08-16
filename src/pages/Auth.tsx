import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonToast,
  IonSpinner,
} from '@ionic/react';
import { personOutline, mailOutline, lockClosedOutline, logInOutline, personAddOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const AuthPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    usernameOrEmail: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('danger');

  const handleLogin = async () => {
    try {
      if (!formData.usernameOrEmail || !formData.password) {
        setToastMessage('Por favor ingresa usuario/email y contraseña');
        setToastColor('warning');
        setShowToast(true);
        return;
      }

      await login(formData.usernameOrEmail, formData.password);
      setToastMessage('¡Inicio de sesión exitoso!');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Error al iniciar sesión');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleRegister = async () => {
    try {
      if (!formData.username || !formData.email || !formData.password) {
        setToastMessage('Por favor completa todos los campos');
        setToastColor('warning');
        setShowToast(true);
        return;
      }

      await register(formData.username, formData.email, formData.password);
      setToastMessage('¡Registro exitoso!');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Error al registrarse');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={personOutline} style={{ marginRight: '8px' }} />
            {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="auth-content">
        <div className="auth-container">
          <IonCard className="auth-card">
            <IonCardHeader>
              <IonCardTitle className="auth-title">
                <IonIcon 
                  icon={mode === 'login' ? logInOutline : personAddOutline} 
                  className="auth-icon"
                />
                Mi Lista de Tareas
              </IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {/* Mode Segment */}
              <IonSegment 
                value={mode} 
                onIonChange={(e) => setMode(e.detail.value as 'login' | 'register')}
                className="auth-segment"
              >
                <IonSegmentButton value="login">
                  <IonLabel>Iniciar Sesión</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="register">
                  <IonLabel>Registrarse</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              <form onSubmit={handleSubmit} className="auth-form">
                {mode === 'login' ? (
                  <>
                    {/* Login Form */}
                    <IonItem className="auth-item">
                      <IonIcon icon={personOutline} slot="start" />
                      <IonInput
                        value={formData.usernameOrEmail}
                        onIonInput={(e) => setFormData({
                          ...formData, 
                          usernameOrEmail: e.detail.value || ''
                        })}
                        placeholder="Usuario o Email"
                        type="text"
                        required
                      />
                    </IonItem>

                    <IonItem className="auth-item">
                      <IonIcon icon={lockClosedOutline} slot="start" />
                      <IonInput
                        value={formData.password}
                        onIonInput={(e) => setFormData({
                          ...formData, 
                          password: e.detail.value || ''
                        })}
                        placeholder="Contraseña"
                        type="password"
                        required
                      />
                    </IonItem>
                  </>
                ) : (
                  <>
                    {/* Register Form */}
                    <IonItem className="auth-item">
                      <IonIcon icon={personOutline} slot="start" />
                      <IonInput
                        value={formData.username}
                        onIonInput={(e) => setFormData({
                          ...formData, 
                          username: e.detail.value || ''
                        })}
                        placeholder="Nombre de usuario"
                        type="text"
                        required
                      />
                    </IonItem>

                    <IonItem className="auth-item">
                      <IonIcon icon={mailOutline} slot="start" />
                      <IonInput
                        value={formData.email}
                        onIonInput={(e) => setFormData({
                          ...formData, 
                          email: e.detail.value || ''
                        })}
                        placeholder="Email"
                        type="email"
                        required
                      />
                    </IonItem>

                    <IonItem className="auth-item">
                      <IonIcon icon={lockClosedOutline} slot="start" />
                      <IonInput
                        value={formData.password}
                        onIonInput={(e) => setFormData({
                          ...formData, 
                          password: e.detail.value || ''
                        })}
                        placeholder="Contraseña (mínimo 6 caracteres)"
                        type="password"
                        required
                      />
                    </IonItem>
                  </>
                )}

                <IonButton
                  type="submit"
                  expand="block"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <IonSpinner name="dots" />
                  ) : (
                    <>
                      <IonIcon 
                        icon={mode === 'login' ? logInOutline : personAddOutline} 
                        slot="start" 
                      />
                      {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                    </>
                  )}
                </IonButton>
              </form>

              {/* Demo Credentials */}
              {mode === 'login' && (
                <div className="demo-credentials">
                  <IonText color="medium">
                    <h6>Credenciales de prueba:</h6>
                    <p>Usuario: <strong>demo</strong> | Contraseña: <strong>demo123</strong></p>
                    <p>Usuario: <strong>test</strong> | Contraseña: <strong>test123</strong></p>
                  </IonText>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="bottom"
        color={toastColor}
        buttons={[
          {
            text: 'Cerrar',
            role: 'cancel'
          }
        ]}
      />
    </IonPage>
  );
};

export default AuthPage;
