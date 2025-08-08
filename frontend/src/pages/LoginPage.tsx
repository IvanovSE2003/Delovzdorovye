import FormAuth from "../components/FormAuth/FormAuth";
import { Link } from 'react-router';
import logo from '../assets/images/logo.png';
import '../assets/styles/LoginPage.scss'

const RegisterPage = () => {
    return (
        <>
            <div className='auth__window'>
                <div className='auth__left'>
                    <div className="auth__logo">
                        <Link to="/">
                            <img src={logo} alt="logo_medonline" />
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