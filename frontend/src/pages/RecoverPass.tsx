import { useParams } from 'react-router';
import React, { useContext, useEffect } from 'react';
import MyInput from '../components/UI/MyInput/MyInput';
import { useState } from 'react';
import { Context } from '../main';

const RecoverPass: React.FC = () => {
    let { token } = useParams();

    if(!token) {
        token = "";
    }

    const [password, setPassword] = useState<string>("");
    const [replyPassword, setReplyPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const { store } = useContext(Context);

    // useEffect(() => {
    //     console.log(token);
    // }, [])

    const RecoverPass = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== replyPassword) {
            setError('Пароли не совпадают');
            return;
        }
        
        const data = await store.resetPassword(token, password);
        console.log(token)
        console.log(data);
    }

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <div className='auth__box'>
                <h3>Восстановление пароля</h3>
                <form onSubmit={RecoverPass} className='auth__form'>
                    <MyInput
                        type="password"
                        id="password"
                        label="Пароль"
                        value={password}
                        onChange={(value) => setPassword(value)}
                        required
                    />

                    <MyInput
                        type="password"
                        id="repeat-password"
                        label="Повторите пароль"
                        value={replyPassword}
                        onChange={(value) => setReplyPassword(value)}
                        required
                    />

                    <button type='submit' className='auth__button'>Изменить пароль</button>

                    {error && <p className="auth__error">{error}</p>}
                </form>
            </div>
        </div>
    )
}

export default RecoverPass;