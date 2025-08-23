export interface ISlots {
    id: number;
    time: string;
    is_available: boolean;
}

export interface ISchedules {
    id: number;
    date: string;
    time_start: string;
    time_end: string;
    timeSlot: ISlots[];
}