import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { api } from "./api";
import type { NameHistoryData } from "../../shared_types";
import NameHistory from "./NameHistory";

// Shared across all component instances to prevent duplicate requests from StrictMode
const pending_requests = new Set<string>();

function NamePage() {
  const { name } = useParams<{ name: string }>();
  const [name_history, set_name_history] = useState<NameHistoryData | null>(
    null,
  );
  const request_id_ref = useRef(0);

  useEffect(() => {
    if (!name || !/^[a-zA-Z]+$/.test(name)) {
      return;
    }

    // Skip if there's already a pending request for this name
    // (This prevents duplicate requests from StrictMode double-invoke)
    if (pending_requests.has(name)) {
      return;
    }

    // Mark this name as pending
    pending_requests.add(name);
    const current_request_id = ++request_id_ref.current;

    const fetch_name_history = async () => {
      try {
        const result = await api.get_name_history.query({ name });
        // Only update state if this is still the current request
        if (current_request_id === request_id_ref.current) {
          if ("Ok" in result) {
            set_name_history(result.Ok);
          } else {
            console.error("Error fetching name history:", result.Err);
          }
        }
      } catch (error) {
        // Only log error if this is still the current request
        if (current_request_id === request_id_ref.current) {
          console.error("Failed to fetch name history:", error);
        }
      } finally {
        // Remove from pending set
        pending_requests.delete(name);
      }
    };

    fetch_name_history();

    // Note: We don't clear pending_requests in cleanup because:
    // 1. The finally block will clear it when the request completes
    // 2. If we clear it in cleanup, StrictMode's second run will see it as available again
    // 3. This ensures only one request is in flight at a time
  }, [name]);

  if (!name || !/^[a-zA-Z]+$/.test(name)) {
    return null;
  }

  return (
    <div>
      {name_history !== null ? (
        <NameHistory name_history={name_history} />
      ) : (
        "Loading..."
      )}
    </div>
  );
}

export default NamePage;
