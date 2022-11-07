import { calendar_v3 } from "@googleapis/calendar";
import Event = calendar_v3.Schema$Event;

export class EventWrapper {
    start: Date;
    end: Date;
    classes: String[];

    constructor(start: Date, end: Date, classes: String[]);

    constructor(event: Event);

    constructor(startOrEvent?: Date | Event, end?: Date, classes?: String[]) {
        if (startOrEvent instanceof Date && end && classes) {
            this.start = startOrEvent;
            this.end = end;
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
        this.start = new Date(startDateTime);
        this.end = new Date(endDateTime);

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
        const startWeekDay: number = this.start.getDay();
        const endWeekDay: number = this.end.getDay();
        if (startWeekDay !== endWeekDay) {
            throw new Error("Event takes place over more than one day.");
        }
        return startWeekDay;
    }
}
