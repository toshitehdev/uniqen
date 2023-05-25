//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/utils/Strings.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract Storage is AxelarExecutable {
    uint256 public token_counter;
    string sourceChain;
    string sourceAddress;
    string public base_uri;
    address public contract_owner;
    address public genesis_address = 0xFbB33Cf54fBBF700169321f24606EcAe351222A8;
    IAxelarGasService public immutable gasService;
    mapping(uint256 => Tokens) public idToTokens;
    mapping(address => uint256[]) private addressToTokenIds;
    mapping(address => mapping(uint256 => TokenIndex)) private idToTokenIndex;
    event Switch(address _owner, uint256 id);
    event MintMany(
        address indexed owner,
        uint256 indexed amount,
        uint256 indexed counter
    );
    event DataUpdate(
        address indexed sender,
        address indexed recipient,
        uint256 amount
    );
    struct Message {
        address sender;
        address recipient;
        uint256[] ids;
        uint256 amount;
        uint256 counter;
        uint256 payload_type;
    }
    /**
     * @dev TokenIndex is needed to track index of ID's inserted.
     * Index started from 1,
     * because every index (even the non-existing one) is default to 0.
     * @notice this index is different from addressToTokenIds
     * which started from 0, normal array
     */
    struct TokenIndex {
        uint256 index;
    }
    struct Tokens {
        address owner;
    }

    constructor() AxelarExecutable(0x5769D84DD62a6fD969856c75c7D321b84d455929) {
        contract_owner = msg.sender;
        gasService = IAxelarGasService(
            0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6
        );
        genesis();
    }

    modifier onlyOwner() {
        require(msg.sender == contract_owner, "Only owner function");
        _;
    }

    function _baseURI() internal view returns (string memory) {
        return base_uri;
    }

    function getAddressToIds(
        address _owner
    ) public view returns (uint256[] memory) {
        return addressToTokenIds[_owner];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        string memory id = Strings.toString(tokenId);
        return string.concat(_baseURI(), id, ".json");
    }

    function getIdToIndex(
        address _owner,
        uint256 _token_id
    ) public view returns (TokenIndex memory) {
        return idToTokenIndex[_owner][_token_id];
    }

    function getTokenOwner(uint256 _id) public view returns (address) {
        return idToTokens[_id].owner;
    }

    function setBaseUri(string memory _uri) public {
        base_uri = _uri;
    }

    function _execute(
        string calldata sourceChain_,
        string calldata sourceAddress_,
        bytes calldata payload_
    ) internal override {
        sourceChain = sourceChain_;
        sourceAddress = sourceAddress_;
        Message memory value = abi.decode(payload_, (Message));
        //all other than transferBulk, goes here
        //do payload_type check to differentiate each functions
        if (value.payload_type == 1) {
            mintMany(value.recipient, value.amount);
        }
        if (value.payload_type == 2) {
            transferMany(value.sender, value.recipient, value.ids);
        }
    }

    function genesis() private {
        //genesis 0 reserved
        idToTokens[0] = Tokens({owner: genesis_address});
        addressToTokenIds[genesis_address].push(0);
        idToTokenIndex[genesis_address][0].index = 1;
        for (uint256 i = 1; i < 101; i++) {
            //.index started from 1
            idToTokens[i] = Tokens({owner: contract_owner});
            addressToTokenIds[contract_owner].push(i);
            idToTokenIndex[contract_owner][i].index = i;
        }
        token_counter = 101;
    }

    function mintMany(address _owner, uint256 _amount) private {
        for (uint256 i = 0; i < _amount; i++) {
            idToTokens[token_counter] = Tokens({owner: _owner});
            idToTokenIndex[_owner][token_counter].index =
                addressToTokenIds[_owner].length +
                1;
            addressToTokenIds[_owner].push(token_counter);
            token_counter += 1;
        }
        emit MintMany(_owner, _amount, token_counter);
    }

    ///@dev read this one carefully, easy to get lost in it ^_^
    //this one doesn't use axelar gateway, instead using own relayer
    function transferBulk(
        address _sender,
        address _recipient,
        uint256 _amount
    ) external onlyOwner {
        uint256 senderHoldingsLength = addressToTokenIds[_sender].length;
        uint256 recipientLength = addressToTokenIds[_recipient].length;
        if (recipientLength < 1) {
            for (uint256 i = 1; i < _amount + 1; i++) {
                uint256 senderLastTokenIndex = senderHoldingsLength - i;
                uint256 senderLastTokenId = addressToTokenIds[_sender][
                    senderLastTokenIndex
                ];
                idToTokenIndex[_recipient][senderLastTokenId].index = i;
                addressToTokenIds[_recipient].push(senderLastTokenId);
                //change the tokens owner
                idToTokens[senderLastTokenId].owner = _recipient;
                //take out ids, no need to know the ids
                addressToTokenIds[_sender].pop();
                delete idToTokenIndex[_sender][senderLastTokenId];
            }

            emit DataUpdate(_sender, _recipient, _amount);
        } else {
            for (uint256 i = 1; i < _amount + 1; i++) {
                uint256 senderLastTokenIndex = senderHoldingsLength - i;
                uint256 senderLastTokenId = addressToTokenIds[_sender][
                    senderLastTokenIndex
                ];
                uint256 idToMove = addressToTokenIds[_recipient][i - 1];
                //add ids, this needs ids instead
                idToTokenIndex[_recipient][idToMove].index =
                    recipientLength +
                    i;
                addressToTokenIds[_recipient].push(idToMove);
                idToTokenIndex[_recipient][senderLastTokenId].index = i;
                addressToTokenIds[_recipient][i - 1] = senderLastTokenId;
                //change the tokens owner
                idToTokens[senderLastTokenId].owner = _recipient;
                //take out ids, no need to know the ids
                addressToTokenIds[_sender].pop();
                delete idToTokenIndex[_sender][senderLastTokenId];
            }
            emit DataUpdate(_sender, _recipient, _amount);
        }
    }

    function transferMany(
        address _sender,
        address _recipient,
        uint256[] memory _ids
    ) private {
        for (uint256 i = 0; i < _ids.length; i++) {
            transferSingle(_sender, _recipient, _ids[i]);
        }
        emit DataUpdate(_sender, _recipient, _ids.length);
    }

    function transferSingle(
        address _sender,
        address _recipient,
        uint256 _id
    ) private {
        uint256 senderLastIndex = addressToTokenIds[_sender].length - 1;
        uint256 senderLastId = addressToTokenIds[_sender][senderLastIndex];
        //_id won't be duplicate
        //once sent, ownership changed
        idToTokenIndex[_recipient][_id].index =
            addressToTokenIds[_recipient].length +
            1;
        addressToTokenIds[_recipient].push(_id);
        //change the owner
        idToTokens[_id].owner = _recipient;
        //find the index position of _id
        uint256 indexToRemove = idToTokenIndex[_sender][_id].index;
        //move last id on the arrays
        uint256 idToMove = addressToTokenIds[_sender][senderLastIndex];
        addressToTokenIds[_sender][indexToRemove - 1] = idToMove;
        //update idTotokenIndex for sender
        idToTokenIndex[_sender][senderLastId].index = indexToRemove;
        delete idToTokenIndex[_sender][_id];
        addressToTokenIds[_sender].pop();
    }
}
