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
import { getCurrentUser, ServerUser } from "@/lib/actions/auth.action"; // Import ServerUser type
import { getEventsByMonthRange } from "@/lib/actions/general.action"; // Ensure this import is correct

interface Event {
  id: string;
  date: string;
  title: string;
  description?: string;
  tasks?: Record<string, string>;
  userId: string;
  completed: boolean;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // Initialize as null
  const [isLoadingUser, setIsLoadingUser] = useState(true); // New: Loading state for user data
  const [isLoadingEvents, setIsLoadingEvents] = useState(false); // New: Loading state for calendar events

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

  // Effect to fetch user ID once on component mount
  useEffect(() => {
    const fetchInitialUserId = async () => {
      setIsLoadingUser(true); // Start loading user
      const user: ServerUser | null = await getCurrentUser();
      // CORRECTED: Use user?.id as specified by you
      setUserId(user?.id || null);
      setIsLoadingUser(false); // End loading user
    };

    fetchInitialUserId();
  }, []);

  // Effect to fetch month events whenever currentDate or userId changes
  useEffect(() => {
    // If userId is null (not logged in), or still loading user, stop here
    if (isLoadingUser || userId === null) {
      setIsLoadingEvents(false); // Ensure event loading is false if no user/user still loading
      if (userId === null) setEvents([]); // Clear events if user is explicitly null
      return;
    }

    const fetchMonthEvents = async () => {
      setIsLoadingEvents(true); // Start loading events
      const startDate = currentDate.startOf("month").format("YYYY-MM-DD");
      const endDate = currentDate.endOf("month").format("YYYY-MM-DD");

      const { success, data } = await getEventsByMonthRange({
        startDate,
        endDate,
        userId,
      });

      if (success && data) {
        setEvents(data as Event[]);
      } else {
        console.error("Failed to fetch month events:", data);
        setEvents([]); // Clear events on failure
      }
      setIsLoadingEvents(false); // End loading events
    };

    // Only fetch events if userId is a valid string (meaning user is authenticated)
    if (userId) {
      fetchMonthEvents();
    }
  }, [currentDate, userId, isLoadingUser]);

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
    return date.startOf("month").day();
  };

  const days = daysInMonth(currentDate);
  const firstDayOffset = getFirstDayOfMonthOffset(currentDate);

  const allGridDays = Array(firstDayOffset).fill(null).concat(days);
  while (allGridDays.length < 42) {
    allGridDays.push(null);
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex justify-center items-center">
        <p className="text-xl">Loading user data...</p>
      </div>
    );
  }

  if (userId === null) {
    return (
      <div className="min-h-screen bg-background text-white p-8 flex flex-col justify-center items-center">
        <p className="text-xl text-center mb-4">
          Please sign in to view your calendar.
        </p>
      </div>
    );
  }
  console.log(events);

  return (
    <>
      <div className="min-h-screen bg-background text-white p-8 ">
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
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mt-4 text-center text-sm">
          {isLoadingEvents
            ? Array(42)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-20 bg-[#0F234C] animate-pulse rounded-md p-1"
                  />
                ))
            : allGridDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-20 border border-transparent rounded-md p-1"
                    />
                  );
                }

                const formattedDate = day.format("YYYY-MM-DD");
                const eventsForDay = events.filter(
                  (event) => event.date === formattedDate
                );
                const hasEvent = eventsForDay.length > 0;

                return (
                  <div
                    key={formattedDate}
                    className={`h-20 border border-gray-700 rounded-md p-1 hover:bg-[#132454] transition cursor-pointer ${
                      formattedDate === selectedDate ? "bg-[#132454]" : ""
                    }`}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="text-gray-300 font-medium">
                      {day.date()}
                    </div>
                    {hasEvent && (
                      <div className="text-xs bg-purple-600 text-white mt-2 rounded px-1 max-w-full truncate">
                        {eventsForDay[0]?.title || "Event"}
                        {eventsForDay.length > 1 &&
                          ` (+${eventsForDay.length - 1})`}
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
