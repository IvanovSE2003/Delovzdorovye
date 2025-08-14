import { Link } from 'react-router-dom';
import logo from '../../../../public/logo.svg'
import { RouteNames } from '../../../routes';
import './HeaderProfile.scss'

const HeaderProfile = () => {
    return (
        <header className='header-profile'>
            <Link to={RouteNames.MAIN}>
                <img src={logo} alt="logo" />
            </Link>
            <div></div>
        </header>
    )
}

export default HeaderProfile;