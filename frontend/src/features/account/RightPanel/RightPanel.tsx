import { Link } from 'react-router-dom';
import { RouteNames } from '../../../routes';

import account from '../../../assets/images/account_border.png';
import conversation from '../../../assets/images/conversation.png';
import notifications from '../../../assets/images/notifications.png'
import './RightPanel.scss'

const RightPanel = () => {
    return (
        <aside className='rightPanel'>
            <Link to={RouteNames.PERSONAL}>
                <img src={account} alt="account-icon" />
            </Link>
            <img src={notifications} alt="" />
            <img src={conversation} alt="" />
        </aside>
    )
}

export default RightPanel;