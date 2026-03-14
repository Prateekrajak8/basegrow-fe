import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ListId } from "./types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEndDate, setIsAlternativeView, setStartDate, setTimePeriod } from "@/store/appSlice";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

interface AnalyticsFiltersProps { }

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ }) => {
  // const [showCalendar, setShowCalendar] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Comparison Table");
  const dispatch = useAppDispatch();
  const timePeriod = useAppSelector((state) => state.app.timePeriod);
  const isAlternativeView = useAppSelector((state) => state.app.isAlternativeView);
  const startDate = useAppSelector((state) => state.app.startDate);
  const endDate = useAppSelector((state) => state.app.endDate);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
  // Validate and normalize timePeriod
  const validTimePeriods = timePeriodOptions.map((option) => option.value);
  const normalizedTimePeriod = validTimePeriods.includes(timePeriod) ? timePeriod : "last_7_days";

  useEffect(() => {
    if (!validTimePeriods.includes(timePeriod)) {
      dispatch(setTimePeriod("last_7_days"));
    }
  }, [timePeriod, validTimePeriods, dispatch]);

  const handleTimePeriodChange = (value: string) => {
    dispatch(setTimePeriod(value));
    setSearchTerm("");
     setIsDropdownOpen(false);
    // setShowCalendar(value === "custom");
  };
  useEffect(() => {
    if (!isDropdownOpen) {
      setSearchTerm("");
    }
  }, [isDropdownOpen]);

  const handleToggleView = () => {
    dispatch(setIsAlternativeView(!isAlternativeView));
    setButtonLabel(isAlternativeView ? "Comparison Table" : "Normal Table"); // Toggle the label here
  };
  const showCalendar = timePeriod === "custom";
  return (
    <div className="flex gap-4 items-center">
      <div className="flex p-2 gap-4 items-center relative"> {/* Add relative positioning here */}
        <div className="flex flex-col">
          <label
            htmlFor="time-select"
            className="text-md font-semibold text-gray-900"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Time Filter
          </label>
          <Listbox value={normalizedTimePeriod} onChange={handleTimePeriodChange}>
            <div className="relative mt-2 w-60 h-10">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-10">
                <span className="block truncate">
                  {timePeriodOptions.find((option) => option.value === normalizedTimePeriod)?.label || "Select Time Period"}
                </span>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
                </span>
              </Listbox.Button>

              <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none z-20">
                <div className="sticky top-0 bg-white p-3 border-b border-gray-200 z-30">
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
                {/* {timePeriodOptions.map((option) => ( */}
                 <div className="max-h-48 ">
                {filteredOptions.map((option) => (
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
        {showCalendar && (
          <div className="flex gap-2 items-center mt-6">
            <label className="text-base font-semibold text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>Start:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                const serializedStartDate:any = date ? new Date(date.setHours(12, 0, 0, 0)).toISOString() : null;
                dispatch(setStartDate(serializedStartDate));
              }}
              className="border border-gray-300 w-40 h-10 rounded px-2 mt-2"
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
              className="border border-gray-300 w-40 h-10 rounded px-2 mt-2"
              placeholderText="Select end date"
              maxDate={new Date()}
              minDate={startDate ? new Date(startDate) : new Date()}
              withPortal
              shouldCloseOnSelect={true}
            />
          </div>
        )}

        {/* <button
          className="p-2 bg-blue-500 text-white rounded w-40 mt-8 cursor-pointer"
          onClick={handleToggleView}
        >
          {buttonLabel}
        </button> */}
      </div>
    </div>
  );
};

export default AnalyticsFilters;
