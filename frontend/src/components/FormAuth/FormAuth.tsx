import { useState } from 'react';
import Register from './Register';
import Login from './Login';
import "../FormAuth/FormAuth.scss"

export type AuthState= "login" | "register";

const FormAuth = () => {
    const [state, setState] = useState<AuthState>("register");
    const [error, setError] = useState<string>("");

    return (
        <div>
            <h3>
                {state === "login" && "Вход в систему"}
                {state === "register" && "Регистрация"}
            </h3>

            {error && <p className="auth__error">{error}</p>}

            {state === "login" && (
                <Login setError={setError} setState={setState}/>
            )}

            {state === "register" && (
                <Register setError={setError} setState={setState}/>
            )}
        </div>
    )
}

export default FormAuth;