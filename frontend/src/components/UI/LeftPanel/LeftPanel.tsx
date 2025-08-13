import account from '../../../assets/images/account_border.png';
import conversation from '../../../assets/images/conversation.png';
import './LeftPanel.scss';

const LeftPanel = () => {
    return (
        <div className="left-panel">
            <img src={account} alt="account-image" />
            <img src={conversation} alt="convarsation-image" />
        </div>
    )
}

export default LeftPanel;