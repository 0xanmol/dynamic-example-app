// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    constructor(address initialOwner) 
        ERC721("Dynamic Labs Demo NFT", "DYNAMIC") 
        Ownable(initialOwner) 
    {
        _nextTokenId = 1;
    }

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            "eyJuYW1lIjoiRHluYW1pYyBMYWJzIERlbW8gTkZUIiwiZGVzY3JpcHRpb24iOiJBIGRlbW8gTkZUIGZyb20gRHluYW1pYyBMYWJzIGVudGVycHJpc2UgZGVtbyIsImltYWdlIjoiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCM2FXUjBhRDBpTVRBd0lpQm9aV2xuYUhROUlqRXdNQ0lpSUhacFpYZENiM2c5SWpBZ01DQXhNREFnTVRBd0lpQjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaVBpQjhjbVZqZENCM2FXUjBhRDBpTVRBd0pTSWdhR1ZwWjJoMFBTSXhNREFsWWlCbWFXeHNQU0lqTkRRMk5VWkdJaUF2UGlCOGRHVjRkSEJoZEdnOUluUnVJSFJsZUhRdFlXNWphRzl5UFNKdGFXUmtaV1VpUEM5MGVYQmxQaUJFZVc1aGJXbGpJRXhoWW5Nak1qQkVaVzF2UEM5MFPYZ3hkSEI4TDBJOEwzbDJaeUErIn0="
        ));
    }
}