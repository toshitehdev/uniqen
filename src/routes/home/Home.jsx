import React from "react";
import { NavLink } from "react-router-dom";
import { style } from "../../style";
import logo from "../../assets/logo.png";

function Home() {
  return (
    <div className={`${style.centerized} top-1/3 text-center`}>
      <img className="w-auto mx-auto my-0 mb-5" src={logo} alt="" />
      <h1 className="text-center text-yellow-400 text-3xl font-bold mb-8">
        UNIQEN
      </h1>
      <h1 className="font-bold text-lg">
        Is this an NFT? is this a Token? It's BOTH.
      </h1>
      <h1 className="text-slate-500 mt-3">
        Uniqen has ERC20 interface, which makes it trade-able on DEX, while at
        the same time has unique IDs, which esentially makes it NFT.
      </h1>
      <NavLink
        to="/app"
        target="_blank"
        className="bg-teal-500 text-white px-5 py-3 mt-5 inline-block hover:bg-teal-600"
      >
        Launch App
      </NavLink>
    </div>
  );
}

export default Home;
