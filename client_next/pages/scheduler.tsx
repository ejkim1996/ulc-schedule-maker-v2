import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Disclosure } from "@headlessui/react";

interface CalendarRep {
    id: string;
    name: string;
}

interface ScheduleRep {
    className: string;
    uHallString: string;
    arcString: String;
}

const Scheduler: NextPage = () => {
    const [calendars, setCalendars] = useState<CalendarRep[]>(
        [] as CalendarRep[]
    );
    const [selectedArc, setSelectedArc] = useState<CalendarRep>();
    const [selectedUHall, setSelectedUHall] = useState<CalendarRep>();
    const [stagingDate, setStagingDate] = useState(new Date());

    const [schedules, setSchedules] = useState<ScheduleRep[]>([]);

    useEffect(() => {
        fetchCalendars();
    }, []);

    async function fetchCalendars() {
        const res = await fetch("/api/calendars", {
            method: "GET",
        });
        const data = await res.json();
        setCalendars(data);
    }

    const handleArc = (cal: CalendarRep) => {
        setSelectedArc(cal);
    };

    const handleUHall = (cal: CalendarRep) => {
        setSelectedUHall(cal);
    };

    const handleGo = async () => {
        const reqBody: any = {
            calIdList: [
                {
                    label: "ARC",
                    id: selectedArc?.id,
                },
                {
                    label: "UHall",
                    id: selectedUHall?.id,
                },
            ],
            stagingWeek: stagingDate,
        };

        console.log(JSON.stringify(reqBody));

        const res = await fetch("/api/schedule", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
        });

        const output = await res.json();

        const schedules = makeText(output);

        setSchedules(schedules);
    };

    const makeText = (res: any) => {
        const schedules: ScheduleRep[] = [];

        for (const className in res) {
            const days = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];

            const arc: any = res[className][0];
            const uhall: any = res[className][1];

            let arcString = "";
            for (const [i, day] of arc.entries()) {
                const dayName = days[i];
                let out = `${dayName} `;
                for (const interval of day[i]) {
                    out += `${new Date(
                        interval.start
                    ).toLocaleTimeString()} - ${new Date(
                        interval.end
                    ).toLocaleTimeString()}; `;
                }
                arcString += out + "\n";
            }

            let uHallString = "";
            for (const [i, day] of uhall.entries()) {
                const dayName = days[i];
                let out = `${dayName} `;
                for (const interval of day[i]) {
                    out += `${new Date(
                        interval.start
                    ).toLocaleTimeString()} - ${new Date(
                        interval.end
                    ).toLocaleTimeString()}; `;
                }
                uHallString += out + "\n";
            }

            const schedule: ScheduleRep = {
                className: className,
                uHallString: uHallString,
                arcString: arcString,
            };

            schedules.push(schedule);
        }

        console.log(schedules);
        return schedules;
    };

    const calendarList = calendars.map((cal: any) => {
        return (
            <li key={cal.id}>
                <button
                    className="text-left"
                    onClick={() => {
                        handleArc(cal);
                    }}
                >
                    {cal.name}
                </button>
            </li>
        );
    });

    const calendarListUHall = calendars.map((cal: any) => {
        return (
            <li key={cal.id}>
                <button
                    className="text-left"
                    onClick={() => {
                        handleUHall(cal);
                    }}
                >
                    {cal.name}
                </button>
            </li>
        );
    });

    const schedulesJs = schedules.map((s) => {
        return (
            <Disclosure key={s.className}>
                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                    {s.className}
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                    <h3 className="font-bold">ARC</h3>
                    {s.arcString}
                    <h3 className="font-bold">UHall</h3>
                    {s.uHallString}
                </Disclosure.Panel>
            </Disclosure>
        );
    });

    const form = (
        <>
            <div className="grid place-items-center h-full">
                <div className="grid gap-y-2">
                    <h1 className="text-4xl text-left pb-4">
                        ULC Schedule Maker
                    </h1>
                    <div className="flex flex-row items-center">
                        <div>ARC</div>
                        <div className="grow"></div>
                        <div className="dropdown dropdown-hover">
                            <label tabIndex={0} className="btn">
                                {selectedArc?.name ?? "Choose ARC"}
                                <span className="pl-3">
                                    <FaChevronDown />
                                </span>
                            </label>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52"
                            >
                                {calendarList}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-row items-center">
                        <div>UHall</div>
                        <div className="grow"></div>
                        <div className="dropdown dropdown-hover">
                            <label tabIndex={0} className="btn">
                                {selectedUHall?.name ?? "Choose UHall"}
                                <span className="pl-3">
                                    <FaChevronDown />
                                </span>
                            </label>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52"
                            >
                                {calendarListUHall}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-row items-center">
                        <div>Staging Week</div>
                        <div className="grow"></div>
                        <div>
                            <DatePicker
                                selected={stagingDate}
                                onChange={(date: Date) => setStagingDate(date)}
                            />
                        </div>
                    </div>
                    <button
                        className="btn btn-primary self-center"
                        onClick={() => {
                            handleGo();
                        }}
                    >
                        Go
                    </button>
                </div>
            </div>
        </>
    );

    const details = (
        <div className="grid place-items-center h-full">
            <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-2">
                <div className="flex flex-col space-y-2">{schedulesJs}</div>
            </div>
        </div>
    );

    if (schedules.length === 0) {
        return form;
    } else {
        return details;
    }
};

export default Scheduler;
