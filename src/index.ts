import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import * as dotenv from "dotenv";

import "./auth";
import { EventWrapper } from "./eventWrapper";
import { calendar_v3 } from "@googleapis/calendar";
import Event = calendar_v3.Schema$Event;
import { getClassSchedule } from "./algo";

// import { eventRouter } from "./events";

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
        successRedirect: `${process.env.FE_URL}/api/events`,
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

app.get("/api/get_calendars", async (req, res) => {
    let url =
        "https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=" +
        req.user?.accessToken;

    const data = await fetch(url, {
        method: "GET",
    });

    res.json(await data.json());
});

app.get("/auth/failure", (_, res) => {
    res.send("Failed to log in!");
});

function bin(
    eventWrapperList: EventWrapper[],
    classes: Set<String>
): Map<number, Map<String, EventWrapper[]>> {
    // return an object whose keys are days of the week and values
    // are another object whose keys are classes and values are the events
    // return:
    // {
    //     0: {
    //         "class1": [EventWrapper(), EventWrapper()...],
    //         "class2": [EventWrapper(), EventWrapper()...],
    //     },
    //     1:...
    // }
    const classList = Array.from(classes);
    const classBin: Map<String, EventWrapper[]> = new Map<
        String,
        EventWrapper[]
    >(classList.map((c) => [c, []]));

    const weekDayBin: Map<number, Map<String, EventWrapper[]>> = new Map<
        number,
        Map<String, EventWrapper[]>
    >(
        [0, 1, 2, 3, 4, 5, 6].map((day) => [
            day,
            new Map<String, EventWrapper[]>(
                JSON.parse(JSON.stringify(Array.from(classBin)))
            ),
        ])
    );

    eventWrapperList.forEach((eventWrapper) => {
        const eventWeekDay = eventWrapper.weekDay;
        eventWrapper.classes.forEach((c) => {
            weekDayBin.get(eventWeekDay)?.get(c)?.push(eventWrapper);
        });
    });

    return weekDayBin;
}

app.get("/api/events", async (req, res) => {
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
    const classes: Set<String> = eventWrapperList.reduce((prev, cur) => {
        cur.classes.forEach((c) => prev.add(c));
        return prev;
    }, new Set<String>());

    const map = bin(eventWrapperList, classes);
    const output: any[] = [];
    const input: any[] = [];
    [0, 1, 2, 3, 4, 5, 6].forEach((day) => {
        classes.forEach((c) => {
            const inputEventWrapperList = map.get(day)?.get(c);
            if (inputEventWrapperList?.length !== 0) {
                input.push({
                    day,
                    class: c,
                    events: inputEventWrapperList,
                });
                if (inputEventWrapperList) {
                    output.push({
                        day,
                        class: c,
                        intervals: getClassSchedule(inputEventWrapperList),
                    });
                }
            }
        });
    });

    res.json({
        input,
        output,
    });
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
