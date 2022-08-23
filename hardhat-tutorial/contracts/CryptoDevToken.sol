// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable{

  uint public constant tokenPrice = 0.001 ether;

  uint public constant tokenPerNFT = 10 * 10 ** 18;

  uint public constant maxTotalSupply = 10000 * 10 ** 18;

  ICryptoDev cryptoDevsNFT;

  mapping (uint => bool) public tokenIdsClaimed;

  constructor(address cryptoDevsNFTAddress) ERC20("Crypto Dev Token","CD"){
    cryptoDevsNFT = ICryptoDev(cryptoDevsNFTAddress);
  }

  function mint(uint amount) public payable {
    uint requiredFunds = amount * tokenPrice;
    require( requiredFunds <= msg.value, "Ether sent is incorrect");
    uint amountWithDecimals = amount * 10 **18;
    require( 
      maxTotalSupply >=  totalSupply() + amountWithDecimals,
      "Exceeds the max total suply available"
    );
    _mint(msg.sender,amountWithDecimals);
  }

  function claim() public {
    address sender = msg.sender;
    uint balance = cryptoDevsNFT.balanceOf(sender);
    require(balance > 0, "You dont own any Crypto Dev NFTs");
    uint amountToClaim;

    for (uint i; i < balance; i++){
      uint tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(sender,i);
      if (!tokenIdsClaimed[tokenId]){
        amountToClaim++;
        tokenIdsClaimed[tokenId] = true;
      }
    }

    require(amountToClaim > 0, "You have already claimed all the tokens");
    _mint(sender, amountToClaim * tokenPerNFT);
  }

  function withdraw() public onlyOwner{
    address _owner = owner();
    uint _balance = address(this).balance;
    (bool success, ) = _owner.call{value: _balance}("");
    require(success, "Failed to send Ether");
  }

  receive() external payable {}

  fallback() external payable {}
}
