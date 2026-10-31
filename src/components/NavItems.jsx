import { useLocation, Link } from "react-router-dom";
import { NAV_ITEMS } from "../../constants";

const NavItems = () => {
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, label }) => (
        <li key={href}>
          <a
            href={href}
            className={`hover:text-red cursor-pointer transition-colors ${isActive(href) ? "text-gray-100" : ""}`}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default NavItems;
