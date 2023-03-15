// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Lottery{
    address public manager;
    address payable[3] public participants;
    uint playersAdded = 0;
    uint minValue = 0.1 ether;

    constructor(){
        manager = msg.sender; // The deploying address will be set as a manager
    }

    modifier onlyManager(){
        require(msg.sender == manager);
        _;
    }

    receive() external payable {
        require(msg.value == minValue);
        participants[playersAdded] = payable(msg.sender);
        playersAdded++;

        if(playersAdded == 3){
            selectWinner();
            // To start another round of lottery
            playersAdded = 0;
        }
    }

    function resetMinValue(uint _minValue) external onlyManager {
        minValue = _minValue;
    }

    function getBalance() public view onlyManager returns(uint) {
        return address(this).balance;
    }

    function generateRandomIndex() internal view returns(uint){
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, playersAdded))) % 3;
    }

    function selectWinner() internal {
        address payable winner = participants[generateRandomIndex()];
        winner.transfer(address(this).balance);
    }

}
