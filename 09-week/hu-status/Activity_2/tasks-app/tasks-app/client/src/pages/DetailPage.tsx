import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { API_URL, extractError, getErrorMessage } from '../api';
import { Task, ToastState } from '../types';

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    color: 'danger',
  });

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/tasks/${encodeURIComponent(id)}`);
        if (!response.ok) {
          throw new Error(await extractError(response));
        }
        const data: Task = await response.json();
        setTask(data);
      } catch (err) {
        setTask(null);
        setToast({ isOpen: true, message: getErrorMessage(err), color: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Task detail</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        )}

        {!loading && task && (
          <IonList inset>
            <IonItem>
              <IonLabel>
                <p>ID</p>
                <h2>{task.id}</h2>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p>Title</p>
                <h2>{task.title}</h2>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel className="ion-text-wrap">
                <p>Description</p>
                <h2>{task.description}</h2>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <p>Status</p>
              </IonLabel>
              <IonBadge slot="end" color={task.completed ? 'success' : 'medium'}>
                {task.completed ? 'Completed' : 'Pending'}
              </IonBadge>
            </IonItem>
          </IonList>
        )}

        <IonToast
          isOpen={toast.isOpen}
          message={toast.message}
          color={toast.color}
          duration={3500}
          onDidDismiss={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        />
      </IonContent>
    </IonPage>
  );
};

export default DetailPage;
