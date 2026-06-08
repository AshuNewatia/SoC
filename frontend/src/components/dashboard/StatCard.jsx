export default function StatCard({ stat }) {
    return (
        <div className=" bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-slate-200 cursor-pointer ">
            <div className ="text-4xl font-bold tracking-tight">
                {stat.value}
            </div>
            <div className ="text-sm text-text-secondary mt-2">
                {stat.title}
            </div>
        </div>
    );
}