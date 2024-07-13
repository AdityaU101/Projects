import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navigationLinks = [
    { label: "Home", to: "/", icon: "fa-house" },
    { label: "Creation" },
    { label: "Bank", to: "/bank", icon: "fa-piggy-bank" },
    { label: "Managers", to: "/managers", icon: "fa-user-tie" },
    { label: "Branch", to: "/branch", icon: "fa-building-columns" },
    { label: "Customers", to: "/customers", icon: "fa-users" },
    { label: "Loan Actions" },
    { label: "Loan", to: "/loan", icon: "fa-money-check-dollar" },
    { label: "Payment", to: "/payment", icon: "fa-coins" },
    { label: "Approve", to: "/approve", icon: "fa-stamp" },
  ];

  return (
    <aside className="border border-[#dee2e6] bg-white pt-12">
      <nav className="font-bold md:text-lg">
        <ul className="flex flex-col">
          {navigationLinks.map(({ label, to, icon }) =>
            to ? (
              <li key={label}>
                <NavLink to={to} className={({ isActive }) => (isActive ? "nav-button active-link" : "nav-button")}>
                  {icon && <i className={`fa-solid ${icon} w-6`}></i>}
                  <span>{label}</span>
                </NavLink>
              </li>
            ) : (
              <p key={label} className="mt-8 bg-gray-200 px-8 first:mt-0">
                {label}
              </p>
            )
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
