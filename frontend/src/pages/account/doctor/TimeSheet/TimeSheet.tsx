import { useContext } from "react";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import "./TimeSheet.scss";
import ScheduleGrid, { type SlotStatus } from "../../../../components/UI/Schedule/Schedule";

export interface IScheduleCreate {
    date: string;
    time_start: string;
    time_end: string;
    userId: number;
}

export interface ISlotCreate {
    time: string;
    scheduleId: number | undefined;
}

const TimeSheet = () => {
    const { store } = useContext(Context);

    const handleScheduleChange = (slots: Record<string, SlotStatus>) => {
        console.log("Текущее расписание:", slots);
    };

    return (
        <AccountLayout>
            <div className="page-container timesheet">
                <h2 className="page-container__title">Ваше расписание</h2>
                <p className="timesheet__description">Настраивайте расписание как вам удобно</p>

                <ScheduleGrid
                    onChange={handleScheduleChange}
                    userId={store.user.id}
                />
            </div>
        </AccountLayout>
    );
};

export default observer(TimeSheet);