import { Link } from 'react-router-dom';
import account from '../../../assets/images/account_border.png';
import conversation from '../../../assets/images/conversation.png';
import { RouteNames } from '../../../routes';

import './RightPanel.scss'

const RightPanel = () => {
    return (
        <aside className='rightPanel'>
            <Link to={RouteNames.PERSONAL}>
                <img src={account} alt="account-icon" />
            </Link>
            <img src={conversation} alt="" />
        </aside>
    )
}

export default RightPanel;