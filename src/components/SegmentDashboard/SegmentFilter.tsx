import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { ListId } from "./types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEndDate, setIsAlternativeView, setStartDate, setTimePeriod } from "@/store/appSlice";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

interface AnalyticsFiltersProps {}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({}) => {
  // const [showCalendar, setShowCalendar] = useState(false);
  const dispatch = useAppDispatch();
  const timePeriod = useAppSelector((state) => state.app.timePeriod);
  const isAlternativeView = useAppSelector((state) => state.app.isAlternativeView);
  const startDate = useAppSelector((state) => state.app.startDate);
  const endDate = useAppSelector((state) => state.app.endDate);

  const timePeriodOptions = [
    { value: "last_10_days", label: "Last 10 Days" },
    { value: "last_20_days", label: "Last 20 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "all_time", label: "All Time" },
    { value: "custom", label: "Custom" },
  ];

  const handleTimePeriodChange = (value: string) => {
    console.log("inside handle time periodchange")
    console.log(value,"value")
    dispatch(setTimePeriod(value));
    console.log(timePeriod,"selected Time period")
    // setShowCalendar(value === "custom");
  };
  const showCalendar = timePeriod === "custom";
  return (
    <div className="flex gap-4 items-center">
      <div className="flex px-2 gap-4 items-center relative"> {/* Add relative positioning here */}
        <Listbox value={timePeriod} onChange={handleTimePeriodChange}>
          <div className="relative mt-2 w-50 h-10  ">
            <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-10">
              <span className="block truncate">
                {timePeriodOptions.find((option) => option.value === timePeriod)?.label || "Select Time Period"}
              </span>
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none z-20">
              {timePeriodOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-blue-100 text-blue-900" : "text-gray-700"
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
    </div>
  );
};

export default AnalyticsFilters;
