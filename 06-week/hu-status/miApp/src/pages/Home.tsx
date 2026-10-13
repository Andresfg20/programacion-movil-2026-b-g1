import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mi Primera App Ionic React - Semana 06</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Mi Primera App Ionic React - Semana 06</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
          <strong>Proyecto Ionic React en ejecución</strong>
          <p>Entorno configurado correctamente para la Semana 06.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;