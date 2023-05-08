import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { style } from "../../style";
import AppContext from "../../context";
import bgplc from "../../assets/bgplc.png";

function Collections() {
  const [renderFrom, setRenderFrom] = useState(0);
  const [activeButton, setActiveButton] = useState(1);
  const { itemData, collectionAmount } = useContext(AppContext);
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
  return (
    <div>
      <h1 className="mb-8 border-b border-slate-300 pb-3 text-slate-600">
        Collections: <span className="font-bold">{collectionAmount}</span>
      </h1>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-12 rounded-xl">
        {collectionList()}
      </div>
      <div className="flex  px-1 dir-rtl">
        <div className="mt-7 overflow-x-auto custom-scroll flex mb-5 dir-ltr py-2">
          {paginationButton()}
        </div>
      </div>
    </div>
  );
}

export default Collections;
