import { menuItemsPatient } from "../../../routes";
import AccountLayout from "../AccountLayout";

const Recomendations = () => {
    return (
        <AccountLayout menuItems={menuItemsPatient}>
            <div>
                Recomendations
            </div>
        </AccountLayout>
    )
}

export default Recomendations;