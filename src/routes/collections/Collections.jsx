import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../../context";
import bgplc from "../../assets/bgplc.png";

function Collections() {
  const [renderFrom, setRenderFrom] = useState(0);
  const {
    isConnected,
    collectionAmount,
    addressTransferSingle,
    addAddressToTransfer,
    addCollectionAmount,
    itemData,
    addItemData,
    addOrdinalIdView,
    mintPrice,
    addMintPrice,
  } = useContext(AppContext);
  const step = window.innerWidth < 1030 ? 9 : 12;
  const collectionList = () => {
    let arr = [];
    for (let i = renderFrom; i < renderFrom + step; i++) {
      if (!itemData[i]) {
        arr.push(
          <div
            key={`sdf${i}`}
            className="invisible rounded-2xl overflow-hidden relative"
          >
            <input type="checkbox" className="absolute top-5 right-5" />
            <Link to="/app/ordinal" className="block">
              <div className="relative">
                <img src={bgplc} alt="" loading="lazy" />
              </div>

              <div className="bg-orange-400 px-5 py-5">
                <p className="font-bold text-slate-700">#{0}</p>
              </div>
            </Link>
          </div>
        );
      } else {
        arr.push(
          <div
            key={itemData[i].id}
            className=" rounded-2xl overflow-hidden relative"
          >
            <input
              // onChange={(e) => handleSelection(e, itemData[i])}
              type="checkbox"
              className="absolute top-1 right-2 z-10"
              // checked={selectedItemData.includes(itemData[i])}
            />
            <Link
              // onClick={() => addOrdinalIdView(itemData[i].id)}
              to="/dapp/ordinal"
              className="block"
            >
              {/* <div className="bg-[#7f84a8] w-[133px] h-[133px] 2xl:w-[148px] 2xl:h-[148px]"> */}
              <div className="relative">
                <img src={bgplc} alt="" loading="lazy" />
                <img
                  className="min-w-full absolute top-0 left-0"
                  src={itemData[i].img}
                  loading="lazy"
                />
              </div>

              <div className="bg-yellow-500 px-5 py-5">
                <p className="font-bold text-slate-700">#{itemData[i].id}</p>
              </div>
            </Link>
          </div>
        );
      }
    }
    return arr;
  };
  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-12 rounded-xl">
        {collectionList()}
      </div>
    </div>
  );
}

export default Collections;
