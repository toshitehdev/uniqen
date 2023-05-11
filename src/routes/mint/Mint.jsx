import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { mint, updateCollections } from "../../module";
import { style } from "../../style";
import AppContext from "../../context";
import diamond from "../../assets/diamond.png";

const trimString = (string) => {
  const stringStart = string.slice(0, 5);
  const stringEnd = string.slice(61, 66);
  return stringStart + "..." + stringEnd;
};

function Mint() {
  const { mintPrice, lastMintedId } = useContext(AppContext);
  const [amount, setAmount] = useState(0);
  const [loadingMint, setLoadingMint] = useState(false);
  const [interTx, setInterTx] = useState("");

  const handleMint = async () => {
    if (amount === 0) {
      return;
    }
    setLoadingMint(true);
    try {
      const interChainTx = await mint(amount);
      setLoadingMint(false);
      setAmount(0);
      setInterTx(interChainTx);
    } catch (error) {
      setLoadingMint(false);
      setAmount(0);
    }
  };
  return (
    <div>
      <p>Mint Uniqen</p>
      <div className="text-center">
        <div className="mt-40">
          <p className="mb-5">Last Minted Id: #{lastMintedId}</p>
          <img className="w-40 mx-auto my-0 mb-5" src={diamond} alt="" />
          <p className="mb-3">Mint Price: {mintPrice}</p>
          <input
            className="w-40 border border-slate-400 py-2 px-5 mr-3"
            type="number"
            placeholder="Amount"
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleMint} className={style.btnUniversal}>
            {loadingMint ? "Minting..." : "Mint"}
          </button>
        </div>
        {interTx && (
          <Link
            className="text-blue-400"
            to={`https://testnet.axelarscan.io/gmp/${interTx}`}
            target="_blank"
          >
            Interchain Transfer TX: {trimString(interTx)}
          </Link>
        )}
      </div>
    </div>
  );
}

export default Mint;
