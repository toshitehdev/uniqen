import { createContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [collectionAmount, setCollectionAmount] = useState(0);
  const [tokenIds, setTokenIds] = useState([]);
  const [addressTransferSingle, setAddressTransferSingle] = useState("");
  const [dataImg, setDataImg] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [ordinalIdView, setOrdinalIdView] = useState(0);
  const [mintPrice, setMintPrice] = useState(0);
  const [lastMintedId, setLastMintedId] = useState(0);
  const [loading, setLoading] = useState(false);

  const addConnection = (param) => {
    setIsConnected(param);
  };
  const addAddress = (param) => {
    setAddress(param);
  };
  const addCollectionAmount = (param) => {
    setCollectionAmount(param);
  };
  const addTokenIds = (param) => {
    setTokenIds(param);
  };
  const addAddressToTransfer = (param) => {
    setAddressTransferSingle(param);
  };
  const addDataImg = (param) => {
    setDataImg(param);
  };
  const addItemData = (param) => {
    setItemData(param);
  };
  const addOrdinalIdView = (param) => {
    setOrdinalIdView(param);
  };
  const addMintPrice = (param) => {
    setMintPrice(param);
  };
  const addLastMintedId = (param) => {
    setLastMintedId(param);
  };

  const param = {
    isConnected,
    address,
    addConnection,
    addAddress,
    collectionAmount,
    tokenIds,
    addressTransferSingle,
    addCollectionAmount,
    addTokenIds,
    addAddressToTransfer,
    dataImg,
    addDataImg,
    itemData,
    addItemData,
    ordinalIdView,
    addOrdinalIdView,
    addMintPrice,
    mintPrice,
    lastMintedId,
    addLastMintedId,
    loading,
    setLoading,
  };

  return <AppContext.Provider value={param}>{children}</AppContext.Provider>;
}

export default AppContext;
