import { useContext } from "react";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import ScheduleGrid from "../../../../components/UI/Schedule/Schedule";
import "react-datepicker/dist/react-datepicker.css";
import "./TimeSheet.scss";
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
                <ScheduleGrid
                    onChange={handleScheduleChange}
                    userId={store.user.id}
                />
            </div>
        </AccountLayout >
    );
};

export default observer(TimeSheet);
