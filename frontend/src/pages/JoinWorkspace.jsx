import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function JoinWorkspace() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("joining"); 
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processWorkspaceJoin = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/workspaces/join-by-token`,
          { inviteToken: token },
          { withCredentials: true }
        );

        if (response.data.success) {
          navigate(`/workspace/${response.data.workspaceId}`);
        }
      } catch (err) {
        setStatus("error");
        if (err.response?.status === 401) {
          setMessage("Please log in or register an account first to accept this invitation.");
          setTimeout(() => navigate('/login', { state: { from: window.location.pathname } }), 3000);
        } else {
          setMessage(err.response?.data?.message || "Something went wrong while joining.");
        }
      }
    };

    if (token) {
      processWorkspaceJoin();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-4">
        {status === "joining" ? (
          <>
            <Loader2 className="animate-spin text-primary mx-auto" size={40} />
            <h2 className="text-xl font-bold text-slate-800">Processing Invitation</h2>
            <p className="text-sm text-slate-500">Adding your profile registry to the collaborative space configuration...</p>
          </>
        ) : (
          <>
            <div className="p-3 bg-red-100 text-red-600 rounded-full w-fit mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Invitation Failed</h2>
            <p className="text-sm text-red-600 font-medium">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-2 w-full px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition text-sm"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}