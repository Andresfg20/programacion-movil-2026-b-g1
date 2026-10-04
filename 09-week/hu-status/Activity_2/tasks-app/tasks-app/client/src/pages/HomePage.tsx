import { useEffect, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { API_URL, extractError, getErrorMessage } from '../api';
import { Task, ToastState } from '../types';

const HomePage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    color: 'success',
  });

  const showToast = (message: string, color: 'success' | 'danger') => {
    setToast({ isOpen: true, message, color });
  };

  // GET on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) {
          throw new Error(await extractError(response));
        }
        const data: Task[] = await response.json();
        setTasks(data);
      } catch (err) {
        showToast(getErrorMessage(err), 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // POST on form submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!response.ok) {
        throw new Error(await extractError(response));
      }
      const created: Task = await response.json();
      setTasks((prev) => [...prev, created]);
      setTitle('');
      setDescription('');
      showToast('Tarea creada correctamente', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Tasks</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Creation form */}
        <IonList inset>
          <IonListHeader>
            <IonLabel>New task</IonLabel>
          </IonListHeader>

          <IonItem>
            <IonInput
              label="Title"
              labelPlacement="floating"
              value={title}
              onIonInput={(e) => setTitle(String(e.detail.value ?? ''))}
            />
          </IonItem>

          <IonItem>
            <IonTextarea
              label="Description"
              labelPlacement="floating"
              rows={3}
              value={description}
              onIonInput={(e) => setDescription(String(e.detail.value ?? ''))}
            />
          </IonItem>

          <div className="ion-padding">
            <IonButton expand="block" onClick={handleSubmit} disabled={loading}>
              Add task
            </IonButton>
          </div>
        </IonList>

        {/* Loading indicator */}
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        )}

        {/* Task list */}
        <IonList inset>
          <IonListHeader>
            <IonLabel>Task list</IonLabel>
          </IonListHeader>

          {!loading && tasks.length === 0 && (
            <IonItem lines="none">
              <IonLabel>No tasks to show.</IonLabel>
            </IonItem>
          )}

          {tasks.map((task) => (
            <IonItem key={task.id} button detail routerLink={`/detail/${task.id}`}>
              <IonLabel>
                <h2>{task.title}</h2>
                <p>{task.description}</p>
              </IonLabel>
              <IonBadge slot="end" color={task.completed ? 'success' : 'medium'}>
                {task.completed ? 'Done' : 'Pending'}
              </IonBadge>
            </IonItem>
          ))}
        </IonList>

        <IonToast
          isOpen={toast.isOpen}
          message={toast.message}
          color={toast.color}
          duration={3500}
          position="bottom"
          onDidDismiss={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
