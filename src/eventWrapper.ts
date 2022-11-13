import { calendar_v3 } from "@googleapis/calendar";
import Event = calendar_v3.Schema$Event;
import { Interval } from "../@types/interval";


// TODO: make interval a class (with get week day getter) and have event wrapper inheret from it?
export class EventWrapper {
    interval: Interval;
    classes: String[];

    constructor(start: Date, end: Date, classes: String[]);

    constructor(event: Event);

    constructor(startOrEvent?: Date | Event, end?: Date, classes?: String[]) {
        if (startOrEvent instanceof Date && end && classes) {
            this.interval = {
                start: startOrEvent,
                end: end,
            };
            this.classes = classes;
            return;
        }

        if (!startOrEvent) {
            throw new Error("Event not passed in.");
        }
        const event: Event = startOrEvent as Event;

        const startDateTime = event.start?.dateTime;
        const endDateTime = event.end?.dateTime;

        if (!(startDateTime && endDateTime)) {
            throw new Error("Event has no start or end date/time.");
        }
        this.interval = {
            start: new Date(startDateTime),
            end: new Date(endDateTime),
        };

        const description = event.description;
        if (!description) {
            throw new Error("Event has no description.");
        }
        // parse description
        this.classes = description.split("-")[2].split(",");
        this.classes = this.classes
            .map((c) => c.trim())
            .filter((c) => c !== "");
    }

    get weekDay() {
        const startWeekDay: number = this.interval.start.getDay();
        const endWeekDay: number = this.interval.end.getDay();
        if (startWeekDay !== endWeekDay) {
            throw new Error("Event takes place over more than one day.");
        }
        return startWeekDay;
    }
}
