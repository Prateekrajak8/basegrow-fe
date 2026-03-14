"use client";
import React, { useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, MagnifyingGlassIcon, CheckIcon } from "@heroicons/react/20/solid";
import { MdAnalytics, MdDashboard, MdSettings } from "react-icons/md";
import { Fragment } from "react";
import CampaignTable from "./CampaignDashboard/CampaignTable";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { setCampaignDomainCountry } from "../store/appSlice";
export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const campaignDomainCountry = useSelector((state: RootState) => state.app.campaignDomainCountry);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [campaignNames, setCampaignNames] = useState<string[]>([]);
    const campaignCountries = [
        { value: "travelwhale", label: "Travelwhale NL", id: 1 },
        { value: "Favotrip NL", label: "Favotrip NL", id: 2 },
        { value: "Travelwhale DE", label: "Travelwhale DE", id: 3 },
        { value: "Travelwhale FR", label: "Travelwhale FR", id: 4 },
        { value: "Travelwhale UK", label: "Travelwhale UK", id: 5 },
        { value: "Travelwhale DK", label: "Travelwhale DK", id: 6 },
    ];

    const getCurrentAccountId = () => {
    const selectedDomain = campaignCountries.find(
        (c) => c.value === campaignDomainCountry
    );
    return selectedDomain?.id || 1;
};
    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };
    const filteredOptions = campaignCountries.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handleCampaignCountryChange = (value: string) => {
        console.log("Changing campaign country to:", value); // Debug log
        dispatch(setCampaignDomainCountry(value));
    };
   
    const handleCampaignNamesUpdate = (names: string[]) => {
        console.log(names, "name in campaign name")
        setCampaignNames(names);
    };

    // Function to handle CSV Criteria Form button click
    const handleCsvCriteriaClick = () => {
        const accountId = getCurrentAccountId();
        const campaignNamesParam = encodeURIComponent(JSON.stringify(campaignNames));
        router.push(`/campaignAnalysis?id=${accountId}&activeDomain=${campaignCountries.find((c) => c.value === campaignDomainCountry)?.label}&campaignNames=${campaignNamesParam}`);
    };
  
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header Section */}
            <div className="bg-white  border-b border-gray-200 text-center">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between m-6">
                        <div className="flex items-center space-x-3">
                            <MdDashboard className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Campaign Dashboard</h1>
                        </div>
                        <div className="item-left">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium text-sm flex items-center space-x-2"
                            >
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full mx-auto px-2 sm:px-6 lg:px-2 py-8">
                {/* Controls Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="campaignCountry" className="block text-sm font-medium text-gray-700 mb-2">
                                🌍 Select Domain
                            </label>
                            <Listbox value={campaignDomainCountry} onChange={handleCampaignCountryChange}>
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                                        <span className="flex items-center">
                                           
                                            <span className="block truncate font-medium">
                                                {campaignCountries.find((c) => c.value === campaignDomainCountry)?.label || "Select Domain"}
                                            </span>
                                        </span>
                                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                        </span>
                                    </Listbox.Button>

                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                                            {filteredOptions.map((option) => (
                                                <Listbox.Option
                                                    key={option.value}
                                                    value={option.value}
                                                    className={({ active, selected }) =>
                                                        `relative cursor-pointer select-none py-3 pl-4 pr-10 transition-colors duration-150 ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"
                                                        } ${selected ? "bg-blue-100 text-blue-700 font-medium" : "font-normal"}`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className="flex items-center">
                                                                {/* <span className="mr-2 text-lg">{option.icon}</span> */}
                                                                <span className={`block truncate ${selected ? "font-semibold text-blue-700" : "font-normal"}`}>
                                                                    {option.label}
                                                                </span>
                                                            </span>
                                                            {selected && (
                                                                <span className="absolute inset-y-0 right-3 flex items-center text-blue-700">
                                                                    <CheckIcon className="h-5 w-5" />
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleCsvCriteriaClick}
                                className="inline-flex items-center px-6 py-4 rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg"
                            >
                                <MdAnalytics className="w-5 h-5 mr-2" />
                                DATA ADDITION
                            </button>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm">Active Domain</p>
                                    <p className="text-lg font-bold">
                                        {campaignCountries.find((c) => c.value === campaignDomainCountry)?.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Campaign Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            📊 Campaign Performance Overview
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Monitor your email campaigns performance for {campaignCountries.find((c) => c.value === campaignDomainCountry)?.label}
                        </p>
                    </div>

                    <div className="">
                        {/* Pass the current account ID to the single CampaignTable component */}
                        <CampaignTable accountId={getCurrentAccountId()}
                            campaignCountry={campaignCountries.find((c) => c.value === campaignDomainCountry)?.label || "Unknown"}
                            onCampaignNamesUpdate={handleCampaignNamesUpdate} />
                    </div>
                </div>
            </div>
        </div>
    );
}