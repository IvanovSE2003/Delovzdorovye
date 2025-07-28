import FormAuth from "../components/FormAuth/FormAuth";
import { Link } from 'react-router';
import logo from '../assets/images/logo.png';

const Register = () => {
    return (
        <div>
            <div className='auth__window'>
                <div className='auth__left'>
                    <Link to="/">
                        <img src={logo} alt="logo_medonline" />
                    </Link>
                </div>
                <div className='auth__right'>
                    <div className='auth__box'>
                         <FormAuth/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register;