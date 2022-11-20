# Type proposals for ULC Schedule Maker

This is in absolutely no way an assertion that this is what we are doing. I just had a bunch of time this morning, so I started theorycrafting about how to solve the `any` problem we're having. Take a look and tear it to shreds. Also, this started out as some pseudocode that I was typing in Sublime. I ended up getting lost in the sauce, and now it's this, so literally none of this is tested.

## Types

### Utility Types

#### `CalendarInfo`

Reduction of Google API's `CalendarList` object that only contains the name of the calendar and its ID.

**TODO:**

-   Should we make class that constructs from Google API call response?

```typescript
interface CalendarInfo {
    id: string; // gcal id used in api call
    name: string; // aka summary
}
```

#### `CourseInfo`

Container for all the information of a course, including it's actual name, its course code, its ULC-preferred abbreviation, and its department, all of which are provided by the ULC spreadsheet. It also has a method, `matchScore`, that gives a score to how well a given string matches the course. That is, the more likely a string is an actual string representation of this course, the higher the score will be.

**NOTES:**

-   This proposal moves the language away from 'class' and toward 'course' in order to avoid any conflicts with the class Javascript keyword.

**TODO:**

-   The ULC spreadsheet refers to the 'code' as the course number. Is this something we want to keep consistent?
-   Right now, the department information doesn't do much. It's included here because it's on the current ULC spreadsheet for classes, and we could _potentially_ use it for some sort of sorting or binning. I'm not sure if it's entirely necessary at the moment though.
-   Right now, we're not using anything but the ULC abbreviation. In the future, we might want to include more information, like the name, code, and department (which are currently optional).
-   We could build a constructor or overload a constructor to construct the object through a CSV line or database query, for future extensibility with the source of truth.
-   Right now, the given implementation of `matchScore` reflects what we have in our current code base. We can swap this out in the future for something more error resistant, say fuzzy searching.

```typescript
interface CourseInfoInterface {
    name?: string; // the official albert name
    code?: string; // eg CSCI-UA 101
    abbreviation: string; // the abbreviation used for the ulc calendar
    department?: string;

    // the likelihood that a given course (ie the course a student types into their event description)
    // actually is this course
    // returns a number between 0 and 1
    matchScore(courseGiven: string): number;
}

class CourseInfo implements CourseInfoInterface {
    constructor(abbreviation) {
        this.abbreviation = abbreviation;
    }

    // this is our current implementation
    matchScore(courseGiven: string): number {
        return courseGiven === this.abbreviation ? 1 : 0;
    }
}
```

#### `CourseCatalogue`

A collection of courses that can represent all of our courses from a source of truth.

```typescript
type CourseCatalog = CourseInfo[];
```

#### `Interval`

An object representing a range of time _on one specific day_. The day of the week that the interval falls on is automatically set from the start and end. If the interval of time stretches across multiple days of the week, the class will throw an error.

**TODO:**

-   Could it be the case that the time is on the same day in the New York time zone but on different days in UTC? If so, `get weekDay` would error out.
-   If for whatever case the start and the end day fall on the same day of the week but on different weeks, this would still work when in reality it should error.

```typescript
interface IntervalInterface {
    start: Date;
    end: Date;
    readonly weekDay: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

class Interval implements IntervalInterface {
    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
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
```

#### `EventWrapper`

Wrapper for google event type that contains information about the start and the end of the event by extending `Interval`. Also contains the list of courses given in the description of the event. These courses given may or may not be correctly formatted as the valid course abbreviation (found in `CourseInfo`).

**NOTES:**

-   We only need a single contructor now because `EventWrapper` is no longer an alias for a classless interval.

**TODO:**

-   To be honest, I'm not really sure if `coursesGiven` is a great name for the property. Is there something better?
-   Right now, the implementation for `parseCourses` is what we currently have implemented. In the future, we can do some input validation here.
    -   For example, if we have the case where the description says "Calc I, II, III", we can split this up into "Calc I", "Calc II", and "Calc III" here.

```typescript
class EventWrapper extends Interval {
    // the names of the courses the tutor is available to tutor
    // given in the ulc abbreviation and may contain input errors
    coursesGiven: string[];

    constructor(event: Event) {
        const startDateTime = event.start?.dateTime;
        const endDateTime = event.end?.dateTime;

        if (!(startDateTime && endDateTime)) {
            throw new Error("Event has no start or end date/time.");
        }

        super(startDateTime, endDateTime);
        parseCourses(event);
    }

    private parseCourses(event: Event) {
        // sets this.coursesGiven to be the list of names we were given
        const description = event.description;
        if (!description) {
            throw new Error("Event has no description.");
        }
        this.coursesGiven = description
            .split("-")[2]
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== "");
    }
}
```

### Schedule Types

**TODO:**

-   I'm not sure if this the right way to do this.
    -   Pros: consistent across front and backend, extensible by implementing interfaces and extending
    -   Cons: deeply nested (see implementation below)

#### `DailySchedule`

Describes the schedule (of a specific course at a location) over the course of a day of the week

```typescript
interface DailySchedule {
    weekDay: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    intervals: Intervals[];
}
```

#### `LocationSchedule`

Describes the schedule of one specific course for a given location over every day of the week.

**TODO:**

-   Is 'location' or 'label' a better name for the property?

```typescript
interface LocationSchedule {
    location: string;
    dailySchedules: DailySchedule[];
}
```

#### `CourseSchedule`

Describes the schedule for a given course across multiple locations and all days of the week.

```typescript
interface CourseSchedule {
    courseInfo: CourseInfo;
    locationSchedules: LocationSchedule[];
}
```

#### `Schedule`

An alias for an array of `CourseSchedule`s. The response from `POST /api/schedule` will be of this type.

```typescript
type Schedule = CourseSchedule[];
```

### API Types

**TODO:**

-   Admittedly, these api response types may not be totally necessary.
    -   Pros: consistency in between frontend and backend
    -   Cons: type bloat

#### `ApiResponseInterface`

An interface for all API responses to implement. The schema is borrowed from [JSend](https://github.com/omniti-labs/jsend), and the rules of the schema are: If status is success or fail, data must exist. If status is error, message must exist and data is optional.

```typescript
interface ApiResponseInterface {
    status: "success" | "fail" | "error";
    data?: any;
    message?: string;
}
```

#### `ApiSuccessResponse`

Represents a successful response from the API to send to the front-end.

```typescript
class ApiSuccessResponse implements ApiResponseInterface {
    constructor(data: any) {
        this.status = "success";
        this.data = data;
    }
}
```

#### `ApiFailResponse`

Represents a failure response from the API to send to the front-end. This implies that there was ['a problem with the data submitted, or some pre-condition of the API call wasn't satisfied'](https://github.com/omniti-labs/jsend#so-how-does-it-work).

```typescript
class ApiFailResponse implements ApiResponseInterface {
    constructor(data: any) {
        this.status = "fail";
        this.data = data;
    }
}
```

#### `ApiErrorResponse`

Represents an error response from the API to send to the front-end. This implies that there was a server problem on the server processing the request.

```typescript
class ApiErrorResponse implements ApiResponseInterface {
    constructor(error: string | Error, data: any) {
        this.status = "error";
        if (error instanceof Error) {
            this.message = error.message;
        } else {
            this.message = error;
        }
        if (data) {
            this.data = data;
        }
    }
}
```

#### `ApiScheduleRequest`

The type of the body sent to the `POST /api/schedule` endpoint.

```typescript
interface ApiScheduleRequest {
    calendars: CalendarInfo[];
    stagingWeek: Date; // date of the staging week's Sunday
}
```

## Implementations

Proposed function signatures of current functions using new types and ways to use the new types.

### Scheduling Algorithm -----------------

Mostly the same as before because the interval type is effectively the same.

**TODO:**

-   Change the algorithm so that calling `getClassSchedule` on an empty array returns the empty array. This just means that there happen to be no tutors tutoring this class on this day at this location. As such, there's no availability of tutors, and so there are no intervals in which there is a tutor to tutor.

```typescript
function getClassSchedule(intervals: Interval[]): Interval[];

function getClassScheduleRec(intervals: Interval[]): Interval[];
```

### Binning and Solving

#### `bin`

Creates a `Schedule` where the bottom level `Interval[]`s are the collection of intervals from `EventWrapper`s whose `coursesGiven` property includes a given course, say `courseGiven`, such that the top level `CourseSchedule`, say `courseSchedule`, has that: `courseSchedule.courseInfo.matchScore(courseGiven) > threshold`.

```typescript
function bin(
    courses: CourseCatalog,
    locations: string[],
    events: EventWrapper[]
): Schedule;
```

#### `getSchedule`

Generates the `Schedule` to be returned from the API given the entire catalogue of available courses, list of locations, and events from the calendar.

**TODO:**

-   This is completely untested. 100% rawdogged in Sublime.
-   What if `courseSchedule`, `locationSchedule`, or `dailySchedule` are `undefined`?

```typescript
function getSchedule(
    courses: CourseCatalog,
    locations: string[],
    events: Shift[]
): Schedule {
    const binnedClasses: Schedule = bin(courses, locations, events);
    for (const courseInfo of courses) {
        for (const location of locations) {
            for (let weekDay = 0; weekDay < 7; i++) {
                // modify the interval found who is associated
                // with courseInfo, location, and weekDay

                const courseSchedule: CourseSchedule = binnedClasses.find(
                    (courseSchedule) => {
                        return (
                            courseSchedule.courseInfo.abbreviation ===
                            courseInfo.abbreviation
                        );
                    }
                );
                const locationSchedule: LocationSchedule = courseSchedule.find(
                    (locationSchedule) => {
                        return locationSchedule.location === location;
                    }
                );
                const dailySchedule: DailySchedule = locationSchedule.find(
                    (dailySchedule) => {
                        return dailySchedule.weekDay === weekDay;
                    }
                );

                dailySchedule.intervals = getClassSchedule(
                    dailySchedule.intervals
                );
            }
        }
    }
    return binnedClasses;
}
```

## API Schema

Lists the types and representations of various requests and responses to our API endpoints.

### `GET /api/calendars`

Request Body

```typescript
never;
```

Success Response

```typescript
new ApiSuccessResponse(calendarInfo: CalendarInfo[]);
```

Credential Failure

```typescript
new ApiFailResponse({
    message:
        "Invalid Credentials. Navigate to /login and login through Google again.",
});
```

Google API Server Error

```typescript
new ApiErrorResponse(
    "Google backend error. Please try again in a few minutes."
);
```

### `POST /api/schedule`

Request Body

```typescript
ApiScheduleRequest;
```

Success Response

```typescript
new ApiSuccessResponse(schedule: Schedule);
```

Credential Failure

```typescript
new ApiFailResponse({
    message:
        "Invalid Credentials. Navigate to /login and login through Google again.",
});
```

Invalid Calendar ID

```typescript
new ApiFailResponse({
    message:
        "<Label> calendars not found. Double check that your calendars are not deleted.",
});
```

Google API Server Error

```typescript
new ApiErrorResponse(
    "Google backend error. Please try again in a few minutes."
);
```
