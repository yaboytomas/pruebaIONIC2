import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToast,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { 
  listOutline, 
  trashOutline,
  cloudUploadOutline,
  downloadOutline,
  refreshOutline,
} from 'ionicons/icons';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { Todo } from '../types/Todo';
import { StorageService } from '../services/StorageService';
import { TodoService } from '../services/TodoService';
import { DeviceService, LocationData } from '../services/DeviceService';
import UserProfile from './UserProfile';
import './TodoList.css';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load todos from enhanced storage on component mount
  useEffect(() => {
    loadTodos();
    loadSyncStatus();
    // Migrate from localStorage if needed
    StorageService.migrateFromLocalStorage();
  }, []);

  // Save todos using enhanced storage whenever todos change
  useEffect(() => {
    if (todos.length > 0) {
      StorageService.saveTodos(todos).catch(error => {
        console.error('Error saving todos:', error);
      });
    }
  }, [todos]);

  const loadTodos = async () => {
    try {
      const loadedTodos = await StorageService.loadTodos();
      setTodos(loadedTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      setToastMessage('Error al cargar tareas');
      setShowToast(true);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const syncTime = await StorageService.getLastSyncTime();
      setLastSyncTime(syncTime);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const addTodo = (title: string, description: string, image?: string, location?: LocationData) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
      image,
      location,
    };
    setTodos([newTodo, ...todos]);
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const updateTodo = (id: string, updatedTodo: Partial<Todo>) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, ...updatedTodo } : todo
    ));
  };

  const deleteCompletedTodos = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // API and Device Functions
  const syncTodosToAPI = async () => {
    setLoading(true);
    try {
      await TodoService.syncTodos(todos);
      const now = new Date();
      await StorageService.saveSyncStatus(now);
      setLastSyncTime(now);
      setToastMessage('Tareas sincronizadas exitosamente');
      setShowToast(true);
    } catch (error) {
      console.error('Error syncing todos:', error);
      setToastMessage('Error al sincronizar tareas');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const importTodosFromAPI = async () => {
    setLoading(true);
    try {
      const importedTodos = await TodoService.importTodosFromAPI();
      setTodos([...importedTodos, ...todos]);
      setToastMessage(`${importedTodos.length} tareas importadas`);
      setShowToast(true);
    } catch (error) {
      console.error('Error importing todos:', error);
      setToastMessage('Error al importar tareas');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const testDeviceCapabilities = async () => {
    setLoading(true);
    try {
      const capabilities = await DeviceService.testDeviceCapabilities();
      const apiConnected = await TodoService.testAPIConnection();
      
      const messages = [];
      if (capabilities.camera) messages.push('✓ Cámara disponible');
      else messages.push('✗ Cámara no disponible');
      
      if (capabilities.location) messages.push('✓ GPS disponible');
      else messages.push('✗ GPS no disponible');
      
      if (apiConnected) messages.push('✓ API conectada');
      else messages.push('✗ API no conectada');
      
      setToastMessage(messages.join(' | '));
      setShowToast(true);
    } catch (error) {
      console.error('Error testing capabilities:', error);
      setToastMessage('Error al probar capacidades del dispositivo');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadTodos();
    await loadSyncStatus();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const pendingCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="app-title">
            <IonIcon icon={listOutline} />
            Mi Lista de Tareas
            {loading && <IonSpinner name="dots" style={{ marginLeft: '8px' }} />}
          </IonTitle>
          <IonButtons slot="end" className="header-buttons">
            <IonButton 
              fill="clear" 
              className="header-test-btn"
              onClick={testDeviceCapabilities}
              disabled={loading}
              title="Probar funcionalidades del dispositivo"
            >
              <IonIcon icon={refreshOutline} />
            </IonButton>
            <IonButton 
              fill="clear" 
              className="header-import-btn"
              onClick={importTodosFromAPI}
              disabled={loading}
              title="Importar tareas desde API"
            >
              <IonIcon icon={downloadOutline} />
            </IonButton>
            <IonButton 
              fill="clear" 
              className="header-sync-btn"
              onClick={syncTodosToAPI}
              disabled={loading || todos.length === 0}
              title="Sincronizar tareas con API"
            >
              <IonIcon icon={cloudUploadOutline} />
            </IonButton>
            <IonButton 
              fill="clear" 
              className="header-delete-btn"
              onClick={deleteCompletedTodos}
              disabled={completedCount === 0}
              title="Eliminar tareas completadas"
            >
              <IonIcon icon={trashOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="todo-content">
        <IonRefresher slot="fixed" onIonRefresh={async (event) => {
          await refreshData();
          event.detail.complete();
        }}>
          <IonRefresherContent pullingText="Desliza para actualizar..." refreshingText="Actualizando...">
          </IonRefresherContent>
        </IonRefresher>

        <div className="todo-container">
          {/* User Profile */}
          <UserProfile />
          
          {/* Stats */}
          <div className="todo-stats">
            <IonBadge className="stats-pending">
              {pendingCount} Pendientes
            </IonBadge>
            <IonBadge className="stats-completed">
              {completedCount} Completadas
            </IonBadge>
            <IonBadge className="stats-total">
              {todos.length} Total
            </IonBadge>
            {lastSyncTime && (
              <IonBadge className="stats-sync">
                Último sync: {lastSyncTime.toLocaleTimeString()}
              </IonBadge>
            )}
          </div>

          {/* Filter Segment */}
          <IonSegment 
            value={filter} 
            onIonChange={(e) => setFilter(e.detail.value as 'all' | 'pending' | 'completed')}
            className="filter-segment"
          >
            <IonSegmentButton value="all">
              <IonLabel>Todas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pending">
              <IonLabel>Pendientes</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completadas</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {/* Add Todo Form */}
          <TodoForm onAddTodo={addTodo} />

          {/* Todo List */}
          <div className="todo-list-container">
            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={listOutline} className="empty-icon" />
                <IonText color="medium">
                  {filter === 'all' 
                    ? 'No hay tareas. ¡Agrega tu primera tarea!'
                    : filter === 'pending'
                    ? 'No hay tareas pendientes'
                    : 'No hay tareas completadas'
                  }
                </IonText>
              </div>
            ) : (
              <div className="todo-list">
                {filteredTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        position="bottom"
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

export default TodoList; 