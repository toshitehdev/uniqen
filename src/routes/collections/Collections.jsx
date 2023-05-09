import React, { useContext, useState } from "react";
import CollectionList from "./CollectionList";

import { transferMany, updateCollections } from "../../module";
import { style } from "../../style";
import AppContext from "../../context";
import bgplc from "../../assets/bgplc.png";
import SelectedToken from "./SelectedToken";

function Collections() {
  const [renderFrom, setRenderFrom] = useState(0);
  const [selectedItemData, setSelectedItemData] = useState([]);
  const [activeButton, setActiveButton] = useState(1);
  const {
    itemData,
    collectionAmount,
    account,
    addItemData,
    addCollectionAmount,
  } = useContext(AppContext);
  const [addressTransferMany, setAddressTransferMany] = useState(null);
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
  const handleTransferMany = () => {
    if (selectedItemData.length < 1) {
      return;
    }
    if (!addressTransferMany) {
      return;
    }
    const idToSend = selectedItemData.map((item) => item.id);
    transferMany(addressTransferMany, idToSend).then(() => {
      updateCollections(account, addItemData, addCollectionAmount).then(() => {
        setSelectedItemData([]);
        toast.success("Successfully Transfered!");
      });
    });
  };
  return (
    <div>
      <h1 className="mb-8 border-b border-slate-300 pb-3 text-slate-600">
        Collections: <span className="font-bold">{collectionAmount}</span>
      </h1>
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
        <button onClick={handleTransferMany} className={style.btnUniversal}>
          Transfer
        </button>
      </div>
    </div>
  );
}

export default Collections;
