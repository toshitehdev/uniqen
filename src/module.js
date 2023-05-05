import { ethers } from "ethers";
import { contractAddress, contractABI } from "./constant";

const provider = new ethers.getDefaultProvider(
  "https://moonbase-alpha.blastapi.io/154efe59-f38d-4309-8880-a937b7e00ebf"
);
const contract = new ethers.Contract(contractAddress, contractABI, provider);

async function fetchIPFS(tokenHoldings) {
  let promises = [];
  const itemData = [];
  for (let i = 0; i < tokenHoldings.length; i++) {
    promises.push(
      `https://ipfs.io/ipfs/bafybeibqknpxt2dc2s3o5ulfsvqognymzzaot2xk6hkwonhq3qmyerljfe/${ethers.toNumber(
        tokenHoldings[i]
      )}.json`
    );
    itemData.push({ id: ethers.toNumber(tokenHoldings[i]) });
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
        // console.log(item.attributes);
        const str = item.image.slice(7);
        const img = `https://ipfs.io/ipfs/${str}`;
        itemData[index].img = img;
      });
    })
    .then(() => {
      // function compareNumbers(a, b) {
      //   return a.id - b.id;
      // }
      // itemData.sort(compareNumbers);
      return itemData;
    });
}

export const initialStateUpdate = async (
  account,
  addConnection,
  addAddress,
  addCollectionAmount,
  addItemData,
  addMintPrice,
  addLastMintedId
) => {
  try {
    let lastMintedId = undefined;
    const tokenHoldings = await contract.getAddressToIds(account);
    const itemData = await fetchIPFS(tokenHoldings);
    // const getPrice = await contract.mint_price();
    const token_counter = await contract.token_counter();
    lastMintedId = ethers.toNumber(token_counter) - 1;
    addConnection(true);
    addAddress(account);
    addCollectionAmount(tokenHoldings.length);
    addItemData(itemData);
    // const stringify = getPrice.toString();
    // const mint_price = ethers.formatEther(stringify);
    // addMintPrice(mint_price);
    // addLastMintedId(lastMintedId);
    // contract.on("Mint", async (address, id) => {
    //   lastMintedId = ethers.toNumber(id) - 1;
    //   addLastMintedId(lastMintedId);
    //   const getPrice = await contract.mint_price();
    //   const stringify = getPrice.toString();
    //   const mint_price = ethers.formatEther(stringify);
    //   addMintPrice(mint_price);
    // });
  } catch (error) {
    console.log(error);
  }
};
