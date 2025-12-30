"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Event } from "@/services/events";
import { useRouter } from "next/navigation";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface EventCalendarProps {
    events: Event[];
}

export function EventCalendar({ events }: EventCalendarProps) {
    const router = useRouter();

    const calendarEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        resource: event,
    }));

    const handleSelectEvent = (event: any) => {
        // router.push(`/admin/events/${event.id}`);
        // For now, no detail page, verify if edit or view.
        console.log("Selected event", event);
    };

    return (
        <div className="h-[600px] bg-background border rounded-md p-4">
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                onSelectEvent={handleSelectEvent}
                views={["month", "week", "day"]}
                defaultView="month"
            />
        </div>
    );
}
