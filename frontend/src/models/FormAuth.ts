import type { Dispatch, SetStateAction } from "react";
import type { AuthState } from "../components/FormAuth/FormAuth";

export type FormAuthProps = {
  setState: Dispatch<SetStateAction<AuthState>>;
  setError: Dispatch<SetStateAction<string>>;
};