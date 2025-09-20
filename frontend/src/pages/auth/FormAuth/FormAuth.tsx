import { useState, Suspense, lazy } from "react";
import "./FormAuth.scss";
import { observer } from "mobx-react-lite";
import Loader from "../../../components/UI/Loader/Loader";
import { AnimatePresence } from "framer-motion";

export type AuthState = "login" | "register" | "recover";

const Login = lazy(() => import("../Login/Login"));
const Register = lazy(() => import("../Register/Register"));

const FormAuth: React.FC = () => {
    const [state, setState] = useState<AuthState>("login");
    const [error, setError] = useState<string>("");

    return (
        <>
            <h3 className="auth__title">
                {state === "login" && "Вход в систему"}
                {state === "register" && "Регистрация"}
            </h3>

            {error && <p className="auth__error">{error}</p>}

            <Suspense fallback={<Loader />}>
                <AnimatePresence mode="wait">
                    {state === "login" && (
                        <Login setState={setState} setError={setError} />
                    )}
                    {state === "register" && (
                        <Register setState={setState} setError={setError} />
                    )}
                </AnimatePresence>
            </Suspense>
        </>
    );
};

export default observer(FormAuth);
