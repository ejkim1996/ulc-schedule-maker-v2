import { EventWrapper } from "./eventWrapper";

/*
/   Constructs a list of the longest interval(s) for which a class is tutored for.
/   Recurses on the remaining elements of the list after one contiguous interval
/   is constructed to append remaining interval(s). Base case is reached when no 
/   elements are left. 
/   
/   @param A list of EventWrapper objects corresponding to a class on a specific day
/   sorted by start time in ascending order.
/   
/   @return A list of EventWrapper objects that contain start and end times (Date objects)
/   of the schedule interval(s) pertaining to a specific class. Note that the objects have
/   an empty classes field; only intended for containing the interval start and finish times.
*/
export function getClassSchedule(events: EventWrapper[]): EventWrapper[] {
    let temp: EventWrapper[] = events.slice();
    let curFinish: Date = temp[temp.length - 1].end;
    let curStart: Date = temp[0].start;

    let i: number = 0;

    while (i < temp.length) {
        if (temp[i].start.getTime() == curStart.getTime()) {
            if (temp[i].end.getTime() > curFinish.getTime())
                curFinish = temp[i].end;
            temp.splice(i, 1);
        } else if (temp[i].start.getTime() <= curFinish.getTime()) {
            curFinish = temp[i].end;
            temp.splice(i, 1);
        } else i++;
    }

    let interval: EventWrapper = new EventWrapper(curStart, curFinish, []);
    let intervals: EventWrapper[] = [interval];

    if (temp.length != 0) intervals.concat(getClassSchedule(temp));

    return intervals;
}
