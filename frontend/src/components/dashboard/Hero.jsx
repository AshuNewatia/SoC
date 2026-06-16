export default function Hero({ user, summary, greeting, onCreateWorkspace }) {
    return (
        <div className=" bg-white rounded-3xl p-6 border border-slate-200 shadow-sm ">
            <div className="text-4xl font-bold tracking-tight">
                {greeting}, {user.name} 👋
            </div>
            <div className="text-text-secondary mt-2 text-lg">
                {summary}
            </div>
            <button 
            onClick={onCreateWorkspace}
            className="mt-6 px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-md hover:shadow-lg">
                Create Workspace +
            </button>
        </div>
    );
}