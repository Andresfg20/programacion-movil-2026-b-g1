import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import CultivosList from '../components/CultivosList';
import { useCultivos } from '../hooks/useCultivos';

const CultivosPage: React.FC = () => {
  const { status, items, errorMessage, refreshError, retry, refresh, dismissRefreshError } =
    useCultivos();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis cultivos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <CultivosList
          status={status}
          items={items}
          errorMessage={errorMessage}
          onRetry={retry}
          onRefresh={refresh}
          onCreate={() => console.info('Navegar a "Registrar cultivo" (siguiente fase)')}
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
