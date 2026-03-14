"use client";
import { useEffect, useState } from "react";
// import { FiMenu } from "react-icons/fi"; // Menu icon for mobile responsiveness
import AddUserModal from "../AddUserModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setShowModal } from "@/store/appSlice";
import Link from "next/link";
import ExcelImportForm from "@/components/ExcelImportForm";
import { useRouter } from "next/navigation";
const Navbar = () => {
  const dispatch = useAppDispatch();
  const showModal = useAppSelector((state) => state.app.showModal);
  const [isOpen, setIsOpen] = useState(false);
   const [userType, setUserType] = useState<"internal" | "external" | null>(null);
  const router = useRouter();
  // const [showModal, setShowModal] = useState(false);
   useEffect(() => {
      const storedUserType = localStorage.getItem("roleType") as "internal" | "external" | null;
      setUserType(storedUserType);
    }, []);

    // if (!userType) return null;
  return (
    <>
      <nav className="bg-white shadow-sm p-[22px] px-4">
        <div className="container mx-auto flex justify-end items-center gap-2">
          {/* Left - Logo & Title */}
          {/* <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="h-6" />
          <h1 className="text-lg font-semibold text-gray-800 upercase">BASE GROW</h1>
        </div> */}

          {/* Right - Menu */}
          <div className=" md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Reports</a>
            <a href="#" className="text-gray-600 hover:text-blue-600">Settings</a>
            {/* {userType === "internal" && (
            <Link href="/user-table" className="text-gray-600 hover:text-blue-600">Users</Link>
            )} */}
          </div>
          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600" onClick={() => setIsOpen(!isOpen)}>
            {/* <FiMenu size={24} /> */}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {/* {isOpen && ( */}
        <div className="md:hidden mt-2 space-y-2 bg-white shadow-md p-3">
          <a href="#" className="block text-gray-600 hover:text-blue-600">Dashboard</a>
          <a href="#" className="block text-gray-600 hover:text-blue-600">Reports</a>
          <a href="#" className="block text-gray-600 hover:text-blue-600">Settings</a>
        </div>
        {/* )} */}
      </nav>
      {/* <AddUserModal show={showModal} onClose={handleCloseModal} /> */}
    </>
  );
};

export default Navbar;
