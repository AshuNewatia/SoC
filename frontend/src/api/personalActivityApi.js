import axios from "axios";

const API_URL = "http://localhost:5000/api/personal-activity";

const headers = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getPersonalActivities = async () => {
  const res = await axios.get(API_URL, headers());
  return res.data;
};

export const createPersonalActivity = async (data) => {
  const res = await axios.post(API_URL, data, headers());
  return res.data;
};