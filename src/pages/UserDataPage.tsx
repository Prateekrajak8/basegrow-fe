// pages/users.tsx
"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "@/components/AnalyticsDashboard/AnalyticsDashboard.css";
import { CiImport } from "react-icons/ci";
import { CiExport } from "react-icons/ci";
import { useRouter } from "next/navigation";
import {
    ColDef,
    CustomFilterModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    ValidationModule,
    GridReadyEvent,
    ColumnAutoSizeModule
} from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
import AddUserModal from '../components/AddUserModal';
import axios from 'axios';
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    PaginationModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    TextFilterModule,
    CustomFilterModule,
    ColumnAutoSizeModule, 
  ]);
// Define the User interface
interface User {
    id: string;
    date: string;
    link: string;
    sum_total_clicks: number;
}

// Sample data
const initialUsers: User[] = [
    { id: '1', date:"2025-04-07" ,link: 'Marketing',  sum_total_clicks: 1000 },
    { id: '2', date: '2025-04-10', link: 'Engineering',  sum_total_clicks: 20944 },
    { id: '3', date: '2025-04-12', link: 'Finance',  sum_total_clicks: 74634 },
    { id: '4', date: '2025-04-15', link: 'HR',  sum_total_clicks: 87464 },
    { id: '5', date: '2025-04-16', link: 'IT',  sum_total_clicks:76664 },
];

const UserData = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const gridRef = useRef<AgGridReact>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    // Column Definitions

    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const response = await axios.get("/api/click-stats/get-user-data");
            const transformedUsers = response.data.map((user: any) => ({
              id: user.id,
              date: user.date,
              link:user.link,
              sum_total_clicks:user. sum_total_clicks,
            //   organization: user.organization.name, // You can replace this with actual org name if available
            //   role: user.UserRole?.[0]?.Role?.name || "N/A",
            }));
            setLoading(false);
            setUsers(transformedUsers);
          } catch (error) {
            console.log("Error fetching users:", error);
          }
        };
      
        fetchUsers();
      }, []);
    const columnDefs: ColDef[] = [
        { field: 'date', headerName: 'Date', flex: 1, filter: true, sortable: true },
        { field: 'link', headerName: 'Link', flex: 1, filter: true, sortable: true },
        { field: 'sum_total_clicks', headerName: 'Total Clicks', flex: 1, filter: true, sortable: true },
        // {
        //     headerName: 'Actions',
        //     field: 'id',
        //     width: 150,
        //     cellRenderer: (params: any) => {
        //         return (
        //             <div className="flex space-x-2">
        //                 <button
        //                      onClick={() => router.push("/importUser")}
        //                     className=" text-blue-500 px-2 rounded  text-2xl font-bold"
        //                 >
        //                     <CiImport className='font-bold'/>
        //                 </button>
        //                 <button
        //                     onClick={() => handleDelete(params.value)}
        //                     className="text-green-500 px-2 py-1 rounded text-2xl font-bold"
        //                 >
        //                     <CiExport />
        //                 </button>
        //             </div>
        //         );
        //     }
        // },
    ];

    const defaultColDef = {
        resizable: true,
    };

      const onGridReady = (params: GridReadyEvent) => {
        // You can perform operations when the grid is ready
        params.api.sizeColumnsToFit();
      };

    const handleAddUser = (newUser: Omit<User, 'id'>) => {
        const id = (users.length + 1).toString();
        setUsers([...users, { ...newUser, id }]);
        setIsAddUserModalOpen(false);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Details</h1>
                {/* <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => setIsAddUserModalOpen(true)}
                >
                    Add User
                </button> */}
            </div>
            {loading  ? (
        <div className="flex justify-center items-center p-12">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-600">Loading data...</span>
        </div>):(
            <div className="ag-theme-alpine w-full h-[600px]">
            
                <AgGridReact
                    rowData={users}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
                    // components={{ customTooltip: CustomTooltip }} //
                    paginationAutoPageSize={false}
                    domLayout="autoHeight"
                    className="quartz"
                    onGridReady={onGridReady}
                    // onRowClicked={onRowClicked}
                    tooltipShowDelay={0}
                    tooltipHideDelay={2000}
                />
            </div>)}

            {/* {isAddUserModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddUserModalOpen(false)}
                    onAddUser={handleAddUser}
                />
            )} */}
        </div>
    );
};

export default UserData;