# Uniqen

Cross-chain NFT with erc20 interface.

Uniqen has ERC20 interface on one chain, and NFT attributes on other chain. Cross-chain capability makes it possible to deploy the token on a chain that has more volume, and store the NFT attributes on a much faster and cheaper (gas wise) chain.

## Installing the project

To install the project, first clone the repo and run the following on the directory where you save the project:

```
yarn install
```

## Run the project

To start, run the following:

```
yarn dev
```

## Backend Server Repo

https://github.com/toshitehdev/uniqen-backend

## Contracts:

https://github.com/toshitehdev/uniqen/tree/main/contracts

Source Chain (Avalanche Fuji): 0x6b554477456062C280675aE58Ed8Ca42A4765E19
https://testnet.snowtrace.io/address/0x6b554477456062c280675ae58ed8ca42a4765e19#code

Destination Chain (Moonbase Alpha): 0xdff793fF6E0acB7036cAA8eFb029c82117500Ac1
https://moonbase.moonscan.io/address/0xdff793fF6E0acB7036cAA8eFb029c82117500Ac1#code
