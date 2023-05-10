import React from "react";

function SelectedToken({ selectedItemData, setSelectedItemData }) {
  const cancelSingleSelected = (id) => {
    const filteredItemData = selectedItemData.filter((item) => item.id !== id);
    setSelectedItemData(filteredItemData);
  };
  const selected = () => {
    return selectedItemData.map((item) => {
      return (
        <div className="w-8 lg:w-16 relative" key={item.id}>
          <div
            onClick={() => cancelSingleSelected(item.id)}
            className="absolute bg-rose-500 hover:bg-red-600 top-0 border border-white right-0 w-7 h-7 bg-custom-transparent rounded-full flex items-center justify-center text-white font-bold text-base cursor-pointer"
          >
            X
          </div>
          <img src={item.img} alt="" />
          <p className="text-slate-500">#{item.id}</p>
        </div>
      );
    });
  };
  return <>{selected()}</>;
}

export default SelectedToken;
