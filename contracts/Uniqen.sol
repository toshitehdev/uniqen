//SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Strings.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

pragma solidity ^0.8.8;

contract Uniqen is AxelarExecutable {
    uint256 MAX_SUPPLY = 10000;
    uint256 public mint_price = 1000000000000000;
    uint256 public price_addition = 50000000000000;
    uint8 token_decimals = 0;
    uint256 public token_counter = 0;
    string token_name = "UNIQEN";
    string token_symbol = "UQU";
    string dest_chain = "Moonbeam";
    address public the_creator;
    string public storage_address;
    IAxelarGasService public immutable gasService;
    mapping(address => uint256) balance;
    mapping(address => mapping(address => uint256)) spender_allowance;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed _to, uint256 indexed _id);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event StorageUpdate(
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

    constructor() AxelarExecutable(0xC249632c2D40b9001FE907806902f63038B737Ab) {
        the_creator = msg.sender;
        gasService = IAxelarGasService(
            0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6
        );
        genesis();
    }

    modifier onlyCreator() {
        require(
            msg.sender == the_creator,
            "Only The Creator is Able to Do That"
        );
        _;
    }

    // ERC20 standard implementation -->
    function name() public view returns (string memory) {
        return token_name;
    }

    function symbol() public view returns (string memory) {
        return token_symbol;
    }

    function totalSupply() public view returns (uint256) {
        return MAX_SUPPLY;
    }

    function decimals() public view returns (uint256) {
        return token_decimals;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balance[_owner];
    }

    function transfer(
        address _recipient,
        uint256 _amount
    ) public returns (bool) {
        transferBulk(msg.sender, _recipient, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) public returns (bool) {
        spender_allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256) {
        return spender_allowance[_owner][_spender];
    }

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    ) public returns (bool) {
        require(
            spender_allowance[_sender][msg.sender] >= _amount,
            "Not enough allowance"
        );
        transferBulk(_sender, _recipient, _amount);
        spender_allowance[_sender][msg.sender] -= _amount;
        return true;
    }

    function setStorageAddress(string memory _address) public onlyCreator {
        storage_address = _address;
    }

    //get hash to sign
    function getMessageHash(
        address _to,
        uint256 _amount,
        uint256[] memory _message
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_to, _amount, _message));
    }

    //get signed hash
    function getEthSignedMessageHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    //verify the message
    function verify(
        address _to,
        uint _amount,
        uint256[] memory _message,
        bytes memory signature
    ) private pure returns (bool) {
        bytes32 messageHash = getMessageHash(_to, _amount, _message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        //signer's hardcoded to make sure this is the only signer accepted
        return
            recoverSigner(ethSignedMessageHash, signature) ==
            0x7b96264d134AD439D0C6ea63e2A0a70d618bd3D9;
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function genesis() private {
        balance[0xFbB33Cf54fBBF700169321f24606EcAe351222A8] = 1;
        balance[0x7b96264d134AD439D0C6ea63e2A0a70d618bd3D9] = 100;
        token_counter = 101;
        emit Transfer(
            address(0),
            0xFbB33Cf54fBBF700169321f24606EcAe351222A8,
            1
        );
        emit Transfer(
            address(0),
            0x7b96264d134AD439D0C6ea63e2A0a70d618bd3D9,
            100
        );
    }

    function mintMany(
        uint256 _amount,
        uint256 _relayerGas,
        uint256[] memory _ids
    ) external payable {
        require(token_counter < MAX_SUPPLY, "Max supply reached");
        require(_relayerGas > 0, "Need to pay cross-chain relayer");
        if (token_counter + _amount > MAX_SUPPLY) {
            revert("Can't mint more than max supply");
        }
        require(msg.value >= (mint_price * _amount), "Not enough ETH");
        require(_amount > 0, "Can't mint zero amount");
        for (uint256 i = 0; i < _amount; i++) {
            uint256 modder = token_counter;
            uint256 nextId = token_counter + 1;
            //revert if there's id in mintMany located beetwen old and new price
            if (modder % 500 == 0 && i != 0) {
                revert("Hit price change point");
            }
            if (msg.value < mint_price * _amount) {
                revert("Price already up");
            }
            if (nextId % 500 == 0) {
                mint_price += price_addition;
            }
            token_counter += 1;
            emit Mint(msg.sender, token_counter);
        }
        balance[msg.sender] += _amount;
        Message memory message_payload = Message({
            sender: address(0),
            recipient: msg.sender,
            ids: _ids,
            amount: _amount,
            counter: token_counter,
            payload_type: 1
        });
        bytes memory payload = abi.encode(message_payload);
        //axelar gateway call
        gasService.payNativeGasForContractCall{value: _relayerGas}(
            address(this),
            dest_chain,
            storage_address,
            payload,
            msg.sender
        );
        gateway.callContract(dest_chain, storage_address, payload);
        emit Transfer(address(0), msg.sender, _amount);
    }

    function withdrawMintSale() public onlyCreator {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "failed");
    }

    function transferBulk(
        address _sender,
        address _recipient,
        uint256 _amount
    ) private {
        require(_amount <= balance[_sender], "Not enough balance");
        require(_sender != address(0), "ERC20: transfer from the zero address");
        balance[_sender] -= _amount;
        balance[_recipient] += _amount;
        emit Transfer(_sender, _recipient, _amount);
        //emit event for dest chain
        emit StorageUpdate(_sender, _recipient, _amount);
    }

    function transferMany(
        address _recipient,
        uint256[] memory _ids,
        uint256 _relayerGas,
        bytes memory _signature
    ) external payable {
        require(verify(msg.sender, _ids.length, _ids, _signature));
        require(_recipient != msg.sender, "Self transfer not allowed");
        require(_ids.length <= balance[msg.sender], "Not enough balance");
        balance[msg.sender] -= _ids.length;
        balance[_recipient] += _ids.length;
        Message memory message_payload = Message({
            sender: msg.sender,
            recipient: _recipient,
            ids: _ids,
            amount: _ids.length,
            counter: token_counter,
            payload_type: 2
        });
        bytes memory payload = abi.encode(message_payload);
        //axelar gateway call
        gasService.payNativeGasForContractCall{value: _relayerGas}(
            address(this),
            dest_chain,
            storage_address,
            payload,
            msg.sender
        );
        gateway.callContract(dest_chain, storage_address, payload);
        emit Transfer(msg.sender, _recipient, _ids.length);
    }
}
