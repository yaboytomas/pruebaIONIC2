import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonText,
} from '@ionic/react';
import { 
  listOutline, 
  checkmarkCircleOutline, 
  addOutline,
  trashOutline 
} from 'ionicons/icons';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { Todo } from '../types/Todo';
import './TodoList.css';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (title: string, description: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
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
          </IonTitle>
          <IonButtons slot="end">
            <IonButton 
              fill="clear" 
              color="danger" 
              onClick={deleteCompletedTodos}
              disabled={completedCount === 0}
            >
              <IonIcon icon={trashOutline} />
              Limpiar Completadas
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="todo-content">
        <div className="todo-container">
          {/* Stats */}
          <div className="todo-stats">
            <IonBadge color="primary">
              {pendingCount} Pendientes
            </IonBadge>
            <IonBadge color="success">
              {completedCount} Completadas
            </IonBadge>
            <IonBadge color="medium">
              {todos.length} Total
            </IonBadge>
          </div>

          {/* Filter Segment */}
          <IonSegment 
            value={filter} 
            onIonChange={(e) => setFilter(e.detail.value as any)}
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
    </IonPage>
  );
};

export default TodoList; 