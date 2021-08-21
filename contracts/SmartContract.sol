// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SmartContract is ERC721, Ownable {
  using Counters for Counters.Counter;
  using Strings for uint256;
  Counters.Counter _tokenIds;
  mapping(uint256 => string) _tokenURIs;

  struct RenderToken {
    uint256 id;
    string uri;
  }

  constructor() ERC721("Smart Contract", "SC") {}

  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
    _tokenURIs[tokenId] = _tokenURI;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(_exists(tokenId));
    string memory _tokenURI = _tokenURIs[tokenId];
    return _tokenURI;
  }

  function getAllTokens() public view returns (RenderToken[] memory) {
    uint256 lastestId = _tokenIds.current();
    uint256 counter = 0;
    RenderToken[] memory res = new RenderToken[](lastestId);
    for (uint256 i = 0; i < lastestId; i++) {
      if (_exists(counter)) {
        string memory uri = tokenURI(counter);
        res[counter] = RenderToken(counter, uri);
      }
      counter++;
    }
    return res;
  }

  function mint(address recipient, string memory uri) public returns (uint256) {
    uint256 newId = _tokenIds.current();
    _mint(recipient, newId);
    _setTokenURI(newId, uri);
    _tokenIds.increment();
    return newId;
  }
}
