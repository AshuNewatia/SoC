export const boardData = {
  project: {
    id: "project-1",
    name: "Project Nexus",
  },

  onlineUsers: [
    {
      id: "user-1",
      name: "Alex",
    },
    {
      id: "user-2",
      name: "Harsh",
    },
    {
      id: "user-3",
      name: "John",
    },
  ],

  activities: [
    {
      id: "activity-1",
      type: "create",
      user: "Alex",
      action:
        "created task 'Setup Database'",
      time: "10 min ago",
    },

    {
      id: "activity-2",
      type: "move",
      user: "Harsh",
      action:
        "moved 'Authentication System' to In Progress",
      time: "5 min ago",
    },

    {
      id: "activity-3",
      type: "github",
      user: "John",
      action:
        "linked GitHub issue #42",
      time: "2 min ago",
    },
  ],

  columns: {
    todo: {
      id: "todo",
      title: "To Do",

      tasks: [
        {
          id: "task-1",
          title: "Setup Database",
          description:
            "Create MongoDB collections and schema design",
          priority: "Medium",
          assignee: "Alex",
          dueDate: "2026-06-20",
          comments: [],
          attachments: [
            "schema-design.pdf",
            "database-notes.docx",
          ],
          githubIssue: "#21",
          status: "todo",
        },

        {
          id: "task-2",
          title: "Landing Page Design",
          description:
            "Design responsive landing page for desktop and mobile",
          priority: "High",
          assignee: "Harsh",
          dueDate: "2026-06-21",
          comments: [
            "Need mobile mockups.",
          ],
          attachments: [
            "wireframe.png",
          ],
          githubIssue: "#34",
          status: "todo",
        },
      ],
    },

    progress: {
      id: "progress",
      title: "In Progress",

      tasks: [
        {
          id: "task-3",
          title:
            "Authentication System",
          description:
            "Implement JWT authentication and protected routes",
          priority: "Critical",
          assignee: "John",
          dueDate: "2026-06-22",
          comments: [
            "JWT setup completed.",
            "Need refresh tokens.",
          ],
          attachments: [
            "auth-flow.png",
          ],
          githubIssue: "#42",
          status: "progress",
        },

        {
          id: "task-4",
          title:
            "Socket.io Integration",
          description:
            "Enable real-time synchronization between users",
          priority: "High",
          assignee: "Alex",
          dueDate: "2026-06-23",
          comments: [],
          attachments: [],
          githubIssue: "#47",
          status: "progress",
        },
      ],
    },

    review: {
      id: "review",
      title: "Review",

      tasks: [
        {
          id: "task-5",
          title: "Dashboard UI",
          description:
            "Review dashboard responsiveness and animations",
          priority: "Medium",
          assignee: "Harsh",
          dueDate: "2026-06-24",
          comments: [
            "Animations look smooth.",
          ],
          attachments: [
            "dashboard-design.fig",
          ],
          githubIssue: "#51",
          status: "review",
        },
      ],
    },

    done: {
      id: "done",
      title: "Done",

      tasks: [
        {
          id: "task-6",
          title: "Project Setup",
          description:
            "Configured React, Express, Tailwind and MongoDB",
          priority: "Low",
          assignee: "Harsh",
          dueDate: "2026-06-18",
          comments: [
            "Setup completed.",
          ],
          attachments: [],
          githubIssue: "#12",
          status: "done",
        },

        {
          id: "task-7",
          title:
            "Repository Initialization",
          description:
            "Created GitHub repository and project structure",
          priority: "Low",
          assignee: "John",
          dueDate: "2026-06-17",
          comments: [],
          attachments: [],
          githubIssue: "#9",
          status: "done",
        },
      ],
    },
  },
};