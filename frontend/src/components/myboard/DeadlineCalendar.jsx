import React from "react";

export default function DeadlineCalendar({ tasks }) {
  const groupedTasks = tasks.reduce(
    (acc, task) => {
      if (!task.dueDate) return acc;

      if (!acc[task.dueDate]) {
        acc[task.dueDate] = [];
      }

      acc[task.dueDate].push(task);

      return acc;
    },
    {}
  );

  const dates = Object.keys(groupedTasks).sort();

  return (
    <div className="bg-surface rounded-xl p-5 border border-border-light shadow-sm">
      <h2 className="text-base font-semibold text-text-primary mb-4">
        Upcoming Calendar
      </h2>

      {dates.length === 0 ? (
        <div className="bg-surface rounded-xl p-10 text-center">
          <div className="text-5xl mb-3">🗓️</div>
          <h3 className="font-medium text-text-primary">No Scheduled Tasks</h3>
          <p className="text-sm text-text-secondary">Add due dates to view them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <div key={date} className="border-l-4 border-primary pl-4">
              <h3 className="font-medium text-text-primary">{date}</h3>
              <ul className="mt-2 space-y-1">
                {groupedTasks[date].map((task) => (
                  <li key={task.id} className="text-sm text-text-secondary">
                    • {task.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}