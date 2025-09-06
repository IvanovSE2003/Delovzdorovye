import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccountLayout from "../../AccountLayout";
import { Context } from "../../../../main";
import { observer } from "mobx-react-lite";
import type { ISchedules, ISlots } from "../../../../models/Schedules";
import ScheduleService from "../../../../services/ScheduleService";

import Loader from "../../../../components/UI/Loader/Loader";
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
    const [schedule, setSchedule] = useState<Record<string, SlotStatus>>({});

    const handleScheduleChange = (slots: Record<string, SlotStatus>) => {
        console.log("Текущее расписание:", slots);
        setSchedule(slots);
    };

    return (
        <AccountLayout>
            <div className="timesheet">
                <h2 className="timesheet__title">Расписание</h2>

                <ScheduleGrid
                    onChange={handleScheduleChange}
                    userId={store.user.id}
                />
            </div>
        </AccountLayout>
    );
};

export default observer(TimeSheet);