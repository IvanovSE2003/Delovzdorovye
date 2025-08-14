import logo from '../../../../public/logo.svg'
import './HeaderProfile.scss'

const HeaderProfile = () => {
    return (
        <header className='header-profile'>
            <img src={logo} alt="logo" />
        </header>
    )
}

export default HeaderProfile;