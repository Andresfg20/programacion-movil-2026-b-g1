import React, { useState } from 'react';
import { 
  IonApp, IonPage, IonHeader, IonToolbar, IonTitle, 
  IonContent, IonList, IonItem, IonLabel, IonButton, 
  IonIcon, setupIonicReact 
} from '@ionic/react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { arrowBack } from 'ionicons/icons';

setupIonicReact();

// Página 1: Lista de Tareas y Contador con useState
const HomePage: React.FC = () => {
  const history = useHistory();
  const [contador, setContador] = useState<number>(0);

  const tareas = [
    { id: 1, titulo: 'Aprender componentes de Ionic React' },
    { id: 2, titulo: 'Manejar estado local con useState' },
    { id: 3, titulo: 'Configurar rutas con React Router' },
    { id: 4, titulo: 'Conectar con la API de la Semana 08' },
    { id: 5, titulo: 'Subir la actividad a GitHub' }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Semana 09 - Ionic React</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Contador de Clics</h2>
        <p>Valor actual: <strong>{contador}</strong></p>
        <IonButton onClick={() => setContador(contador + 1)}>
          Incrementar Contador
        </IonButton>

        <h2 className="ion-margin-top">Lista de Tareas</h2>
        <IonList inset={true}>
          {tareas.map((tarea) => (
            <IonItem key={tarea.id}>
              <IonLabel>{tarea.titulo}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonButton 
          expand="block" 
          color="secondary" 
          className="ion-margin-top"
          onClick={() => history.push('/detalle')}
        >
          Ir a Segunda Página
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

// Página 2: Pantalla de Detalle (Navegación)
const DetallePage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="secondary">
          <IonTitle>Segunda Página</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>¡Bienvenido a la 2ª Página!</h2>
        <p>Esta pantalla confirma la navegación correcta con React Router en Ionic.</p>
        
        <IonButton 
          fill="clear" 
          onClick={() => history.goBack()}
        >
          <IonIcon slot="start" icon={arrowBack} />
          Volver a Inicio
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

// Componente Principal con Navegación
const App: React.FC = () => (
  <IonApp>
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/detalle" component={DetallePage} />
      </Switch>
    </Router>
  </IonApp>
);

export default App;