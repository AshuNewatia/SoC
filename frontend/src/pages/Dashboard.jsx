import { useNavigate } from 'react-router-dom';
import SideBar from "../components/sidebar/Sidebar"

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
        <SideBar />
    </div>
  );
}

export default Dashboard;