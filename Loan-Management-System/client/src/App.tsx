import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <>
      <Sidebar />
      <main className="overflow-y-auto">
        <Outlet />
      </main>
    </>
  );
}

export default App;
