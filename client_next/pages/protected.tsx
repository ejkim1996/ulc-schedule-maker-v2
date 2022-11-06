import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { setEnvironmentData } from "worker_threads";
import { calendar_v3 } from "@googleapis/calendar";
import Calendar = calendar_v3.Calendar;
import CalendarList = calendar_v3.Schema$CalendarListEntry;

const Protected: NextPage = () => {
    const [username, setUsername] = useState("");
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchUsername();
        fetchCalendars();
    }, []);

    async function fetchUsername() {
        const res = await fetch("/api/protected", {
            method: "GET",
        });
        const data = await res.json();
        setUsername(data.name);
    }

    async function fetchCalendars() {
        const res = await fetch("/api/get_calendars", {
            method: "GET",
        });

        const data = await res.json();

        setItems(data.items.map((item: CalendarList) => item.summary));
    }

    const listItems = items.map((item) => <li key={item}>{item}</li>);

    return (
        <div>
            <h1>Hello {username}</h1>
            <ul>{listItems}</ul>
        </div>
    );
};

// TODO: Figure out Next.js integration for the code above
//
// export async function getStaticProps() {
//     const res = await fetch("http://localhost:3000/api/protected", {
//         method: "GET",
//     });
//     const data = await res.json();

//     return {
//         props: {username: data}
//     }
// }

export default Protected;
