import { FaUsers, FaChartBar, FaCog } from "react-icons/fa";

export default function AdminSidebar({ users, totalUsers, loading }) {
  return (
    <div className="bg-secondary/40 rounded-xl p-6 border border-border">
      <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FaUsers className="text-blue-500" />
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-lg font-semibold">{loading ? "..." : totalUsers}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <FaChartBar className="text-green-500" />
          <div>
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-lg font-semibold">{loading ? "..." : users.filter(u => u.isActive).length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <FaCog className="text-purple-500" />
          <div>
            <p className="text-sm text-muted-foreground">System Status</p>
            <p className="text-lg font-semibold text-green-500">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}