import { ethers } from "ethers";
import axios from "axios";
import { contractAddress, contractABI } from "./constant";
import {
  AxelarQueryAPI,
  AxelarGMPRecoveryAPI,
  Environment,
} from "@axelar-network/axelarjs-sdk";

const sdk = new AxelarQueryAPI({
  environment: "testnet",
});
const sdkStatus = new AxelarGMPRecoveryAPI({
  environment: Environment.TESTNET,
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
  const gas = BigInt("10000000000000000") * BigInt(`${ids.length}`);
  const interChainFee = gas + BigInt(gasFee.baseFee);
  const feeFormatted = ethers.formatEther(interChainFee);
  const tx = await contractSigned.transferMany(
    recipient,
    ids,
    ethers.parseEther(feeFormatted),
    {
      value: ethers.parseEther(feeFormatted),
    }
  );
  const response = await srcProvider.getTransactionReceipt(tx.hash);
  const txStatus = await sdkStatus.queryTransactionStatus(tx.hash);
  const interChainTx = txStatus.callTx.transactionHash;
  // await response.confirmations();
  //do state update
  return interChainTx;
};

export const mint = async (amount) => {
  const signer = await srcProvider.getSigner();
  const contractSigned = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  const getPrice = await srcContract.mint_price();
  const priceToPay = ethers.toBigInt(getPrice) * ethers.toBigInt(amount);

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
  const gas = BigInt("10000000000000000") * BigInt(`${amount}`);

  const interChainFee = gas + BigInt(gasFee.baseFee);
  const feeAll = ethers.formatEther(priceToPay + interChainFee);

  const tx = await contractSigned.mintMany(
    amount,
    ethers.parseEther(ethers.formatEther(interChainFee)),
    [0],
    {
      value: ethers.parseEther(feeAll),
    }
  );
  const response = await srcProvider.getTransactionReceipt(tx.hash);
  const txStatus = await sdkStatus.queryTransactionStatus(tx.hash);
  const interChainTx = txStatus.callTx.transactionHash;
  return interChainTx;
};
