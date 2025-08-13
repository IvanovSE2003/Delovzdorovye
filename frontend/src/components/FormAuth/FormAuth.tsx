import { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Recover from './Recover';
import "./FormAuth.scss"
import { observer } from 'mobx-react-lite';

export type AuthState= "login" | "register"| "recover";

const FormAuth: React.FC = () => {
    const [state, setState] = useState<AuthState>("login");
    const [error, setError] = useState<string>("");

    return (
        <>
            <h3 className="auth__title">
                {state === "login" && "Вход в систему"}
                {state === "register" && "Регистрация"}
                {state == "recover" && "Восстановление пин-кода"}
            </h3>

            {error && <p className="auth__error">{error}</p>}

            {state === "login" && (
                <Login setState={setState} setError={setError}/>
            )}

            {state === "register" && (
                <Register setState={setState} setError={setError}/>
            )}

            {state === "recover" && (
                <Recover setState={setState} setError={setError}/>
            )}
        </>
    )
}

export default observer(FormAuth);