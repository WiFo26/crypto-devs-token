// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICryptoDev {
  function tokenOfOwnerByIndex(address owner, uint index)
    external
    view
    returns (uint);

  function balanceOf(address owner) external view returns(uint balance);
}