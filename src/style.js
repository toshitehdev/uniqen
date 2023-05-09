export const style = {
  centerized: " absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  btnUniversal: "px-7 py-2 bg-teal-500 hover:bg-teal-600 text-white",
  link: "py-3 px-6 mb-5 text-sm font-semibold cursor-pointer hover:text-slate-600  rounded-xl block text-slate-400 text-left",
  btnPagination: function (activeButton, i) {
    return `border border-teal-500 hover:bg-teal-500 text-sm font-bold py-2 px-5 ml-3 ${
      activeButton == i + 1 && "bg-teal-500 text-white"
    }`;
  },
};
