import { Link, Outlet } from "react-router-dom";
import "./App.css";

const App = () => (
  <>
    <header className="px-4 py-4 flex items-center col-span-2 border-b border-gray-300">
      <h1 className="text-4xl font-bold">Drowsiness Detection System</h1>
    </header>
    <aside className="h-full border-r border-gray-300">
      <nav className="p-4">
        <ul className="flex flex-col gap-2">
          <Link to="/">
            <li>
              <i className="fa-solid fa-house"></i> <span>Home</span>
            </li>
          </Link>
          <Link to="/watch">
            <li>
              <i className="fa-solid fa-video"></i> <span>Watch</span>
            </li>
          </Link>
          <Link to="/analysis">
            <li>
              <i className="fa-solid fa-magnifying-glass-chart"></i> <span>Analysis</span>
            </li>
          </Link>
        </ul>
      </nav>
    </aside>
    <main className="p-4">
      <Outlet />
    </main>
  </>
);

export default App;
