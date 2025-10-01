import React from "react";
import "./DoctorSchedule.scss";

const DoctorSchedule: React.FC = () => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 - 23:00
    const days = [
        { date: "28", label: "пн", month: "Июль" },
        { date: "29", label: "вт", month: "Июль" },
        { date: "30", label: "ср", month: "Июль" },
        { date: "31", label: "чт", month: "Июль" },
        { date: "1", label: "пт", month: "Август" },
        { date: "2", label: "сб", month: "Август" },
        { date: "3", label: "вс", month: "Август" },
    ];

    const bookedSlots: Record<string, { start: number; end: number }[]> = {
        "29": [
            { start: 14, end: 15 },
            { start: 15, end: 16 },
            { start: 16, end: 17 },
        ],
        "31": [
            { start: 15, end: 16 },
            { start: 16, end: 17 },
        ],
        "1": [{ start: 11, end: 12 }],
        "2": [
            { start: 13, end: 14 },
            { start: 15, end: 16 },
        ],
    };

    const formatHour = (h: number) => `${h}:00`;

    return (
        <div className="schedule">
            <div className="schedule__header">
                <h2 className="schedule__title">Расписание</h2>

                <div className="schedule__nav">
                    <button className="schedule__nav-btn">{"<"}</button>
                    <span className="schedule__nav-range">28 июля - 3 августа</span>
                    <button className="schedule__nav-btn">{">"}</button>
                </div>
            </div>

            <div className="schedule__table">
                {/* Шапка */}
                <div className="schedule__time-header"></div>
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`schedule__day-header ${i === 3 ? "schedule__day-header--current" : ""
                            }`}
                    >
                        <div className="schedule__day-month">{d.month}</div>
                        <div className="schedule__day-date">
                            {d.date}, {d.label}
                        </div>
                    </div>
                ))}

                {/* Время + ячейки */}
                {hours.map((h) => (
                    <React.Fragment key={h}>
                        <div className="schedule__time">{formatHour(h)}</div>
                        {days.map((d, i) => {
                            const slot =
                                bookedSlots[d.date]?.find((s) => s.start === h) || null;
                            return (
                                <div
                                    key={i}
                                    className={`schedule__cell ${i === 6 ? "schedule__cell--weekend" : "schedule__cell--workday"
                                        }`}
                                >
                                    {slot && (
                                        <div className="schedule__slot--booked">
                                            {`${slot.start}:00 - ${slot.end}:00`}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default DoctorSchedule;
