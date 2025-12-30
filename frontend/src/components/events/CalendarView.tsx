import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Event } from "@/services/events";
import { useRouter } from "next/navigation";
import { enUS } from "date-fns/locale";

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

interface CalendarViewProps {
    events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
    const router = useRouter();

    const calendarEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        resource: event,
    }));

    return (
        <div className="h-[600px] bg-white text-black p-4 rounded-lg shadow-sm border">
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                onSelectEvent={(event) => router.push(`/admin/events/${event.id}`)}
                views={["month", "week", "day", "agenda"]}
                eventPropGetter={(event) => {
                    const status = event.resource.status;
                    let backgroundColor = "#3b82f6"; // blue-500 default

                    if (status === "DRAFT") backgroundColor = "#94a3b8"; // slate-400
                    if (status === "PUBLISHED") backgroundColor = "#22c55e"; // green-500
                    if (status === "CANCELLED") backgroundColor = "#ef4444"; // red-500
                    if (status === "COMPLETED") backgroundColor = "#64748b"; // slate-500

                    return { style: { backgroundColor } };
                }}
            />
        </div>
    );
}
