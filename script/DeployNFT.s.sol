// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {DynamicNFT} from "../src/DynamicNFT.sol";

contract DeployNFT is Script {
    function run() external returns (DynamicNFT) {
        vm.startBroadcast();
        
        DynamicNFT nft = new DynamicNFT(msg.sender);
        
        console.log("DynamicNFT deployed to:", address(nft));
        console.log("Owner:", msg.sender);
        
        vm.stopBroadcast();
        return nft;
    }
}