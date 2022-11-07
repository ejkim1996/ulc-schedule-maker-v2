import { EventWrapper } from "./eventWrapper";

export function getClassSchedule(events: EventWrapper[]): EventWrapper[] {
    if (events.length === 0) {
        throw new Error('Cannot get schedule for empty array of classes');
    }
    const eventsClone = events.slice();
    eventsClone.sort((ew1, ew2) => ew1.start.getTime() - ew2.start.getTime());
    return getClassScheduleRec(eventsClone);
}

/*
/   Constructs a list of the longest interval(s) for which a class is tutored for.
/   Recurses on the remaining elements of the list after one contiguous interval
/   is constructed to append remaining interval(s). Base case is reached when no 
/   elements are left. 
/   
/   @param A list of EventWrapper objects corresponding to a class on a specific day
/   sorted by start time in ascending order. Must be nonempty
/   
/   @return A list of EventWrapper objects that contain start and end times (Date objects)
/   of the schedule interval(s) pertaining to a specific class. Note that the objects have
/   an empty classes field; only intended for containing the interval start and finish times.
*/
function getClassScheduleRec(events: EventWrapper[]): EventWrapper[] {
    let end: Date = events[0].end; // assumes list is non-empty
    let start: Date = events[0].start;

    while (events.length > 0) {
        const curEvent = events.shift();
        const curStart = curEvent?.start;
        const curEnd = curEvent?.end;

        if (!(curStart && curEnd)) {
            throw new Error('Event missing start or end');
        }

        if (start.getTime() === curStart?.getTime() && end < curEnd) {
            end = curEnd;
        } else if (curStart <= end && end < curEnd) {
            end = curEnd;
        } else if (curStart > end) {
            events.unshift(curEvent);
            break;
        }
        
    }

    let interval: EventWrapper = new EventWrapper(start, end, []);
    let intervals: EventWrapper[] = [interval];

    if (events.length != 0) {
        intervals = intervals.concat(getClassScheduleRec(events));
    }

    return intervals;
}
