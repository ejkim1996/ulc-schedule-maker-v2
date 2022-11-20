import express, {
    Express,
    Request,
    Response,
    NextFunction,
    urlencoded,
    response,
} from "express";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import * as dotenv from "dotenv";
import cors from "cors";

import "./auth";
import { calendar_v3 } from "@googleapis/calendar";
import Event = calendar_v3.Schema$Event;
import CalendarList = calendar_v3.Schema$CalendarListEntry;
import { getClassSchedule } from "./algo";
import {
    Interval,
    CalendarInfo,
    Schedule,
    ApiErrorResponse,
    ApiFailResponse,
    CourseCatalog,
    Shift,
    CourseInfo,
    LocationSchedule,
    DailySchedule,
    CourseSchedule,
} from "../@types/scheduler";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3001;

// app.use("/api/events", eventRouter);

function isLoggedIn(req: Request, res: Response, next: NextFunction) {
    req.user ? next() : res.sendStatus(401);
}

app.use(express.static(path.join(__dirname, "client/build")));
app.use(session({ secret: process.env.SESSION_SECRET as string }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cors());

app.get("/", (_, res: Response) => {
    res.send("test");
});

app.get("/api/test", (_, res: Response) => {
    const test = {
        data: "this is some data",
    };

    res.json(test);
});

app.get("/api/db_test", (_, res: Response) => {
    try {
        // Connect to the MongoDB cluster
        mongoose.connect(process.env.MONGODB_URI as string, () =>
            res.send("Mongoose is connected")
        );
    } catch (e) {
        res.send("could not connect");
    }
});

app.get("/login", (_, res) => {
    res.send("<a href='/auth/google'>Authenticate with Google</a>");
});

app.post("logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.send("Goodbye!");
    });
});

app.get(
    "/api/auth/google",
    passport.authenticate("google", {
        scope: [
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
        ],
    })
);

app.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: `${process.env.FE_URL}/scheduler`,
        failureRedirect: "/auth/failure",
    })
);

app.get("/api/protected", isLoggedIn, (req, res) => {
    let test = {
        name: req.user?.profile.displayName,
        accessToken: req.user?.accessToken,
    };

    res.json(test);
});

app.get("/api/calendars", async (req, res) => {
    let url =
        "https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=" +
        req.user?.accessToken;

    // TODO: catch errors
    const rawData = await fetch(url, {
        method: "GET",
    });

    // catch errors
    const responseStatus = rawData.status;
    if (responseStatus >= 400) {
        if (responseStatus === 401) {
            // invalid credentials
            res.status(401);
            res.send(new ApiErrorResponse("Login failed. Invalid Credentials"));
            return;
        } else if (responseStatus === 500) {
            // google server error
            res.status(500);
            res.send(new ApiErrorResponse("Google dun goofed."));
            return;
        }

        res.status(500);
        res.send(
            new ApiErrorResponse(
                "Unknown error while retrieving calendar events."
            )
        );
        return;
    }

    const data = await rawData.json();
    const calendarLists: CalendarList[] = data?.items || [];

    const calendarInfos: CalendarInfo[] = calendarLists.map((calendarList) => {
        return {
            id: calendarList.id,
            name: calendarList.summary,
        } as CalendarInfo;
    });

    res.json(calendarInfos);
});

app.get("/auth/failure", (_, res) => {
    res.status(403);
    res.send(
        new ApiFailResponse(
            "Failed to log in. Navigate to /login and try again."
        )
    );
});

function bin(
    courses: CourseCatalog,
    locations: string[],
    shifts: Shift[]
): Schedule {
    // create empty schedule
    const binnedSchedule: Schedule = [];
    courses.forEach((course: CourseInfo) => {
        const courseSchedule: CourseSchedule = {
            courseInfo: course,
            locationSchedules: [],
        };
        locations.forEach((location: string) => {
            const locationSchedule: LocationSchedule = {
                location,
                dailySchedules: [],
            };
            [0, 1, 2, 3, 4, 5, 6].forEach((weekDay: number) => {
                locationSchedule.dailySchedules.push({
                    weekDay: weekDay as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                    intervals: [],
                });
            });
            courseSchedule.locationSchedules.push(locationSchedule);
        });
        binnedSchedule.push(courseSchedule);
    });

    // populate the schedule with the relevant intervals
    shifts.forEach((shift: Shift) => {
        shift.coursesGiven.forEach((courseGiven: string) => {
            const relevantCourseSchedule = binnedSchedule.find(
                (courseSchedule: CourseSchedule) => {
                    return (
                        courseSchedule.courseInfo.matchScore(courseGiven) > 0.9
                    ); // TODO: consider the matchString  threshold
                }
            );
            if (!relevantCourseSchedule) {
                return;
            }
            const relevantLocationSchedule =
                relevantCourseSchedule.locationSchedules.find(
                    (locationSchedule: LocationSchedule) => {
                        return shift.location === locationSchedule.location;
                    }
                );
            if (!relevantLocationSchedule) {
                return;
            }
            const relevantDailySchedule =
                relevantLocationSchedule.dailySchedules.find(
                    (dailySchedule: DailySchedule) => {
                        return shift.weekDay === dailySchedule.weekDay;
                    }
                );
            if (relevantDailySchedule) {
                relevantDailySchedule.intervals.push(
                    new Interval(shift.start, shift.end)
                );
                // TODO: can we just have shift.interval? maybe it doesn't need to extend
            }
        });
    });
}

// function bin(
//     eventWrapperList: EventWrapper[],
//     classes: Set<string>
// ): Map<string, Map<number, Interval[]>> {
//     const weekDayBin: Map<number, Interval[]> = new Map<number, Interval[]>(
//         [0, 1, 2, 3, 4, 5, 6].map((day) => [day, []])
//     );

//     const classList = Array.from(classes);
//     const classBin: Map<string, Map<number, Interval[]>> = new Map<
//         string,
//         Map<number, Interval[]>
//     >(
//         classList.map((c) => [
//             c,
//             new Map<number, Interval[]>(
//                 JSON.parse(JSON.stringify(Array.from(weekDayBin)))
//             ),
//         ])
//     );

//     eventWrapperList.forEach((eventWrapper) => {
//         const eventWeekDay = eventWrapper.weekDay;
//         eventWrapper.classes.forEach((c) => {
//             classBin.get(c)?.get(eventWeekDay)?.push(eventWrapper.interval);
//         });
//     });

//     return classBin;
// }

app.post("/api/schedule", async (req, res) => {
    const schedule: Schedule = [];
    const {
        calIdList,
        stagingWeek,
    }: { calIdList: CalendarInfo[]; stagingWeek: Date } = req.body;

    const startTime = new Date(stagingWeek);
    const endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + 7);

    console.log(req.body);
    console.log(calIdList);
    console.log(stagingWeek);

    for (const calId of calIdList) {
        const { name, id }: { name: string; id: string } = calId;

        const url =
            `https://www.googleapis.com/calendar/v3/calendars/${id}/events?` +
            `access_token=${req.user?.accessToken}&` +
            `timeMin=${startTime.toISOString()}&` +
            `timeMax=${endTime.toISOString()}`;

        const data = await fetch(url, {
            method: "GET",
        });

        // catch errors
        const responseStatus = data.status;
        if (responseStatus >= 400) {
            if (responseStatus === 401) {
                // invalid credentials
                res.status(401);
                res.send(
                    new ApiFailResponse(
                        "Invalid Credentials. Navigate to /login and login through Google again."
                    )
                );
                return;
            } else if (responseStatus === 404) {
                // invalid id error
                res.status(404);
                res.send(
                    new ApiFailResponse(
                        `${name} calendar not found. Double check that your calendars are not deleted.`
                    )
                );
                return;
            } else if (responseStatus === 500) {
                // google server error
                res.status(500);
                res.send(
                    new ApiErrorResponse(
                        "Google backend error. Please try again in a few minutes."
                    )
                );
                return;
            }

            res.status(500);
            res.send(
                new ApiErrorResponse(
                    "Unknown error while retrieving calendar events."
                )
            );
            return;
        }

        // TODO: change this any
        const eventJson: any = await data.json();
        const eventList: Event[] = eventJson.items;

        const shiftsAtLocation: Shift[] = eventList.map(
            (event) => new Shift(event, name)
        );

        const eventWrapperList: EventWrapper[] = eventList.map(
            (event) => new EventWrapper(event)
        );

        const classes: Set<string> = eventWrapperList.reduce((prev, cur) => {
            cur.classes.forEach((c) => prev.add(c));
            return prev;
        }, new Set<string>());

        const map = bin(eventWrapperList, classes);

        classes.forEach((c) => {
            const intervalsByDate: any[] = [];
            [0, 1, 2, 3, 4, 5, 6].forEach((day) => {
                const dateToInterval: any = {};
                const getClassScheduleInput = map.get(c)?.get(day);
                if (
                    getClassScheduleInput &&
                    getClassScheduleInput.length !== 0
                ) {
                    dateToInterval[day] = getClassSchedule(
                        getClassScheduleInput
                    );
                } else {
                    dateToInterval[day] = [];
                }
                intervalsByDate.push(dateToInterval);
            });
            const labelToIntervals: any = {};
            labelToIntervals[label] = intervalsByDate;
            if (schedule.hasOwnProperty(c)) {
                schedule[c].push(intervalsByDate);
            } else {
                schedule[c] = [intervalsByDate];
            }
        });
    }
    res.json(schedule);
});

app.get("/api/test_events", async (req, res) => {
    const calendarId = "c_42fl1bgnvouk4hb2q4vc95kl7c@group.calendar.google.com";
    const startTime = new Date(2022, 7, 20);
    const endTime = new Date(2022, 7, 29);
    let url =
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
        `access_token=${req.user?.accessToken}&` +
        `timeMin=${startTime.toISOString()}&` +
        `timeMax=${endTime.toISOString()}`;

    const data = await fetch(url, {
        method: "GET",
    });

    // TODO: change this any
    const eventJson: any = await data.json();
    const eventList: Event[] = eventJson.items;

    const eventWrapperList: EventWrapper[] = eventList.map(
        (event) => new EventWrapper(event)
    );

    // TODO: eventually, classes will be pulled from a source of truth
    const classes: Set<string> = eventWrapperList.reduce((prev, cur) => {
        cur.classes.forEach((c) => prev.add(c));
        return prev;
    }, new Set<string>());

    const map = bin(eventWrapperList, classes);
    const input: Map<String, Map<number, Interval[]>> = new Map(
        JSON.parse(JSON.stringify(Array.from(map)))
    ); // deep copy of map
    // const output: Map<String, Map<number, Interval[]>> = map;
    const output: any = {};
    classes.forEach((c) => {
        const classObj: any = {}; // change this any???
        [0, 1, 2, 3, 4, 5, 6].forEach((day) => {
            const inputEventWrapperList = map.get(c)?.get(day);
            if (inputEventWrapperList && inputEventWrapperList.length !== 0) {
                classObj[day] = getClassSchedule(inputEventWrapperList);
                // output.get(c)?.set(day, getClassSchedule(inputEventWrapperList));
            }
        });
        output[c] = classObj;
    });

    res.json({
        output,
    });
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
