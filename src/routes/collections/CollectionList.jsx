import React, { useState } from "react";
import { Link } from "react-router-dom";

function CollectionList({
  renderFrom,
  step,
  bgplc,
  itemData,
  selectedItemData,
  setSelectedItemData,
}) {
  const handleSelection = (e, data) => {
    if (e.target.checked) {
      setSelectedItemData([...selectedItemData, data]);
    } else {
      const filteredItemData = selectedItemData.filter(
        (item) => item.id !== data.id
      );
      setSelectedItemData(filteredItemData);
    }
  };
  const collectionList = () => {
    let arr = [];
    for (let i = renderFrom; i < renderFrom + step; i++) {
      if (!itemData[i]) {
        arr.push(
          <div key={`sdf${i}`} className="invisible overflow-hidden relative">
            <input type="checkbox" className="absolute top-5 right-5" />
            <Link to="/app/attributes" className="block">
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
          <div key={itemData[i].id} className="overflow-hidden relative">
            <input
              onChange={(e) => handleSelection(e, itemData[i])}
              type="checkbox"
              className="absolute top-1 right-2 z-10"
              checked={selectedItemData.includes(itemData[i])}
            />
            <Link
              // onClick={() => addOrdinalIdView(itemData[i].id)}
              to={`/app/attributes/${itemData[i].id}`}
              className="block"
            >
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

  return <>{collectionList()}</>;
}

export default CollectionList;
