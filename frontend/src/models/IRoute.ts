export type AppRoute = {
  path: string;
  element: React.ComponentType;
  roles?: string[];  // если не указаны — значит доступно всем
  isPrivate?: boolean; // true = требует авторизации
};
