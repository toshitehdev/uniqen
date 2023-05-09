import { ethers } from "ethers";
import axios from "axios";
import { contractAddress, contractABI } from "./constant";
import { AxelarQueryAPI } from "@axelar-network/axelarjs-sdk";

const sdk = new AxelarQueryAPI({
  environment: "testnet",
});

const srcProvider = new ethers.BrowserProvider(window.ethereum);
const srcContract = new ethers.Contract(
  contractAddress,
  contractABI,
  srcProvider
);

const server = "http://localhost:5000";
async function fetchIPFS(tokenHoldings) {
  let promises = [];
  const itemData = [];
  for (let i = 0; i < tokenHoldings.length; i++) {
    promises.push(
      `https://ipfs.io/ipfs/bafybeibqknpxt2dc2s3o5ulfsvqognymzzaot2xk6hkwonhq3qmyerljfe/${tokenHoldings[i]}.json`
    );
    itemData.push({ id: tokenHoldings[i] });
  }
  return Promise.all(
    promises.map((res) => {
      return fetch(res)
        .then((response) => {
          return response.json();
        })
        .then((data) => data);
    })
  )
    .then((value) => {
      value.map((item, index) => {
        const str = item.image.slice(7);
        const img = `https://ipfs.io/ipfs/${str}`;
        itemData[index].img = img;
      });
    })
    .then(() => {
      function compareNumbers(a, b) {
        return a.id - b.id;
      }
      itemData.sort(compareNumbers);
      return itemData;
    });
}

export const updateCollections = async (
  account,
  addItemData,
  addCollectionAmount,
  setLoading
) => {
  setLoading(true);
  try {
    const tokenHoldings = await axios.post(`${server}/collections`, {
      account,
    });
    const itemData = await fetchIPFS(tokenHoldings.data);
    addItemData(itemData);
    addCollectionAmount(itemData.length);
    setLoading(false);
  } catch (error) {
    console.log(error);
    setLoading(false);
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

export const transferMany = async (recipient, ids) => {
  const signer = await srcProvider.getSigner();
  const contractSigned = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  const gas = 10000000000;
  const gasFee = await sdk.estimateGasFee(
    "Fantom",
    "Moonbeam",
    "FTM",
    undefined,
    undefined,
    undefined,
    {
      showDetailedFees: true,
    }
  );
  console.log(gasFee);
  // const tx = await contractSigned.transferMany(recipient, ids, gas);
  // const response = await srcProvider.getTransactionReceipt(tx.hash);
  // await response.confirmations();
  //do state update
  return gasFee;
};
