import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';

export default function WorkspaceMembers() {
  const { id } = useParams();
  const { socket } = useOutletContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/workspaces/${id}/members`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch members:', err);
        setLoading(false);
      });

    if (socket) {
      socket.on("member_added", (newMember) => {
        setMembers((prev) => [...prev, newMember]);
      });
    }

    return () => {
      if (socket) socket.off("member_added");
    };
  }, [id, socket]);

  const filteredMembers = members.filter((member) =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Updated role badges to match light theme
  const getRoleStyle = (role) => {
    if (role === 'Owner') return 'bg-blue-50 text-primary border border-blue-200';
    return 'bg-bg-light text-text-secondary border border-border-light';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    // Updated container styling
    <div className="w-full max-w-4xl mx-auto bg-surface border border-border-light rounded-(--radius-xl) shadow-sm overflow-hidden font-sans">
      <div className="flex items-center justify-between p-6 border-b border-border-light">
        <div className="flex items-center gap-3">
          <span className="text-primary text-xl">👥</span>
          <h2 className="text-xl font-bold text-text-primary">Workspace Members</h2>
          <span className="bg-bg-light border border-border-light text-text-secondary px-2.5 py-0.5 rounded-lg text-xs font-bold">
            {members.length}
          </span>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
          <span>👤+</span> Invite
        </button>
      </div>

      <div className="p-4 border-b border-border-light bg-surface">
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-text-secondary text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // Updated input styling
            className="w-full bg-bg-light border border-border-light rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="divide-y divide-border-light">
        {loading ? (
          <div className="p-8 text-center text-text-secondary font-medium">Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-text-secondary font-medium">No members found.</div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member._id} className="flex items-center justify-between p-4 hover:bg-bg-light transition-colors">
              <div className="flex items-center gap-4">
                {/* Changed avatar to primary color so it pops on white background */}
                <div className="w-12 h-12 rounded-full font-bold flex items-center justify-center text-lg bg-primary text-white shadow-sm">
                  {getInitials(member.name)}
                </div>
                
                <div>
                  <h4 className="font-semibold text-text-primary text-base">{member.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getRoleStyle(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors p-2 text-lg border border-transparent hover:border-border-light shadow-none hover:shadow-sm">
                  ✉️
                </button>
                {member.role !== 'Owner' && (
                  <button className="text-text-secondary hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors p-2 text-lg border border-transparent shadow-none hover:shadow-sm">
                    👤-
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}