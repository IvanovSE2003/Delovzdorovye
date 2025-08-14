import account from '../../../assets/images/account_border.png';
import conversation from '../../../assets/images/conversation.png';

import './RightPanel.scss'

const RightPanel = () => {
    return (
        <aside className='rightPanel'>
            <img src={account} alt="" />
            <img src={conversation} alt="" />
        </aside>
    )
}

export default RightPanel;