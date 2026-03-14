"use client";
import axios from "axios";
import React, { useState } from "react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon,CheckIcon  } from "@heroicons/react/20/solid";

interface AddUserModalProps {
  onClose: () => void;
}
const scopeOptions = [
  { label: "Select Scope", value: "" },
  { label: "Internal", value: "internal" },
  { label: "External", value: "external" },
];

const AddUserModal = ({ onClose }: AddUserModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationName: "",
    scope: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [setupLink, setSetupLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState("");
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.organizationName.trim()) newErrors.organizationName = "Organization is required";
    if (!formData.scope.trim()) newErrors.scope = "Scope is required";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const handleScopeChange = (value: string) => {
    setFormData({ ...formData, scope: value });
    setErrors({ ...errors, scope: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setApiError(""); // clear old errors
      setSuccessMessage(""); // clear old success
      const response = await axios.post("/api/users/onborad", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        const generatedLink = `http://localhost:3000${response.data?.setupLink}` || `https://yourapp.com/set-password/${response.data.userId}`;
        // const generatedLink = `https://admin.basegrow.com${response.data?.setupLink}` || `https://yourapp.com/set-password/${response.data.userId}`;
        setSetupLink(generatedLink);
        setSuccessMessage("User onboarded successfully! Share the link below to set their password.");
        setFormData({ name: "", email: "", organizationName: "", scope: "" });
      }

    } catch (e: any) {
      console.log("Error adding user:", e);
      const message = e.response?.data?.message || e.message || "Something went wrong";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (setupLink) {
      navigator.clipboard.writeText(setupLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // revert after 2 seconds
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-20 backdrop-blur-sm">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

        {!successMessage ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {apiError}
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="name">Name</label>
              <input
                type="name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="organizationName">Organization</label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                onChange={handleChange}
                value={formData.organizationName}
                name="organizationName"
              />
              {errors.organizationName && <p className="text-red-500 text-sm">{errors.organizationName}</p>}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="scope">Scope</label>
              {/* <select
                name="scope"
                id="scope"
                value={formData.scope}
                onChange={handleChange} // now works correctly
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select Scope</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select> */}
              <div className="relative mt-2">
                <Listbox value={formData.scope} onChange={handleScopeChange}>
                  <div className="relative w-full">
                    <Listbox.Button className="w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
                      <span className="block truncate">
                        {scopeOptions.find((option) => option.value === formData.scope)?.label || "Select Scope"}
                      </span>
                      <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
                      </span>
                    </Listbox.Button>

                    <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-20">
                      {scopeOptions.map((option) => (
                        <Listbox.Option
                          key={option.value}
                          value={option.value}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? "bg-blue-100 text-blue-900" : "text-gray-700"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                {option.label}
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
                </div>
              {errors.scope && <p className="text-red-500 text-sm">{errors.scope}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded space-y-3">
            <p>{successMessage}</p>
            {setupLink && (
              <div className="flex items-center justify-between gap-2 bg-white border p-2 rounded">
                <input
                  type="text"
                  value={setupLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="text-blue-500 text-sm hover:underline"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddUserModal;
