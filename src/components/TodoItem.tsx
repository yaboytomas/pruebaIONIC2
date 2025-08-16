import React, { useState } from 'react';
import {
  IonLabel,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonButtons,
  IonCheckbox,
  IonCard,
  IonCardContent,
  IonImg,
  IonText,
  IonBadge,
} from '@ionic/react';
import { trashOutline, createOutline, checkmarkOutline, closeOutline, locationOutline, cameraOutline } from 'ionicons/icons';
import { Todo } from '../types/Todo';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedTodo: Partial<Todo>) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);

  const handleSave = () => {
    onUpdate(todo.id, {
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setIsEditing(false);
  };

  const toggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  if (isEditing) {
    return (
      <IonCard className="todo-item editing">
        <IonCardContent>
          <IonInput
            value={editTitle}
            onIonInput={(e) => setEditTitle(e.detail.value || '')}
            placeholder="Título de la tarea"
            className="edit-title"
          />
          <IonTextarea
            value={editDescription}
            onIonInput={(e) => setEditDescription(e.detail.value || '')}
            placeholder="Descripción de la tarea"
            className="edit-description"
            rows={3}
          />
          <IonButtons className="edit-buttons">
            <IonButton fill="clear" onClick={handleSave} color="success">
              <IonIcon icon={checkmarkOutline} />
              Guardar
            </IonButton>
            <IonButton fill="clear" onClick={handleCancel} color="medium">
              <IonIcon icon={closeOutline} />
              Cancelar
            </IonButton>
          </IonButtons>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <IonCardContent>
        <div className="todo-header">
          <IonCheckbox
            checked={todo.completed}
            onIonChange={toggleComplete}
            className="todo-checkbox"
          />
          <div className="todo-content">
            <IonLabel className={`todo-title ${todo.completed ? 'completed' : ''}`}>
              {todo.title}
            </IonLabel>
            <IonLabel className={`todo-description ${todo.completed ? 'completed' : ''}`}>
              {todo.description}
            </IonLabel>
            
            {/* Attachment Indicators */}
            {(todo.image || todo.location) && (
              <div className="todo-attachments">
                {todo.image && (
                  <div className="attachment-indicator">
                    <IonIcon icon={cameraOutline} />
                    <span>Foto</span>
                  </div>
                )}
                {todo.location && (
                  <div className="attachment-indicator">
                    <IonIcon icon={locationOutline} />
                    <span>Ubicación</span>
                  </div>
                )}
              </div>
            )}

            {/* Image Display */}
            {todo.image && (
              <div className="todo-media">
                <IonImg 
                  src={`data:image/jpeg;base64,${todo.image}`} 
                  alt="Task image"
                  className="todo-image"
                />
              </div>
            )}

            {/* Location Display */}
            {todo.location && (
              <div className="todo-location">
                <IonBadge color="secondary">
                  <IonIcon icon={locationOutline} />
                  <IonText>
                    {todo.location.address || 
                     `${todo.location.latitude.toFixed(4)}, ${todo.location.longitude.toFixed(4)}`}
                  </IonText>
                </IonBadge>
              </div>
            )}

            <div className="todo-date">
              {todo.createdAt.toLocaleDateString()}
            </div>
          </div>
        </div>
        <IonButtons className="todo-actions">
          <IonButton
            fill="clear"
            onClick={() => setIsEditing(true)}
            color="primary"
            size="small"
          >
            <IonIcon icon={createOutline} />
            Editar
          </IonButton>
          <IonButton
            fill="clear"
            onClick={() => onDelete(todo.id)}
            color="danger"
            size="small"
          >
            <IonIcon icon={trashOutline} />
            Eliminar
          </IonButton>
        </IonButtons>
      </IonCardContent>
    </IonCard>
  );
};

export default TodoItem; 