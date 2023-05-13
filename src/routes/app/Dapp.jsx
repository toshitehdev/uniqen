import React, { useState, useEffect, useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AppContext from "../../context";
import {
  updateCollections,
  setAccountState,
  getContractState,
} from "../../module";
import { style } from "../../style";
import logo from "../../assets/logo.png";

const trimString = (string) => {
  const stringStart = string.slice(0, 5);
  const stringEnd = string.slice(38, 42);
  return stringStart + "..." + stringEnd;
};

function Dapp() {
  const [menuShown, setMenuShown] = useState(false);
  const {
    isConnected,
    addConnection,
    address,
    addAddress,
    addCollectionAmount,
    addItemData,
    addMintPrice,
    addLastMintedId,
    setLoading,
    loading,
  } = useContext(AppContext);

  async function updateData(acc) {
    updateCollections(acc, addItemData, addCollectionAmount, setLoading);
    setAccountState(acc, addConnection, addAddress);
    getContractState(addMintPrice, addLastMintedId);
  }

  useEffect(() => {
    const checkAccount = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const account = accounts[0];
      if (accounts.length > 0) {
        updateData(account);
      }
    };
    checkAccount();
  }, []);

  const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      updateData(account);
    } else {
      console.log("no ethereum provider detected");
      return;
    }
  };

  return (
    <div className="pl-72">
      <div
        className={`w-72 h-full top-1/2 -translate-y-1/2 ${
          menuShown ? "left-0" : "-left-64"
        } lg:left-0 border-r border-slate-300  py-12 px-2 text-center fixed ease-in-out duration-300 z-50`}
      >
        <img
          className="w-1/5 lg:w-1/2 mx-auto my-0 mb-4 lg:mb-7"
          src={logo}
          alt=""
        />
        <button onClick={connect} className={style.btnUniversal}>
          {isConnected ? "Account connected" : "Connect"}
        </button>
        {address && (
          <p className="text-slate-500 text-xs italic mt-3">
            {trimString(address)}
          </p>
        )}
        <div className="mt-5 lg:mt-16 px-5">
          <NavLink className={style.link} to="/app/collections">
            Collections
          </NavLink>
          <NavLink className={style.link} to="/app/mint">
            Mint
          </NavLink>
          <NavLink className={style.link} to="/app/attributes">
            Attributes
          </NavLink>
        </div>
      </div>
      <div className="p-16">{loading ? "Loading..." : <Outlet />}</div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default Dapp;
