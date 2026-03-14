"use client";
import React, { useEffect, useState } from "react";
import { FaUserFriends, FaUsers, FaRegUser } from "react-icons/fa";
import { MdDashboard, MdOutlineAssignmentInd, MdWork } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCountry, setDomain, setEsp, setView, setListId} from "@/store/appSlice";
import { LuLogOut } from "react-icons/lu";
import { Listbox } from "@headlessui/react";
import { usePathname } from "next/navigation";
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
interface Country {
  id: string;
  name: string;
  domain: string; // Add domain property
}

const Sidebar = () => {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [countryOptions, setCountryOptions] = useState<Country[]>([]); // Update type
  const [filteredCountryOptions, setFilteredCountryOptions] = useState<Country[]>([]); // New state for filtered countries
  const [espOptions, setEspOptions] = useState<{ id: string; name: string }[]>([]);
  const [domainOptions, setDomainOptions] = useState<{ id: string; name: string }[]>([]);
  const [searchEspTerm, setSearchEspTerm] = useState("");
  const [searchCountryTerm, setSearchCountryTerm] = useState("");
  const [searchDomainTerm, setSearchDomainTerm] = useState("");

  const dispatch = useAppDispatch();
  const selectedCountry:any = useAppSelector((state) => state.app.country);
  const selectedListId = useAppSelector((state) => state.app.listId);
  const selectedESP:any = useAppSelector((state) => state.app.esp);
  const selectedDomain:any = useAppSelector((state) => state.app.domain);
  const selectedType = useAppSelector((state) => state.app.view);
  const pathname = usePathname();
  const [userType, setUserType] = useState<"internal" | "external" | null>(null);
  const disabledSidebarPaths = ["/segment-details", "/SegmentDashBoard"];
  const isSegmentDetailsPage = disabledSidebarPaths.includes(pathname);
  useEffect(() => {
    const storedView = localStorage.getItem("sidebarView") || "Statistics";
    dispatch(setView(storedView));
  }, []);

  const filteredEspOptions = espOptions.filter(esp =>
    esp.name.toLowerCase().includes(searchEspTerm.toLowerCase())
  );

  const filteredDomainOptions = domainOptions.filter(domain =>
    domain.name.toLowerCase().includes(searchDomainTerm.toLowerCase())
  );

  const searchFilteredCountryOptions = filteredCountryOptions.filter(country =>
    country.name.toLowerCase().includes(searchCountryTerm.toLowerCase())
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, espRes, domainRes] = await Promise.all([
          fetch("/api/country"),
          fetch("/api/esp"),
          fetch("/api/domain"),
        ]);

        if (!countryRes.ok || !espRes.ok || !domainRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const countries = await countryRes.json();
        const esp = await espRes.json();
        const domains = await domainRes.json();

        // Update countryOptions to include domain
        const updatedCountries: Country[] = countries.map((country: any) => ({
          id: country.id,
          name: country.name,
          domain: country.domain, // Assuming your API returns a 'domain' property
        }));

        setCountryOptions(updatedCountries);
        setEspOptions(Array.isArray(esp) ? esp : []);
        setDomainOptions(Array.isArray(domains) ? domains : []);
        console.log(domainOptions, "domains")
      } catch (error) {
        console.log("Error fetching sidebar data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const storedUserType = localStorage.getItem("roleType") as "internal" | "external" | null;
    setUserType(storedUserType);
  }, []);

  // Filter country options based on selected domain
  useEffect(() => {
    if (selectedDomain === "FavoTrip") {
      setFilteredCountryOptions(countryOptions.filter((country) => country.name === "NL Netherland"));
    }
    else if (selectedDomain === "All") {
      setFilteredCountryOptions(countryOptions.filter((country) => country.name === "All"));
    } else {
      setFilteredCountryOptions(countryOptions);
    }
  }, [selectedDomain, countryOptions]);

  // Handle automatic country change when domain changes to FavoTrip
  // useEffect(() => {
  //   if (selectedDomain === "FavoTrip" && selectedCountry !== "NL Netherland") {
  //     dispatch(setCountry("NL Netherland"));
  //   }
  //   if (selectedDomain === "All" && selectedCountry !== "All") {
  //     dispatch(setCountry("All"));
  //   }
  // }, [selectedDomain, selectedCountry, dispatch]);

  const handleTypeChange = (value: string) => {
    const newValue = value.toLowerCase();
    dispatch(setView(newValue));
    localStorage.setItem("sidebarView", newValue);
  };

  const handleMenuClick = (name: string) => {
    setActiveMenu(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roleType");
    router.push("/login");
  };

  const handleCountryChange = (value: string) => {
    dispatch(setCountry(value));
    setSearchCountryTerm("")
  };

  const handleEspChange = (value: string) => {
    dispatch(setEsp(value));
    setSearchEspTerm("");
  };

  const handleDomainChange = (value: string) => {
       dispatch(setCountry(""));
       dispatch(setListId(""));
    dispatch(setDomain(value));
    setSearchDomainTerm("");
  };
   const shouldFetchData = () => {
    return selectedCountry && selectedCountry !== "" && selectedCountry !== "Select a Country";
  };

  // Add this useEffect to handle data fetching based on country selection
  useEffect(() => {
    if (shouldFetchData()) {
      // Your data fetching logic here
      // This will only run when a valid country is selected
      console.log("Fetching data for country:", selectedCountry);
      // fetchYourMainData(); // Call your main data fetching function here
    }
  }, [selectedCountry, selectedDomain, selectedESP]); // Add other dependencies as needed
  // if (!userType) return null;
  return (
    <>
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex items-center justify-between shadow-sm h-[14%] text-white px-4 w-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-center  py-[20px] ">
          <img src="/logo.png" alt="Logo" className="h-6" />
          <h1 className="text-lg font-bold text-gray-800 uppercase">BASEGROW</h1>
        </div>

        {/* Select Options */}
        <div className="flex-1 flex justify-center">
          {userType === "internal" && (
            <>
              <div className="p-4 text-black flex gap-2">
                {/* Select View */}
                {/* <div className="flex gap-2 ">
                <label className="text-base font-semibold text-gray-800 mt-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Select View:
                </label>
                <Listbox value={selectedType} onChange={handleTypeChange} disabled={isSegmentDetailsPage}>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <span className="block truncate">{selectedType || "Select View"}</span>
                      <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
                      </span>
                    </Listbox.Button>

                    <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none overflow-auto focus:outline-none z-50">
                      {["Aggregate", "Event"].map((view) => (
                        <Listbox.Option
                          key={view}
                          value={view}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                {view}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-3 flex items-center text-blue-600">
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div> */}
                <div className="flex gap-1  mt-2">
                  {/* {["Statistics", "Event"].map((view: any) => ( */}
                    <button
                      // key={view}
                      onClick={() => handleTypeChange("Statistics")}
                      // disabled={isSegmentDetailsPage}
                      className={`px-4 py-2 rounded-md text-base font-semibold ${selectedType  === "Statistics"? "text-blue-600":"text-gray-900 hover:text-blue-500"}`}
                    >
                      {/* {view} */}
                      Statistics
                    </button>
                    <button
                      // key={view}
                      onClick={() => handleTypeChange("Event")}
                      // disabled={isSegmentDetailsPage}
                      className={`px-4 py-2 rounded-md text-base font-semibold ${selectedType  === "Event"? "text-blue-600":"text-gray-900 hover:text-blue-500"}`}
                    >
                      {/* {view} */}
                      Event
                    </button>
                  {/* ))} */}
                </div>

                {/* Country Selector */}
                <div className="flex gap-2">
                  <label className="text-base font-semibold text-gray-800 mt-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Select Country:</label>
                  <Listbox value={selectedCountry} onChange={handleCountryChange} disabled={isSegmentDetailsPage}>
                    <div className="relative mt-2 w-50">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <span className="block truncate">{selectedCountry || "Select a Country"}</span>
                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
                        </span>
                      </Listbox.Button>

                      <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none overflow-auto focus:outline-none z-50">
                        <div className="sticky top-0 bg-white p-3 border-b border-gray-200 z-300">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Search Country..."
                              value={searchCountryTerm}
                              onChange={(e) => setSearchCountryTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                            />
                          </div>
                        </div>
                        <div className="max-h-48 ">
                          {searchFilteredCountryOptions.map((country) => ( // Use filteredCountryOptions here
                            <Listbox.Option
                              key={country.id}
                              value={country.name}
                              disabled={isSegmentDetailsPage}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"}`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${ selected? "font-medium": "font-normal" }`} >
                                    {country.name}
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
                {/* domain selector */}
                <div className="flex gap-2">
                  <label className="text-base font-semibold text-gray-800 mt-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Select Domain:</label>
                  <Listbox value={selectedDomain} onChange={handleDomainChange} disabled={isSegmentDetailsPage}>
                    <div className="relative mt-2 w-50">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <span className="block truncate">{selectedDomain || "Select a Domain"}</span>
                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
                        </span>
                      </Listbox.Button>

                      <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none overflow-auto focus:outline-none z-50">
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
                          {filteredDomainOptions.map((domain) => (
                            <Listbox.Option
                              key={domain.id}
                              value={domain.name}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? "bg-blue-100 text-blue-900" : "text-gray-700"}`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${ selected? "font-medium": "font-normal" }`}>
                                    {domain.name}
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
                {/* ESP Selector */}
                <div className="flex gap-2">
                  <label className="text-base font-semibold text-gray-800 mt-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Select ESP:</label>
                  <Listbox value={selectedESP} onChange={handleEspChange} disabled={isSegmentDetailsPage}>
                    <div className="relative mt-2 w-50">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <span className="block truncate">{selectedESP || "Select an ESP"}</span>
                        <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
                        </span>
                      </Listbox.Button>

                      <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none overflow-auto focus:outline-none z-50">
                        <div className="sticky top-0 bg-white p-3 border-b border-gray-200 z-300">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Search Esp...."
                              value={searchEspTerm}
                              onChange={(e) => setSearchEspTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                            />
                          </div>
                        </div>
                        <div className="max-h-48 ">
                        {filteredEspOptions.map((esp) => (
                          <Listbox.Option
                            key={esp.id}
                            value={esp.name}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active? "bg-blue-100 text-blue-900": "text-gray-700" }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${ selected? "font-medium": "font-normal" }`}>
                                  {esp.name}
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
            </>)}
        </div>
        {/* Logout Button */}
        <div className=" flex justify-center items-center">
          <button
            className="flex items-center justify-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
            onClick={handleLogout}
          >
            <LuLogOut className="mr-2 text-xl" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
export default Sidebar;