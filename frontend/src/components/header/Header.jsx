import { Bell, Search, ChevronDown } from "lucide-react";

export default function Header({ title = "Overview" }) {
  return (
    <header className="h-20 bg-surface border-b border-border-light px-8 flex items-center justify-between">

      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {title}
        </h1>

        <p className="text-sm text-text-secondary">
          Welcome back, Harsh 👋
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />

          <input
            type="text"
            placeholder="Search workspace..."
            className="
              w-80
              pl-10
              pr-4
              py-3
              rounded-xl
              bg-bg-light
              border
              border-border-light
              outline-none
              focus:ring-2
              focus:ring-primary/20
              focus:border-primary
              transition
            "
          />
        </div>

        {/* Notification */}
        <button
          className="
            relative
            p-3
            rounded-xl
            hover:bg-bg-light
            transition
          "
        >
          <Bell size={20} />

          <span
            className="
              absolute
              top-2
              right-2
              w-2
              h-2
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* User Profile */}
        <button
          className="
            flex
            items-center
            gap-3
            px-3
            py-2
            rounded-xl
            hover:bg-bg-light
            transition
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-gradient-to-br
              from-primary
              to-primary-hover
              flex
              items-center
              justify-center
              text-white
              font-semibold
            "
          >
            H
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">
              Harsh
            </p>

            <p className="text-xs text-text-secondary">
              Student
            </p>
          </div>

          <ChevronDown
            size={16}
            className="text-text-secondary"
          />
        </button>

      </div>
    </header>
  );
}