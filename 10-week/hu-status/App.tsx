import React, { useState, useEffect } from 'react';
import { 
  IonApp, IonPage, IonHeader, IonToolbar, IonTitle, 
  IonContent, IonList, IonItem, IonLabel, IonInput, 
  IonButton, IonToast, setupIonicReact 
} from '@ionic/react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';

setupIonicReact();

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

const API_URL = "http://localhost:3000/productos";

const HomePage: React.FC = () => {
  const history = useHistory();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState<string>('');
  const [precio, setPrecio] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const cargarProductos = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener productos");
      const data = await res.json();
      setProductos(data);
    } catch (err: any) {
      setErrorMsg("Error de red al conectar con el servidor backend");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleCrear = async () => {
    if (!nombre || !precio) {
      setErrorMsg("Por favor completa todos los campos");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio: parseFloat(precio) })
      });

      if (!res.ok) throw new Error("Error al guardar el producto");

      setNombre('');
      setPrecio('');
      cargarProductos();
    } catch (err: any) {
      setErrorMsg("No se pudo crear el producto. Revisa la conexión.");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mini-App Integradora (Semana 10)</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Crear Nuevo Producto</h2>
        <IonItem>
          <IonLabel position="floating">Nombre del Producto</IonLabel>
          <IonInput value={nombre} onIonChange={e => setNombre(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Precio</IonLabel>
          <IonInput type="number" value={precio} onIonChange={e => setPrecio(e.detail.value!)} />
        </IonItem>
        <IonButton expand="block" className="ion-margin-top" onClick={handleCrear}>
          Guardar Producto
        </IonButton>

        <h2 className="ion-margin-top">Lista de Productos</h2>
        <IonList inset={true}>
          {productos.map((prod) => (
            <IonItem key={prod.id} button onClick={() => history.push(`/detalle/${prod.id}`)}>
              <IonLabel>
                <h3>{prod.nombre}</h3>
                <p>${prod.precio}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonToast
          isOpen={!!errorMsg}
          message={errorMsg}
          duration={3000}
          onDidDismiss={() => setErrorMsg('')}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

const DetallePage: React.FC = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="secondary">
          <IonTitle>Detalle del Producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Pantalla de Detalle</h2>
        <p>Navegación confirmada correctamente desde la lista principal.</p>
        <IonButton onClick={() => history.goBack()}>Volver</IonButton>
      </IonContent>
    </IonPage>
  );
};

const App: React.FC = () => (
  <IonApp>
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/detalle/:id" component={DetallePage} />
      </Switch>
    </Router>
  </IonApp>
);

export default App;