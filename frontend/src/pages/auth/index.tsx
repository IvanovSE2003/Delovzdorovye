import { Link } from 'react-router';
import logo from "@/assets/images/logo.svg";
import FormAuth from "./FormAuth/FormAuth";
import { RouteNames } from '../../routes';

const LoginPage:React.FC = () => {
    return (
        <div className='auth__window'>
            <div className='auth__left'>
                <div className="auth__logo">
                    <Link to={RouteNames.HOME}>
                        <div className="header__logo">
                            <img src={logo} alt="logo_medice" />
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
    )
}

export default LoginPage;