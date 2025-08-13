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
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './TodoForm.css';

interface TodoFormProps {
  onAddTodo: (title: string, description: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() && description.trim()) {
      onAddTodo(title.trim(), description.trim());
      setTitle('');
      setDescription('');
    }
  };

  const isFormValid = title.trim() && description.trim();

  return (
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
          <IonButtons className="form-buttons">
            <IonButton
              type="submit"
              expand="block"
              disabled={!isFormValid}
              color="primary"
              className="submit-button"
            >
              <IonIcon icon={addOutline} />
              Agregar Tarea
            </IonButton>
          </IonButtons>
        </form>
      </IonCardContent>
    </IonCard>
  );
};

export default TodoForm; 