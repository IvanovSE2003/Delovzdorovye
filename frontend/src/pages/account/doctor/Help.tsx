import { menuItemsDoctor } from "../../../routes";
import AccountLayout from "../AccountLayout";

const Help = () => {
    return (
        <AccountLayout menuItems={menuItemsDoctor}>
            <div>
                Help
            </div>
        </AccountLayout>
    )
}

export default Help;