export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface ToastState {
  isOpen: boolean;
  message: string;
  color: 'success' | 'danger';
}
