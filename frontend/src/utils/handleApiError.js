import { toast } from "react-hot-toast";

export const handleApiError = (err) => {
  toast.error(
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
};

export const handleSuccess = (message) => {
  toast.success(message || "Operation successful");
};
