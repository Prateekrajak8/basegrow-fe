// pages/users.tsx
"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "@/components/AnalyticsDashboard/AnalyticsDashboard.css";
import { CiImport } from "react-icons/ci";
import { CiExport } from "react-icons/ci";
import { useRouter } from "next/navigation";
// import IspImporter from '@/components/IspDataAdd';
import axios from "axios";
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
import AddUserModal from '../components/AddUserModal';
import ImportExcellModel from "@/components/ImportUserModal";
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
    name: string;
    organization: string;
    role: string;
    organizationId:number;
}

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const gridRef = useRef<AgGridReact>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
    const [selectedOrgName, setSelectedOrgName] = useState<string | undefined>(undefined);
    // Column Definitions

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/users/get-users",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                const transformedUsers = response.data.map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    organization: user.organization.name, // You can replace this with actual org name if available
                    role: user.UserRole?.[0]?.Role?.name || "N/A",
                    organizationId:user.organizationId,
                }));
                setLoading(false)
                setUsers(transformedUsers);
            } catch (error) {
                console.log("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const columnDefs: ColDef[] = [
        { field: 'name', headerName: 'User Name', flex: 1, filter: true, sortable: true },
        { field: 'organization', headerName: 'Organization', flex: 1, filter: true, sortable: true },
        { field: 'role', headerName: 'Role', flex: 1, filter: true, sortable: true },
        {
            headerName: 'Actions',
            field: 'id',
            width: 150,
            cellRenderer: (params: any) => {
                const orgId = params.data?.organizationId;
                return (
                    <div className="flex space-x-2">
                        <button
                              onClick={() => {
                                setSelectedOrgId(orgId);
                                setIsImportModalOpen(true);
                                setSelectedOrgName(params.data?.organization); 
                            }}
                            className=" text-blue-500 px-2 rounded  text-2xl font-bold"
                        >
                            <CiImport className='font-bold' />
                        </button>
                        <button
                            onClick={() => handleDelete(params.value)}
                            className="text-green-500 px-2 py-1 rounded text-2xl font-bold"
                        >
                            <CiExport />
                        </button>
                    </div>
                );
            }
        },
    ];

    const defaultColDef = {
        resizable: true,
    };

    const onGridReady = (params: GridReadyEvent) => {
        // You can perform operations when the grid is ready
        params.api.sizeColumnsToFit();
    };

    const handleDelete = (userId: string) => {
        // Implement delete functionality
        setUsers(users.filter(user => user.id !== userId));
        console.log('Deleted user with ID:', userId);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => setIsAddUserModalOpen(true)}
                >
                    Add User
                </button>
            </div>
            {loading ? (
                <div className="flex justify-center items-center p-12">
                    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-lg text-gray-600">Loading data...</span>
                </div>
            ) : (
                <div className="ag-theme-alpine w-full h-[600px]">
                    <AgGridReact
                        rowData={users}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        paginationAutoPageSize={false}
                        domLayout="autoHeight"
                        className="quartz"
                        onGridReady={onGridReady}
                        tooltipShowDelay={0}
                        tooltipHideDelay={2000}
                    />
                </div>)}
            {isAddUserModalOpen && (
                <AddUserModal
                    onClose={() => setIsAddUserModalOpen(false)}
                />
            )}
            {isImportModalOpen && selectedOrgId !== undefined && selectedOrgName !== undefined && (
                <ImportExcellModel   onClose={() => setIsImportModalOpen(false)}
                organizationId={selectedOrgId} 
                organizationName={selectedOrgName} />
            )}

            {/* <IspImporter/> */}
        </div>
    );
};
export default UsersPage;