import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import CollectionList from "./CollectionList";
const trimString = (string) => {
  const stringStart = string.slice(0, 5);
  const stringEnd = string.slice(61, 66);
  return stringStart + "..." + stringEnd;
};

import { transferMany, updateCollections } from "../../module";
import { style } from "../../style";
import AppContext from "../../context";
import bgplc from "../../assets/bgplc.png";
import SelectedToken from "./SelectedToken";

function Collections() {
  const [renderFrom, setRenderFrom] = useState(0);
  const [verified, setVerified] = useState(false);
  const [signature, setSignature] = useState(null);
  const [selectedItemData, setSelectedItemData] = useState([]);
  const [activeButton, setActiveButton] = useState(1);
  const [addressTransferMany, setAddressTransferMany] = useState(null);
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [interTx, setInterTx] = useState("");
  const {
    itemData,
    collectionAmount,
    address,
    addItemData,
    addCollectionAmount,
    setLoading,
  } = useContext(AppContext);

  const step = window.innerWidth < 1030 ? 9 : 12;

  const paginationButton = () => {
    const buttonCount = Math.ceil(itemData.length / step);
    let arr = [];
    for (let i = 0; i < buttonCount; i++) {
      arr.push(
        <button
          key={itemData[i].id}
          onClick={() => {
            loadMore(i + 1);
            setActiveButton(i + 1);
          }}
          className={style.btnPagination(activeButton, i)}
        >
          {i + 1}
        </button>
      );
    }
    return arr;
  };
  const loadMore = (start) => {
    setRenderFrom(start * step - step);
  };
  const handleTransferMany = async () => {
    if (selectedItemData.length < 1 || !addressTransferMany || !signature) {
      return;
    }
    const idToSend = selectedItemData.map((item) => item.id);
    let newItemData = itemData;
    itemData.forEach(() => {
      selectedItemData.forEach((token) => {
        newItemData = newItemData.filter((i) => i.id !== token.id);
      });
    });
    setLoadingTransfer(true);
    try {
      const interChainTx = await transferMany(
        addressTransferMany,
        idToSend,
        signature
      );
      addItemData(newItemData);
      setSignature(null);
      setVerified(false);
      setAddressTransferMany(null);
      setSelectedItemData([]);
      setLoadingTransfer(false);
      setInterTx(interChainTx);
    } catch (error) {
      setLoadingTransfer(false);
      console.log(error);
    }
  };
  const verifyOwnership = async () => {
    if (selectedItemData.length < 1) {
      return;
    }
    setLoadingVerify(true);
    try {
      const signature = await axios.post("https://ercordinal.xyz/verify", {
        account: address,
        ids: selectedItemData.map((token) => token.id),
      });
      setSignature(signature.data);
      setVerified(true);
      setLoadingVerify(false);
    } catch (error) {
      console.log(error);
      setVerified(false);
      setLoadingVerify(false);
    }
  };
  return (
    <div>
      <div className="mb-8 border-b border-slate-300 pb-3 flex justify-between">
        <h1 className=" text-slate-600">
          Collections: <span className="font-bold">{collectionAmount}</span>
        </h1>
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

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-12 rounded-xl">
        <CollectionList
          renderFrom={renderFrom}
          step={step}
          bgplc={bgplc}
          itemData={itemData}
          selectedItemData={selectedItemData}
          setSelectedItemData={setSelectedItemData}
        />
      </div>
      <div className="flex  px-1 dir-rtl">
        <div className="mt-7 overflow-x-auto custom-scroll flex mb-5 dir-ltr py-2">
          {paginationButton()}
        </div>
      </div>
      <h1 className="mb-3 mt-5">Selected Items:</h1>
      <div className="grid grid-cols-4 lg:grid-cols-10 gap-2 border border-gray-700 p-4 lg:p-8 mb-2">
        <SelectedToken
          selectedItemData={selectedItemData}
          setSelectedItemData={setSelectedItemData}
        />
      </div>
      <button
        className="mb-8 text-sm bg-rose-500 text-white px-4 py-2"
        onClick={() => setSelectedItemData([])}
      >
        Cancel All
      </button>
      <div>
        <input
          type="text"
          placeholder="Transfer to"
          className="lg:mb-0 mb-3 w-full lg:w-96 px-6 py-2 mr-4 border border-teal-500"
          onChange={(e) => setAddressTransferMany(e.target.value)}
        />
        <button
          onClick={verifyOwnership}
          disabled={verified ? true : false}
          className={style.btnVerify + " mr-2 h-full"}
        >
          {loadingVerify ? "Verifying..." : "Verify"}
        </button>
        <button
          disabled={verified ? false : true}
          onClick={handleTransferMany}
          className={`${style.btnUniversal}`}
        >
          {loadingTransfer ? "Transferring..." : "Transfer"}
        </button>
      </div>

      <p className="text-sm mt-2 text-slate-500">
        {verified ? "Ownership Verified!" : "Verify the ownership first"}
      </p>
    </div>
  );
}

export default Collections;
