import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";

export default function AppLayout({ children, title }) {
  return (
    <div className="flex h-screen bg-bg-light">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header title={title} />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}