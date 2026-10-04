# Tasks App (Ionic React + Express)

## How to run

```bash
# Terminal 1 - API (http://localhost:5000)
cd server
npm install
npm start

# Terminal 2 - Ionic React client (http://localhost:5173)
cd client
npm install
npm run dev
```

## Architecture

The backend is an Express server (`server.js`) listening on port 5000 that uses the `cors()` and `express.json()` middlewares and keeps every task in an in-memory JavaScript array. The `GET /api/tasks` endpoint returns the whole array as JSON with status 200, where each element follows the shape `{ "id": string, "title": string, "description": string, "completed": boolean }`. The `POST /api/tasks` endpoint expects a JSON body containing `title` and `description`, and it responds with status 400 and `{ "error": "El campo 'X' es requerido" }` when either field is missing or empty. When the body is valid, the server generates a unique id with `Date.now().toString()`, sets `completed` to `false`, stores the task, and returns it with status 201. A complementary `GET /api/tasks/:id` endpoint returns a single task or a 404 error object, which the detail screen uses to load one record from its route parameter. On the client, the shared TypeScript `Task` interface describes this JSON contract, and React state is handled with `useState` for the task list, the form fields, the `loading` flag, and the `IonToast` visibility and message. The home page triggers the initial `GET` request inside a `useEffect` hook with an empty dependency array, and the form handler sends the `POST` request and appends the returned task to local state so the list updates immediately without refetching. Navigation relies on `@ionic/react-router`, which defines the `/home` and `/detail/:id` routes inside an `IonRouterOutlet`, so tapping a list item pushes the detail page and `IonBackButton` with `defaultHref="/home"` provides native back navigation. The detail page reads the `id` with `useParams<{ id: string }>()` and refetches the corresponding task whenever that parameter changes. Every `fetch` call is wrapped in `try/catch/finally`, checks `if (!response.ok)` to convert HTTP errors into exceptions carrying the API's `error` message, and treats the `TypeError` thrown by `fetch` on network failures as a friendly "server unreachable" message displayed in an `IonToast`, while `IonSpinner` communicates pending requests.
