import React from "react";
import NavItems from "./NavItems";
import UserDropdown from "./UserDropdown";

const Header = () => {
  return (
    <header className="header">
      <div className="container header-wrapper">
        <a href="#hero">
          <img
            src="/logo.png"
            alt="Logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </a>
        <nav className="hidden sm:block">
          <NavItems />
        </nav>
        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
