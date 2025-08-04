import { useState } from 'react';
import Register from './Register';
import Login from './Login';
import "../FormAuth/FormAuth.scss"

export type AuthState= "login" | "register";

const FormAuth = () => {
    const [state, setState] = useState<AuthState>("login");

    return (
        <>
            <h3 className="auth__title">
                {state === "login" && "Вход в систему"}
                {state === "register" && "Регистрация"}
            </h3>

            {state === "login" && (
                <Login setState={setState}/>
            )}

            {state === "register" && (
                <Register setState={setState}/>
            )}
        </>
    )
}

export default FormAuth;