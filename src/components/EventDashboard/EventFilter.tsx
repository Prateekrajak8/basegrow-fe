import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { ListId } from "./types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEndDate, setIsAlternativeView, setStartDate, setTimePeriod, setEventDomain, setStatus } from "@/store/appSlice";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import axios from "axios";
interface EventDomain {
  id: string;
  name: string;
  domain: string; // Add domain property
}
interface AnalyticsFiltersProps { }

const EventFilters: React.FC<AnalyticsFiltersProps> = ({ }) => {
  // const [showCalendar, setShowCalendar] = useState(false);
  const dispatch = useAppDispatch();
  const timePeriod = useAppSelector((state) => state.app.timePeriod);
  const eventDomain = useAppSelector((state) => state.app.eventDomain);
  const domain = useAppSelector((state) => state.app.domain);
  const country = useAppSelector((state) => state.app.country);
  const status = useAppSelector((state) => state.app.status);
  const isAlternativeView = useAppSelector((state) => state.app.isAlternativeView);
  const startDate = useAppSelector((state) => state.app.startDate);
  const endDate = useAppSelector((state) => state.app.endDate);
  const [eventDomainOptions, setEventDomainOptions] = useState<EventDomain[]>([]);
  // const [eventFilteredDomainOptions, setEventFilteredDomainOptions] = useState<EventDomain[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatusTerm, setSearchStatusTerm] = useState("");
  const [searchDomainTerm, setSearchDomainTerm] = useState("");
  useEffect(() => {
    dispatch(setEventDomain("All"));
  }, []);
  //  const [domain, setDomain] = useState("All");
  const timePeriodOptions = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "custom", label: "Custom" },
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "last_10_days", label: "Last 10 Days" },
    { value: "last_20_days", label: "Last 20 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "all_time", label: "All Time" },
  ];
  const filteredOptions = timePeriodOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions = [
    { value: "Both", label: "Both" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];
  const filteredStatusOptions = statusOptions.filter(option =>
    option.label.toLowerCase().includes(searchStatusTerm.toLowerCase())
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/isp", {
          params: {
            domain,
            country,
          },
        });
        if (!response) {
          throw new Error("Failed to fetch data");
        }

        const eventDomaines = response?.data?.data;

        const updatedEventDomaines: EventDomain[] = eventDomaines.map((item: any) => ({
          id: item.id,
          name: item.name,
          domain: item.Domain.name,
        }));
        const finalOptions = [{ id: "all", name: "All", domain: "All" }, ...updatedEventDomaines];

        // console.log(eventDomainOptions,"event opion inside filter")
        // console.log(eventDomainOptions,"domains of event")

        setEventDomainOptions(finalOptions);
      } catch (error) {
        console.log("Error fetching Event Domains:", error);
      }
    };

    fetchData();
  }, [domain, country]);

  const filteredDomainOptions = eventDomainOptions.filter(option =>
    option.name.toLowerCase().includes(searchDomainTerm.toLowerCase())
  );
  const handleTimePeriodChange = (value: string) => {
    console.log("inside handle time periodchange")
    console.log(value, "value")
    dispatch(setTimePeriod(value));
    console.log(timePeriod, "selected Time period")
    setSearchTerm("");
    // setShowCalendar(value === "custom");
  };
  const handleDomainChange = (value: any) => {
    console.log("inside handle Domain change")
    console.log(value, "value")
    dispatch(setEventDomain(value));
    setSearchDomainTerm("")

  };
  const handleStatusChange = (value: any) => {
    console.log("inside handle status change")
    console.log(value, "value")
    dispatch(setStatus(value));
    setSearchStatusTerm("");
  };

  const showCalendar = timePeriod === "custom";

  return (
    <div className="flex gap-4 items-center">
      <div className="flex flex-col p-2 relative"> {/* Add relative positioning here */}
        <label
          htmlFor="event-Time-select"
          className="text-md font-semibold text-gray-900"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Time Filter
        </label>
        <Listbox value={timePeriod} onChange={handleTimePeriodChange}>
          <div className="relative mt-2 w-60 h-10  ">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-10">
              <span className="block truncate">
                {filteredOptions.find((option) => option.value === timePeriod)?.label || "Select Time Period"}
              </span>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none z-20">
              <div className="sticky top-0 bg-white p-3 border-b border-gray-200 z-300">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Search time periods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                  />
                </div>
              </div>
              <div className="max-h-48 ">
                {filteredOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer overflow-y-auto select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {option.label}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-3 flex items-center text-blue-600">
                            <ChevronUpDownIcon className="h-5 w-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </div>
        </Listbox>

        {showCalendar && (
          <div className="flex gap-2 items-center">
            <label className="text-base font-semibold text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>Start:</label>
            <DatePicker
              selected={startDate ? new Date(startDate) : null}
              onChange={(date) => {
                const serializedStartDate:any = date ? new Date(date.setHours(12, 0, 0, 0)).toISOString() : null;
                dispatch(setStartDate(serializedStartDate));
              }}
              className="border w-40 h-10 rounded px-2 mt-2"
              placeholderText="Select start date"
              maxDate={endDate ? endDate : new Date()}
              withPortal
              shouldCloseOnSelect={true}
            />
            <label className="text-base font-semibold text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>End:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                const serializedEndDate:any = date ? new Date(date.setHours(23, 59, 59, 999)).toISOString() : null;
                dispatch(setEndDate(serializedEndDate));
              }}
              className="border w-40 h-10 rounded px-2 mt-2"
              placeholderText="Select end date"
              maxDate={new Date()}
              minDate={startDate ? new Date(startDate) : new Date()}
              withPortal
              shouldCloseOnSelect={true}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col relative"> {/* Add relative positioning here */}
        <label
          htmlFor="event-domain-select"
          className="text-md font-semibold text-gray-900"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Domain Filter
        </label>

        <Listbox value={eventDomain} onChange={handleDomainChange}>
          <div className="relative mt-2 w-60 h-10  ">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-10">
              <span className="block truncate">
                {filteredDomainOptions.find((option) => option.name === eventDomain)?.name || "Select Domain"}
              </span>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none z-20">
              <div className="sticky top-0 bg-white p-3 border-b border-gray-200 z-300">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Search Domain..."
                    value={searchDomainTerm}
                    onChange={(e) => setSearchDomainTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                  />
                </div>
              </div>
              <div className="max-h-48 ">
                {filteredDomainOptions.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    className={({ selected }) =>
                      `relative  cursor-pointer select-none py-2 pl-10 pr-4 ${selected ? "bg-blue-100 text-blue-900" : "text-gray-700"
                      }`
                    }
                    value={option.name}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium bg-blue-100 text-blue-900" : "font-normal"}`}>
                          {option.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-3 flex items-center text-blue-600">
                            <ChevronUpDownIcon className="h-5 w-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
      <div className="flex flex-col relative">
        <label
          htmlFor="event-status-select"
          className="text-md font-semibold text-gray-900"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Status Filter
        </label>
        <Listbox value={status} onChange={handleStatusChange}>
          <div className="relative mt-2 w-50 h-10  ">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-10">
              <span className="block truncate">
                {filteredStatusOptions.find((option) => option.value === status)?.label || "Select Status"}
              </span>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none z-20">
              <div className="sticky top-0 bg-white p-3 border-b border-gray-200 z-300">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Search Status..."
                    value={searchStatusTerm}
                    onChange={(e) => setSearchStatusTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                  />
                </div>
              </div>
              <div className="max-h-48 ">
                {filteredStatusOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {option.label}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-3 flex items-center text-blue-600">
                            <ChevronUpDownIcon className="h-5 w-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    </div>
  );
};

export default EventFilters;
