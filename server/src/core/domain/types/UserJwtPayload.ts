export default interface UserJwtPayload {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}