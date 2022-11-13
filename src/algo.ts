import { EventWrapper } from "./eventWrapper";
import { Interval } from "../@types/interval";

export function getClassSchedule(intervals: Interval[]): Interval[] {
    if (intervals.length === 0) {
        throw new Error('Cannot get schedule for empty array of classes');
    }
    const intervalsClone = intervals.slice();
    intervalsClone.sort((ew1, ew2) => ew1.start.getTime() - ew2.start.getTime());
    return getClassScheduleRec(intervalsClone);
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
function getClassScheduleRec(intervals: Interval[]): Interval[] {
    let end: Date = intervals[0].end; // assumes list is non-empty
    let start: Date = intervals[0].start;

    while (intervals.length > 0) {
        const curEvent = intervals.shift();
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
            intervals.unshift(curEvent);
            break;
        }
        
    }

    let returnedIntervals: Interval[] = [{ start, end }];

    if (intervals.length != 0) {
        returnedIntervals = returnedIntervals.concat(getClassScheduleRec(intervals));
    }

    return returnedIntervals;
}
