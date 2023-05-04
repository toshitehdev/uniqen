import React from "react";
import { NavLink } from "react-router-dom";
import { style } from "../../style";

function Home() {
  return (
    <div className={`${style.centerized}`}>
      <h1 className="text-center text-yellow-400 text-3xl font-bold mb-8">
        UNNULLED
      </h1>
      <h1>Is this an NFT? is this a Token? It's Both</h1>
      <h1 className="text-slate-500 mt-3">
        Unnulled has ERC20 interface, which makes it trade-able on DEX, while at
        the same time has unique IDs, which esentially makes it NFT.
      </h1>
      <button className="bg-teal-500 text-white px-5 py-3 mt-5">
        Enter Dapp
      </button>
    </div>
  );
}

export default Home;
