import { useState, Suspense } from "react";
import Loader from "../../../components/UI/Loader/Loader";
import { AnimatePresence } from "framer-motion";
import "./FormAuth.scss";
import Login from "../Login/Login";
import Register from "../Register/Register";
import ShowError from "../../../components/UI/ShowError/ShowError";

export type AuthState = "login" | "register" | "recover";


const FormAuth: React.FC = () => {
    const [state, setState] = useState<AuthState>("login");
    const [error, setError] = useState<{ id: number; message: string }>({ id: 0, message: "" });
    const [message, setMessage] = useState<{ id: number; message: string }>({ id: 0, message: "" });

    return (
        <>
            <h3 className="auth__title">
                {state === "login" && "Вход в систему"}
                {state === "register" && "Регистрация"}
            </h3>

            <ShowError msg={error} />
            <ShowError msg={message} mode="MESSAGE"/>

            <Suspense fallback={<Loader />}>
                <AnimatePresence mode="wait">
                    {state === "login" && (
                        <Login setState={setState} setError={setError} setMessage={setMessage} />
                    )}
                    {state === "register" && (
                        <Register setState={setState} setError={setError} />
                    )}
                </AnimatePresence>
            </Suspense>
        </>
    );
};

export default FormAuth;
