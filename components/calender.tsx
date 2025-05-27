"use client";
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import AddEvent from "./addEvent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getEventByDate } from "@/lib/actions/general.action";

interface Event {
  id: string;
  date: string;
  title: string;
  description?: string;
  tasks?: Record<string, string>; // Assuming tasks are now strings directly
  userId: string;
  completed: boolean;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [userId, setUserId] = useState<string>();
  console.log(userId);

  const handleDateClick = (day: dayjs.Dayjs) => {
    const formattedDate = day.format("YYYY-MM-DD");
    setSelectedDate(formattedDate);
    setSheetOpen(true);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  useEffect(() => {
    const fetchInitialUserId = async () => {
      const user = await getCurrentUser();
      const id = typeof user?.userId === "function" ? user.userId() : user?.id;
      setUserId(id);
    };

    fetchInitialUserId();
  }, []); // Fetch user ID once on component mount

  useEffect(() => {
    if (!userId) return;

    const fetchMonthEvents = async () => {
      const startOfMonth = currentDate.startOf("month").format("YYYY-MM-DD");
      const endOfMonth = currentDate.endOf("month").format("YYYY-MM-DD");
      const allMonthDays = daysInMonth(currentDate).map((day) =>
        day.format("YYYY-MM-DD")
      );
      let allEventsForMonth: Event[] = [];

      for (const date of allMonthDays) {
        const { success, data } = await getEventByDate({ date, userId });
        if (success && data) {
          allEventsForMonth = [...allEventsForMonth, ...(data as Event[])];
        } else if (success) {
          // No events for this day
        } else {
          console.error("Failed to fetch events for date:", date);
        }
      }
      setEvents(allEventsForMonth);
    };

    fetchMonthEvents();
  }, [currentDate, userId]);

  const daysInMonth = (date: dayjs.Dayjs) => {
    const year = date.year();
    const month = date.month();
    return new Array(date.daysInMonth()).fill(null).map((_, i) =>
      dayjs()
        .year(year)
        .month(month)
        .date(i + 1)
    );
  };

  const getFirstDayOfMonthOffset = (date: dayjs.Dayjs) => {
    return date.startOf("month").day(); // 0 for Sunday, 1 for Monday, etc.
  };

  const days = daysInMonth(currentDate);
  const firstDayOffset = getFirstDayOfMonthOffset(currentDate);
  const totalDays = days.length + firstDayOffset;
  const weeks = Math.ceil(totalDays / 7);

  return (
    <>
      <div className="min-h-screen bg-background text-white p-8">
        <h1 className="text-3xl font-bold mb-6">📅 My Calendar</h1>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search events..."
            className="bg-[#0F234C] text-white px-4 py-2 rounded-md w-1/3"
          />
          <div className="flex gap-2 items-center">
            <button
              onClick={goToToday}
              className="bg-[#1f2c6e] hover:bg-[#26367e] px-3 py-1 rounded-md"
            >
              Today
            </button>
            <ChevronLeft
              onClick={goToPreviousMonth}
              className="cursor-pointer"
            />
            <span className="text-lg font-semibold">
              {currentDate.format("MMMM YYYY")}
            </span>
            <ChevronRight onClick={goToNextMonth} className="cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-7 text-center font-semibold border-b border-gray-700 pb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mt-4 text-center text-sm">
          {Array(firstDayOffset)
            .fill(null)
            .map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-20 border border-transparent rounded-md p-1"
              />
            ))}
          {days.map((day) => {
            const formattedDate = day.format("YYYY-MM-DD");
            const hasEvent = events.some(
              (event) => event.date === formattedDate
            );

            return (
              <div
                key={formattedDate}
                className={`h-20 border border-gray-700 rounded-md p-1 hover:bg-[#132454] transition cursor-pointer ${
                  formattedDate === selectedDate ? "bg-[#132454]" : ""
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="text-gray-300 font-medium">{day.date()}</div>
                {hasEvent && (
                  <div className="text-xs bg-purple-600 text-white mt-2 rounded px-1">
                    {events.find((event) => event.date === formattedDate)
                      ?.title || "Event"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Events on {selectedDate}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-2">
            {events.filter((event) => event.date === selectedDate).length >
            0 ? (
              <>
                <Accordion type="multiple">
                  {events
                    .filter((event) => event.date === selectedDate)
                    .map((event) => (
                      <AccordionItem
                        key={event.id}
                        value={`event-${event.id}`}
                        className="px-10"
                      >
                        <AccordionTrigger>
                          <div className="text-left">
                            <h3 className="font-semibold">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Date: {dayjs(event.date).format("YYYY-MM-DD")}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {event.tasks &&
                          Object.keys(event.tasks).length > 0 ? (
                            <ul className="text-sm pl-4 list-disc space-y-1">
                              {Object.keys(event.tasks).map((key) => (
                                <li key={key}>{event.tasks[key]}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">
                              No tasks added.
                            </p>
                          )}
                          {event.description && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
                <div className="mt-6 px-10">
                  <AddEvent date={selectedDate} userId={userId} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center px-10 justify-center">
                <p className="text-muted-foreground text-center mb-4">
                  No events found for {selectedDate}.
                </p>
                <AddEvent date={selectedDate} userId={userId} />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Calendar;
