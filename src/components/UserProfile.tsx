import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonLabel,
  IonButton,
  IonItem,
  IonAvatar,
  IonBadge,
} from '@ionic/react';
import { 
  personOutline, 
  mailOutline, 
  calendarOutline, 
  logOutOutline 
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) return null;

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <IonCard className="user-profile-card">
      <IonCardHeader>
        <IonCardTitle className="profile-title">
          <IonIcon icon={personOutline} />
          Perfil de Usuario
        </IonCardTitle>
      </IonCardHeader>
      
      <IonCardContent>
        <div className="profile-content">
          <div className="profile-header">
            <IonAvatar className="profile-avatar">
              <div className="avatar-initials">
                {getInitials(user.username)}
              </div>
            </IonAvatar>
            <div className="profile-info">
              <h3>{user.username}</h3>
              <IonBadge color="success" className="status-badge">
                Conectado
              </IonBadge>
            </div>
          </div>

          <div className="profile-details">
            <IonItem className="profile-item" lines="none">
              <IonIcon icon={personOutline} slot="start" />
              <IonLabel>
                <h3>Usuario</h3>
                <p>{user.username}</p>
              </IonLabel>
            </IonItem>

            <IonItem className="profile-item" lines="none">
              <IonIcon icon={mailOutline} slot="start" />
              <IonLabel>
                <h3>Email</h3>
                <p>{user.email}</p>
              </IonLabel>
            </IonItem>

            <IonItem className="profile-item" lines="none">
              <IonIcon icon={calendarOutline} slot="start" />
              <IonLabel>
                <h3>Miembro desde</h3>
                <p>{formatDate(user.createdAt)}</p>
              </IonLabel>
            </IonItem>
          </div>

          <IonButton
            expand="block"
            fill="outline"
            color="danger"
            className="logout-btn"
            onClick={handleLogout}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Cerrar Sesión
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default UserProfile;
