import axios from "axios";

const API_URL =
  "http://localhost:5000/api/notes";

const headers = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem(
      "token"
    )}`,
  },
});

export const getMyNotes = async () => {
  const res = await axios.get(
    API_URL,
    headers()
  );

  return res.data;
};

export const createNote = async (data) => {
  const res = await axios.post(
    API_URL,
    data,
    headers()
  );

  return res.data;
};

export const deleteNote = async (id) => {
  const res = await axios.delete(
    `${API_URL}/${id}`,
    headers()
  );

  return res.data;
};

export const updateNote = async (id, data) => {
  const res = await axios.put(
    `${API_URL}/${id}`,
    data,
    headers()
  );

  return res.data;
};