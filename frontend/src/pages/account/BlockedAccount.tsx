import { observer } from 'mobx-react-lite';
import logo from "@/assets/images/logo.svg";
import { useContext } from 'react';
import { Context } from '../../main';

const BlockedAccount = () => {
    const { store } = useContext(Context)

    return (
        <div className="color-block">
            <div className="color-block__form">
                <div className="color-block__logo">
                    <img src={logo} />
                </div>

                <div className="account-blocked">
                    <h1 className="account-blocked__title">Ваш аккаунт заблокирован!</h1>
                    <button
                        className='account-blocked__button'
                        onClick={async () => await store.logout()}
                    >
                        Выйти из аккаунта
                    </button>
                </div>
            </div>
        </div>
    )
}

export default observer(BlockedAccount);