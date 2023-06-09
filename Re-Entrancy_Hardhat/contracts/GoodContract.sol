// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract GoodContract {
    mapping(address => uint256) balances;

    // Update the `balances` mapping to include the new ETH deposited by msg.sender
    function addBalance() public payable{
        balances[msg.sender] += msg.value;
    }

    // Send ETH worth `balances[msg.sender]` back to msg.sender
    function withdraw() public {
        // Must have >0 ETH deposited
        require(balances[msg.sender] > 0, "Not enough funds allocated for your address");

        // Attempt to transfer
        (bool sent, ) = msg.sender.call{value : balances[msg.sender]}("");
        require(sent, "ETH withdrwal failed");
        // This code becomes unreachable because the contract's balance is drained
        // before user's balance could have been set to 0

        balances[msg.sender] = 0;

    }
}