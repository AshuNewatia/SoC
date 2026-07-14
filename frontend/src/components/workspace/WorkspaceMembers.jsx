import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { handleApiError, handleSuccess } from '../../utils/handleApiError';
import {
  MoreVertical,
  Shield,
  User,
  UserMinus,
  UserPlus,
  X,
  Search,
  Users,
  Link as LinkIcon,
  Copy,
  Check,
} from 'lucide-react';
import api from '../../services/api';

export default function WorkspaceMembers() {
  const { id } = useParams();
  const { socket } = useOutletContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);

  const [openMenu, setOpenMenu] = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchMembers();

    if (socket) {
      socket.on('members_updated', fetchMembers);
    }

    return () => {
      if (socket) {
        socket.off('members_updated',fetchMembers);
      }
    };
  }, [id, socket]);

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleInvite = async () => {
    try {
      await api.post(`/api/workspaces/${id}/members`, { email: inviteEmail });
      setInviteEmail('');
      handleSuccess("Member added successfully");
      setInviteOpen(false);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const generateInviteLink = async () => {
    setUrlLoading(true);
    try {
      const response = await api.get(`/api/workspaces/${id}/invite-token`);
      if (response.data.success) {
        const cleanUrl = `${window.location.origin}/join/workspace/${response.data.inviteToken}`;
        setInviteUrl(cleanUrl);
      }
    } catch (err) {
      console.error("Could not fetch workspace invite token:", err);
      handleApiError(err);
    } finally {
      setUrlLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromote = async (memberId) => {
    try {
      await api.post(`/api/workspaces/${id}/admins/${memberId}`);
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(res.data);
      handleSuccess("Promoted to admin successfully");
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const handleDemote = async (memberId) => {
    try {
      await api.delete(`/api/workspaces/${id}/admins/${memberId}`);
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(res.data);
      handleSuccess("Demoted to member successfully");
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/api/workspaces/${id}/members/${memberId}`);
      const res = await api.get(`/api/workspaces/${id}/members`);
      setMembers(res.data);
      handleSuccess("Member removed successfully");
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleStyle = (role) => {
    if (role === 'Owner')
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (role === 'Admin')
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm font-sans overflow-visible">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Users className="text-primary" size={22} />
          <h2 className="text-xl font-bold text-slate-800">Workspace Members</h2>
          <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg text-xs font-bold">
            {members.length}
          </span>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm"
        >
          <UserPlus size={18} />
          Invite
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>
      </div>

      {/* Member list */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No members found.</div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full font-bold flex items-center justify-center text-lg bg-primary text-white shadow-sm">
                  {getInitials(member.name)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-base">
                    {member.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getRoleStyle(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Three‑dot menu – only for non‑owners */}
                {member.role !== 'Owner' && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent immediate closing
                        setOpenMenu(openMenu === member._id ? null : member._id);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === member._id && (
                      <div
                        className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg min-w-45 z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {member.role === 'Member' && (
                          <button
                            onClick={() => handlePromote(member._id)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-slate-50 text-left text-sm"
                          >
                            <Shield size={16} className="text-blue-600" />
                            Promote to Admin
                          </button>
                        )}
                        {member.role === 'Admin' && (
                          <button
                            onClick={() => handleDemote(member._id)}
                            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-slate-50 text-left text-sm"
                          >
                            <User size={16} className="text-slate-600" />
                            Demote to Member
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(member._id)}
                          className="w-full px-4 py-3 flex items-center gap-2 hover:bg-red-50 text-red-500 text-left text-sm border-t border-slate-100"
                        >
                          <UserMinus size={16} />
                          Remove Member
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Invite Member
              </h3>
              <button
                onClick={() => {
                  setInviteOpen(false);
                  setInviteUrl(''); // Reset link view
                }}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Email Option */}
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Invite via Email Address</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setInviteOpen(false);
                  setInviteUrl('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                Invite via Email
              </button>
            </div>

            {/* 🔽 NEW SECTION: OR Divider & URL Link Generation Option */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-semibold">Or</span></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-primary" />
                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Invite via Secret URL Link</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Anyone with access to this generated address string will bypass email filters and be added to the registry instantly.
              </p>

              {!inviteUrl ? (
                <button
                  onClick={generateInviteLink}
                  disabled={urlLoading}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {urlLoading ? "Generating Token..." : "Generate Invite Link"}
                </button>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-white rounded-lg outline-none text-slate-600 select-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`p-2 rounded-lg border transition shrink-0 ${copied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}