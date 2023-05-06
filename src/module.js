import { ethers } from "ethers";
import { axios } from "axios";
import { contractAddress, contractABI } from "./constant";

const srcProvider = new ethers.BrowserProvider(window.ethereum);
const srcContract = new ethers.Contract(
  contractAddress,
  contractABI,
  srcProvider
);

const server = "http://localhost:5000";

export const updateCollections = async (
  account,
  addItemData,
  addCollectionAmount
) => {
  try {
    const itemData = await axios.post(`${server}/collections`, {
      account,
    });
    addItemData(itemData);
    addCollectionAmount(itemData.length);
  } catch (error) {
    console.log(error);
  }
};

export const setAccountState = (account, addConnection, addAddress) => {
  addConnection(true);
  addAddress(account);
};

export const getContractState = async (addMintPrice, addLastMintedId) => {
  try {
    let lastMintedId = undefined;
    const getPrice = await srcContract.mint_price();
    const token_counter = await srcContract.token_counter();
    const stringify = getPrice.toString();
    const mint_price = ethers.formatEther(stringify);
    lastMintedId = ethers.toNumber(token_counter) - 1;
    addMintPrice(mint_price);
    addLastMintedId(lastMintedId);
    srcContract.on("Mint", async (add, id) => {
      lastMintedId = ethers.toNumber(id) - 1;
      addLastMintedId(lastMintedId);
      const getPrice = await srcContract.mint_price();
      const stringify = getPrice.toString();
      const mint_price = ethers.formatEther(stringify);
      addMintPrice(mint_price);
    });
  } catch (error) {
    console.log(error);
  }
};
