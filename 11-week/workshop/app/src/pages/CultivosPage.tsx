import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import CultivosList from '../components/CultivosList';
import { useCultivos } from '../hooks/useCultivos';

interface CultivosPageProps {
  /** Si se omite, el estado vacío no muestra el botón «Registrar cultivo». */
  onCreate?: () => void;
}

const CultivosPage: React.FC<CultivosPageProps> = ({ onCreate }) => {
  const { status, items, errorMessage, refreshError, retry, refresh, dismissRefreshError } =
    useCultivos();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <h1 className="page-title">Mis cultivos</h1>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <CultivosList
          status={status}
          items={items}
          errorMessage={errorMessage}
          onRetry={retry}
          onRefresh={refresh}
          onCreate={onCreate}
        />
      </IonContent>

      <IonToast
        isOpen={Boolean(refreshError)}
        message={refreshError ? `No pudimos actualizar. ${refreshError}` : undefined}
        duration={4000}
        position="bottom"
        buttons={[{ text: 'Cerrar', role: 'cancel' }]}
        onDidDismiss={dismissRefreshError}
      />
    </IonPage>
  );
};

export default CultivosPage;
