import { Link } from 'react-router';
import logo from '../../../public/logo.svg';
import FormAuth from "./FormAuth/FormAuth";

const RegisterPage = () => {
    return (
        <>
            <div className='auth__window'>
                <div className='auth__left'>
                    <div className="auth__logo">
                        <Link to="/">
                        <div className="header__logo">
                             <img src={logo} alt="logo_medonline" />
                        </div>
                        </Link>
                    </div>
                </div>
                <div className='auth__right'>
                    <div className='auth__box'>
                        <FormAuth />
                    </div>
                </div>
            </div>
        </>
    )
}

export default RegisterPage;