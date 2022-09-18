# OWNly smart contracts

## Table of content

- [OWNly smart contracts](#ownly-smart-contracts)
  - [Table of content](#table-of-content)
  - [Twitter NFTs](#twitter-nfts)
    - [Deployment](#deployment)
    - [Minting](#minting)
    - [Main storage](#main-storage)
    - [Vault](#vault)
  - [Contract features](#contract-features)
    - [Interfaces for frontend](#interfaces-for-frontend)
  - [ToDo](#todo)
    - [Legend](#legend)
    - [Points that need clarification/improvement](#points-that-need-clarificationimprovement)

## Twitter NFTs

### Deployment
Twitter NFT must be deployed by content creator to be able to mint. Content creator can deploy NFT template with different parameters like:
- Fee charged during minting NFT
- Transfer posibilities:
  - [x] TRANSFERABLE/NON_TRANSFERABLE 
  - [x] LIMITED TO NUMBER OF TRANSACTIONS
  - [x] FEE FOR MINTING - changeable after deployment ?
  - [x] MAX SUPPLY
  
- Deployment costs ceratin amount of fee which is set by contract owner.

### Minting
After deployment, the followers can mint creator's tweet as a NFTs. In order to mint them they must pay certain amount of money (established by content creator during deployment). The part of money go to the protocol and the rest to the content creator. The URI with URL from IPFS will be inserted with other parameters into a NFT.

### Main storage
The main storage is a tweet ID mapping to the structure of parameters. Thanks to that from each tweet ID deployed, it is possible to get:
- contentCreator
- transferable (bool)
- transfer limit
- minted token IDs
- mint fee
- max mintable amount

### Vault
Vault is a mapping of the balance for each user who wants to deposit some funds into the vault. Vault allows to pay protocol fee internally without using wallet signature every time.

## Contract features
Contract withdrawal is only possible by contract owner and it withdraws all the funds.

### Interfaces for frontend
- deployNftParams(
        bool _transferable,
        uint256 _transferLimit,
        uint256 _tweetId,
        uint256 _mintFee,
        uint256 _maxMintableAmount
    ) -> allows content creator to deploy template of his social NFT (set features of NFT and mintFee)
- mintToken(uint256 _tweetId) -> allows to mint token by the follower (possibility to set URI here)
- setTokenURI(uint256 _tokenId, string memory _tokenUri)
- getMintFeeByTweetId(uint256 _tweetId) -> allows to get information what is the fee for minting particular tweet
- getDeployFee() -> allows to get information about current deployment fee
- getTokenIdsByTweetId(uint256 tweetId) -> allows to get all token IDs associated with certain tweet (can be used for statisctics)
- receive() -> allows to get transaction in native token of the blockchain, so the button shall send transaction
- fundVaultWithEth() -> allows to fund vault with ETH
- fundVaultWithErc20(uint256 _amount, address _token) -> allows to send ERC20 tokens to the smart contract vault - all tokens sent will be swapped to the blockchain native token !!
- withdrawFundsFromVault(uint256 _amount) -> allows to withdraw funds from user's vault


- 
