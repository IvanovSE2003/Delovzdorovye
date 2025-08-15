import { menuItemsPatient } from "../../../routes";
import AccountLayout from "../AccountLayout";

const UsefulInfo = () => {
    return (
        <AccountLayout menuItems={menuItemsPatient}>
            <div>
                UsefulInfo
            </div>
        </AccountLayout>
    )
}

export default UsefulInfo;