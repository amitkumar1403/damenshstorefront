import React from "react";

const Logo = ({ className = '', ...props }) => {
  return (
    <img
      className="h-8 w-auto"
      src="/assets/images/logo-damensch.svg"
      alt=""
      width={26} height={32}
    />
  );
}

export default Logo
