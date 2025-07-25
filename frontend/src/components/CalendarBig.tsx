"use client"

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { calendarEvents } from '@/lib/data';
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useState } from 'react';
import { View, Views } from 'react-big-calendar';

import { format, parse, startOfWeek, getDay } from 'date-fns';
import {fr} from 'date-fns/locale/fr';

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

const CalendarBig = () => {
    const [view,setView] = useState<View>(Views.DAY)

    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    };
    return ( 
            <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={["day", "agenda"]}
            view={view}
            culture="fr"
            style={{ height: "95%" }}
            onView={handleOnChangeView}
            min={new Date(2025, 1, 0, 8, 0, 0)}
            max={new Date(2025, 1, 0, 17, 0, 0)}
            />
        )
}

export default CalendarBig;