import { menuItemsDoctor } from "../../../routes";
import AccountLayout from "../AccountLayout";

const Consultations = () => {
    return (
        <AccountLayout menuItems={menuItemsDoctor}>
            <div>
                Consultations
            </div>
        </AccountLayout>
    )
}

export default Consultations;