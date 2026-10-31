import React from "react";
import gsap from "gsap";

// Dark button with a light sweep on hover; the copper shine is in the CSS
// (.hero-btn-download). Renders an <a> when given an href, else a <button>.
const ShimmerBtn = ({ children, className = "", ...props }) => {
  const shimmer = (e) => {
    const overlay = document.createElement("span");
    overlay.className = "hero-shimmer";
    e.currentTarget.appendChild(overlay);
    gsap.fromTo(
      overlay,
      { left: "-100%" },
      {
        left: "200%",
        duration: 0.7,
        ease: "power1.inOut",
        onComplete: () => overlay.remove(),
      },
    );
  };

  const Tag = props.href ? "a" : "button";

  return (
    <Tag
      className={`hero-btn hero-btn-download ${className}`}
      onMouseEnter={shimmer}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default ShimmerBtn;
