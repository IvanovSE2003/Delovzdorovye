import { useContext } from "react";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import "react-datepicker/dist/react-datepicker.css";
import "./TimeSheet.scss";
import Schedule from "../../../../components/UI/Schedule/Schedule";
export type SlotStatus = "closed" | "open" | "booked";

const TimeSheet: React.FC = () => {
    const { store } = useContext(Context);

    // Обработка изменения расписания
    const handleScheduleChange = (slots: Record<string, SlotStatus>) => {
        console.log("Текущее расписание:", slots);
    };

    return (
        <AccountLayout>
            <div className="page-container timesheet">
                <Schedule userId={store.user.id} />
            </div>
        </AccountLayout >
    );
};

export default observer(TimeSheet);
