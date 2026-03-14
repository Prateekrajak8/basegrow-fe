
"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
interface ImportExcellModelProps {
  onClose: () => void;
  organizationId:number;
  organizationName:string; 
}
const ImportExcellModel: React.FC<ImportExcellModelProps> = ({ onClose, organizationId,organizationName }) => {
    const [formData, setFormData] = useState<{
        organizationId: number;
        url: string;
      }>({
        organizationId: organizationId,
        url: "",
      });
 console.log("org id",organizationId)
 console.log("org name",organizationName)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");
  useEffect(() => {
    setFormData(prev => ({ ...prev, organizationId }));
  }, [organizationId]);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.organizationId) newErrors.organizationId = "Organization is required";
    // if (!formData.uploadedBy.trim()) newErrors.uploadedBy = "Uploader Name is required";
    if (!formData.url.trim()) newErrors.url = "Url is required";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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
      const response = await axios.post("/api/click-stats/import", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
     
        setSuccessMessage("Spread Sheet Url add successfully!.");
        // setFormData({organizationId:,url:'' });
        onClose();
      }

    } catch (e: any) {
      console.log("Error adding user:", e);
      const message = e.response?.data?.message || e.message || "Something went wrong";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-20 backdrop-blur-sm">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">Import User</h2>

        {/* {!successMessage ? ( */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {apiError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {apiError}
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="organizationId">Organization</label>
              <input
                type="text"
                id="organizationId"
                name="organizationId"
                value={organizationName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              {errors.organizationId && <p className="text-red-500 text-sm">{errors.organizationId}</p>}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="url"> spreadsheet url</label>
              <input
                type="text"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                onChange={handleChange}
                value={formData.url}
                name="url"
                id ="url"
              />
              {errors.url && <p className="text-red-500 text-sm">{errors.url}</p>}
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
      </div>
    </div>
  );
};
export default ImportExcellModel;
