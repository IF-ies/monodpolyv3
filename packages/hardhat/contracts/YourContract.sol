// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract YourContract {
    address public owner;
    uint256 public totalPot;

    event AnswerSubmitted(address indexed player, string questionId, string answerId, bool correct, uint256 reward);

    constructor(address _owner) payable {
        owner = _owner;
        totalPot = msg.value;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function addToPot() external payable {
        totalPot += msg.value;
    }

    function submitAnswer(string calldata questionId, string calldata answerId, bool isCorrect) external {
        uint256 reward = 0;
        if (isCorrect) {
            reward = totalPot / 10;
            if (reward > 0 && address(this).balance >= reward) {
                totalPot -= reward;
                (bool sent, ) = payable(msg.sender).call{ value: reward }("");
                require(sent, "Transfer failed");
            }
        }
        emit AnswerSubmitted(msg.sender, questionId, answerId, isCorrect, reward);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        totalPot = 0;
        (bool sent, ) = payable(owner).call{ value: balance }("");
        require(sent, "Withdraw failed");
    }

    receive() external payable {
        totalPot += msg.value;
    }
}