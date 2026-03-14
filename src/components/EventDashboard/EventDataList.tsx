import { useEffect, useState } from 'react';
import { SegmentData } from "./EventType";
import EventDetails from './EventDetails';
import { useAppSelector } from "@/store/hooks";
import axios from 'axios';

interface FrequencyInfo {
  hours?: number;
  throttling_type?: string;
}

interface EventMetadata {
  status: EventStatus;
  frequency?: FrequencyInfo;
}

interface SegmentTableProps {
  rowData: SegmentData[];
  preloadedStatusMap?: { [key: string]: EventStatus };
  preloadedFrequencyMap?: { [key: string]: EventMetadata };
}


interface StatusResponse {
  event_id: number;
  time_to_send_config: {
    throttling: {
      hours: number;
      throttling_type: string;
    };
    delivery_timing_type: string;
  };
  status: string;
  status_desc: EventStatus;
  status_date: string;
}

type EventStatus = 'Active' | 'Inactive' | 'Pending';

const StatusBadge = ({ status }: { status: EventStatus }) => {
  const statusClasses = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Inactive: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClasses[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const EventAccordion: React.FC<SegmentTableProps> = ({ rowData, preloadedStatusMap = {}, preloadedFrequencyMap = {} }) => {
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [statusMap, setStatusMap] = useState<{ [key: string]: EventStatus }>({});
  const [filteredData, setFilteredData] = useState<SegmentData[]>([]);
  const [frequencyDataMap, setFrequencyDataMap] = useState<{ [key: string]: any }>({});
  const selectedStatus = useAppSelector((state) => state.app.status);
  const [metadataMap, setMetadataMap] = useState<{ [key: string]: EventMetadata }>({});
  const toggleAccordion = (eventId: string) => {
    setOpenEventId(openEventId === eventId ? null : eventId);
  };

  const getEventKey = (event_id: string, list_id: number): string => {
    return `${event_id}_${list_id}`;
  };

  interface EventResult {
    status: EventStatus;
    frequencyData: any | null;
  }

  const fetchEventStatus = async (event_id: string, list_id: number): Promise<EventResult> => {
    const eventKey = getEventKey(event_id, list_id);
    if (preloadedFrequencyMap[eventKey]) {
      const metadata = preloadedFrequencyMap[eventKey];
      return {
        status: metadata.status,
        frequencyData: metadata.frequency || null
      };
    }

    // Check preloaded status map
    if (preloadedStatusMap[eventKey]) {
      return {
        status: preloadedStatusMap[eventKey],
        frequencyData: null
      };
    }

    try {
      const response = await axios.post("/api/ongage/event-status", { event_id, list_id });
      const statusResponse: StatusResponse = response.data;
      const frequencyData = statusResponse.time_to_send_config || null;

      return {
        status: statusResponse.status_desc,
        frequencyData
      };
    } catch (error: any) {
      const apiError = error?.response?.data;
      const isMissingEvent =
        apiError?.payload?.code === 412 ||
        apiError?.payload?.message?.includes("Event does not exist");

      if (isMissingEvent) {
        return {
          status: 'Pending',
          frequencyData: null
        };
      }

      console.log("Error fetching status for event:", event_id, list_id, error);
      return {
        status: 'Pending',
        frequencyData: null
      };
    }
  };

  useEffect(() => {
    const initialStatusMap: Record<string, EventStatus> = { ...preloadedStatusMap };
    const initialMetadataMap: Record<string, EventMetadata> = { ...preloadedFrequencyMap };

    // Extract status from metadata map if not in status map
    Object.keys(preloadedFrequencyMap).forEach(key => {
      if (!initialStatusMap[key]) {
        initialStatusMap[key] = preloadedFrequencyMap[key].status;
      }
    });

    setStatusMap(initialStatusMap);
    setMetadataMap(initialMetadataMap);
    const fetchMissingStatuses = async () => {
      const updatedStatusMap: Record<string, EventStatus> = { ...initialStatusMap };
      const updatedMetadataMap: Record<string, EventMetadata> = { ...initialMetadataMap };

      await Promise.all(
        rowData.map(async (event) => {
          const eventKey = getEventKey(event.event_id, event.list_id);
          if (!updatedMetadataMap[eventKey] && !updatedStatusMap[eventKey]) {
            const result = await fetchEventStatus(event.event_id, event.list_id);
            updatedStatusMap[eventKey] = result.status;
            updatedMetadataMap[eventKey] = {
              status: result.status,
              frequency: result.frequencyData
            };
          }
        })
      );

      setStatusMap(updatedStatusMap);
      setMetadataMap(updatedMetadataMap);
    };

    if (rowData.length > 0) {
      fetchMissingStatuses();
    }
  }, [rowData, preloadedStatusMap, preloadedFrequencyMap]);

  useEffect(() => {
    if (selectedStatus === "Both" || !selectedStatus) {
      setFilteredData(rowData);
    } else {
      const filtered = rowData.filter(event => {
        const eventKey = getEventKey(event.event_id, event.list_id);
        return statusMap[eventKey] === selectedStatus;
      });
      setFilteredData(filtered);
    }
  }, [rowData, statusMap, selectedStatus]);

  // Debug log to detect duplicate keys
  useEffect(() => {
    const keys = filteredData.map(event => getEventKey(event.event_id, event.list_id));
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    if (duplicates.length > 0) {
      console.warn("⚠️ Duplicate keys found in EventAccordion:", duplicates);
    }
  }, [filteredData]);

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Event Name</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredData.map((event, index) => {
          const eventKey = getEventKey(event.event_id, event.list_id);
          const uniqueKey = `${eventKey}_${index}`; // Ensures uniqueness
          const eventMetadata = metadataMap[eventKey];
          return (
            <div key={uniqueKey} className={`w-full ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleAccordion(event.event_id)}
                aria-expanded={openEventId === event.event_id}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{event.event_name}</h3>
                  </div>
                  {statusMap[eventKey] ? (
                    <StatusBadge status={statusMap[eventKey]} />
                  ) : (
                    <StatusBadge status="Pending" />
                  )}
                </div>
              </button>

              {openEventId === event.event_id && (
                <EventDetails
                  eventName={event.event_name}
                  frequencyData={eventMetadata?.frequency || null}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default EventAccordion;