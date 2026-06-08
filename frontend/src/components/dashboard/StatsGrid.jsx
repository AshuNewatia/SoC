import StatCard from "./StatCard"

export default function StatsGrid({ workspaceStat }) {
    return (
        <div className="mt-8">
            <div className=" grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ">
                {workspaceStat.map((stat) => (
                    <StatCard key={stat.title} stat={stat} />
                ))}
            </div>
        </div>
    )
}