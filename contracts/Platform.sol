// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract NFT {
    string public id;
    address[] public historyOwner;
    uint256 public endTime;
    address payable public highestBider;
    uint256 public highestBid;

    constructor(string memory _id) {
        id = _id;
    }

    function addOwner(address _owner) public {
        historyOwner.push(_owner);
    }

    function getCurrentOwner() public view returns (address) {
        return historyOwner[historyOwner.length - 1];
    }

    function setEndTime(uint256 _endTime) public {
        endTime = _endTime;
    }

    function setHighestBid(address _highestBider, uint256 _highestBid) public {
        highestBider = payable(_highestBider);
        highestBid = _highestBid;
    }
}

contract Platform {
    NFT[] public collection;
    address[] public users;
    mapping(address => NFT[]) public userCollection;

    function login(address addr) public {
        bool found = false;
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == addr) {
                found = true;
                break;
            }
        }
        if (!found) {
            users.push(addr);
        }
    }

    function getUsers() public view returns (address[] memory) {
        return users;
    }

    function getCollection() public view returns (NFT[] memory) {
        return collection;
    }

    function upload(address addr, string memory nftHash) public {
        NFT nft = new NFT(nftHash);
        collection.push(nft);
        userCollection[addr].push(nft);
        nft.addOwner(addr);
    }

    function sell(
        address addr,
        NFT nft,
        uint256 endTime,
        uint256 startPrice
    ) public {
        bool userHasNFT = false;
        for (uint256 i = 0; i < userCollection[addr].length; i++) {
            if (userCollection[addr][i] == nft) {
                userHasNFT = true;
                break;
            }
        }
        require(
            userHasNFT &&
                nft.highestBid() == 0 &&
                endTime > block.timestamp &&
                startPrice > 0
        );

        nft.setEndTime(endTime);
        nft.setHighestBid(addr, startPrice);
    }

    function bid(
        address addr,
        NFT nft,
        uint256 price
    ) public {
        require(nft.endTime() > block.timestamp && price > nft.highestBid());
        nft.setHighestBid(addr, price);
    }

    function testUserCollection(address addr)
        public
        view
        returns (NFT[] memory)
    {
        return userCollection[addr];
    }

    function claim(address addr, NFT nft) public payable {
        require(addr == nft.highestBider());
        address oldOwner = nft.getCurrentOwner();

        (bool success, ) = payable(oldOwner).call{value: nft.highestBid()}("");
        require(success, "failed to send ether");

        nft.addOwner(addr);
        nft.setHighestBid(addr, 0);
        userCollection[addr].push(nft);

        // remove the nft from old owner's collection list
        uint256 originLength = userCollection[oldOwner].length;
        bool found = false;
        for (uint256 i = 0; i < originLength - 1; i++) {
            if (userCollection[oldOwner][i] == nft) {
                found = true;
            }
            if (found) {
                userCollection[oldOwner][i] = userCollection[oldOwner][i + 1];
            }
        }
        if (found || userCollection[oldOwner][originLength - 1] == nft) {
            found = true;
            userCollection[oldOwner][originLength - 1] = nft;
            userCollection[oldOwner].pop();
        }
        require(found, "Not found in current context");
    }
}
