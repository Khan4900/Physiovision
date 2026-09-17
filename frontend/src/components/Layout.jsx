import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = () => {
  // Sidebar should be open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // Handle sidebar toggle for mobile
  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Listen for window resize to update sidebar state
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        {/* Topbar with hamburger toggle */}
        <Topbar
          onSidebarToggle={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <div
          className="pt-20 min-h-screen flex-1 p-4 mt-16 md:mt-16 lg:p-8"
          style={{
            background:
              "linear-gradient(90deg, #d6e8ff 0%, #ffffff 50%, #ffd6e8 100%)",
          }}
          // style={{ background: 'linear-gradient(90deg, #ffd6e8 0%, #ffffff 50%, #d6e8ff 100%)' }}
        >
          <Outlet />
        </div>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
