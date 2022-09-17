const { assert, expect } = require("chai")
const { network, deployments, ethers } = require('hardhat')
const { developmentChains } = require("../../helper-hardhat-config")
const { storeImage, storeTokenUriMetadata } = require("../../utils/uploadToPinata")
const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

async function getRandomInt(max, followerTwitterNft) {
    let tweetAlreadyDeployed
    let tweetId
    do {
        tweetId = Math.floor(Math.random() * max)
        tweetAlreadyDeployed = await followerTwitterNft.getIfTweetIsDeployed(tweetId)
        console.log("Tweet %s -> deplyed ?: %s", tweetId, tweetAlreadyDeployed)
    } while (tweetAlreadyDeployed)
    return tweetId;
}

developmentChains.includes(network.name)
    ? describe.skip
    : describe("TwitterNft", function () {
        let deployerTwitterNft
        let contentCreatorTwitterNft
        let followerTwitterNft
        let deployer
        let contentCreator
        let follower
        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            contentCreator = accounts[1]
            follower = accounts[2]
            // Deploy all contracts tagged with phrase 'all'
            //await deployments.fixture(['all'])
            deployerTwitterNft = await ethers.getContract("TwitterNft", deployer)
            // try {
            //     let contractAddress
            //     const fullPath = path.resolve("./deployedContracts/contracts.json") // absolute path 
            //     fs.readFile(fullPath, 'utf8', function readFileCallback(err, data) {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             obj = JSON.parse(data);
            //             contractAddress = obj[network.name]
            //         }
            //     })

            // } catch {
            //     deployerTwitterNft = await twitterNftFactory.deploy()
            //     let jsonObj = {}
            //     jsonObj[`${network.name}`] = `${deployerTwitterNft.address}`
            //     fs.writeFile('./deployedContracts/contracts.json', JSON.stringify(jsonObj), function (err) {
            //         if (err) throw err;
            //         console.log('complete');
            //     });
            // }
            // deployerTwitterNft = await twitterNftFactory.deploy() //temporary deployment happens every time
            contentCreatorTwitterNft = deployerTwitterNft.connect(contentCreator)
            followerTwitterNft = deployerTwitterNft.connect(follower)
            initialBalance = ethers.utils.parseEther('0.002')
            let tx = {
                to: deployerTwitterNft.address,
                // Convert currency unit from ether to wei
                value: initialBalance
            }
            // Send a transaction
            let balanceOfContentCreator = await contentCreatorTwitterNft.getBalanceOfOwner(contentCreator.address)
            let balanceOfFollower = await followerTwitterNft.getBalanceOfOwner(follower.address)
            if (balanceOfContentCreator < initialBalance) {
                let txObj = await contentCreator.sendTransaction(tx)
                txObj.wait()
                console.log(txObj)
            }
            console.log("Balance of contentCreator %s", balanceOfContentCreator)
            if (balanceOfFollower < initialBalance) {
                txObj = await follower.sendTransaction(tx)
                txObj.wait()
                console.log(txObj)
            }
            console.log("Balance of follower %s", balanceOfFollower)
            balanceOfContentCreator = await contentCreatorTwitterNft.getBalanceOfOwner(contentCreator.address)
            balanceOfFollower = await followerTwitterNft.getBalanceOfOwner(follower.address)
            contractBalance = await followerTwitterNft.getVaultBalance()
            console.log("Balances after: %s, %s, %s", balanceOfContentCreator, balanceOfFollower, contractBalance)
        })
        describe("Integration ERC721 URI", function () {
            it("mint NFT with proper token URI", async () => {
                //Arrange
                const deployFee = await ethers.utils.parseEther('0.001')
                const tokenFeature = 2
                const transferLimit = 2
                const tweetId = await getRandomInt(3000, followerTwitterNft)

                const mintFee = await ethers.utils.parseEther('0.001')
                const imagesFilePath = "./images"
                const fullImagesPath = path.resolve(imagesFilePath) // absolute path 
                const files = fs.readdirSync(fullImagesPath)
                let metadata = {
                    image: "",
                    name: "",
                    attributes: [{
                        tweetId: "",
                        contentCreator: "",
                        timestamp: "",
                        numberOfLikes: "",
                        numberOfShares: ""
                    }]
                }

                let response = await storeImage(fullImagesPath + "/" + files[0])
                console.log("Response: %s", response)

                metadata.name = files[0].replace(".png", "")
                metadata.attributes[0].tweetId = tweetId
                metadata.attributes[0].contentCreator = `twitter user name`
                metadata.image = `ipfs://${response.IpfsHash}`
                metadata.attributes[0].timestamp = response.Timestamp
                const metadataUploadResponse = await storeTokenUriMetadata(metadata)
                console.log("Upload response: %s", metadataUploadResponse)
                const pinataTokenUri = `ipfs://${metadataUploadResponse.IpfsHash}`
                let tokenId
                //Act
                // await new Promise(async (resolve, reject) => {
                //     followerTwitterNft.once("ParamsDeployed", async () => {
                //         try {
                //             console.log("ParamsDeployed")
                //             tweetDeployed = await followerTwitterNft.getIfTweetIsDeployed(tweetId)
                //             console.log("Tweet deployed ? %s", tweetDeployed)
                //             resolve() // if try passes, resolves the promise 
                //         } catch (e) {
                //             reject(e) // if try fails, rejects the promise
                //         }
                //     })
                //     followerTwitterNft.once("Transfer", async () => {
                //         try {
                //             console.log("Transfer")
                //             let balance = followerTwitterNft.balanceOf(follower.address)
                //             console.log("Follower balance: %s", balance)
                //             resolve() // if try passes, resolves the promise 
                //         } catch (e) {
                //             reject(e) // if try fails, rejects the promise
                //         }
                //     })
                //     followerTwitterNft.once("TokenUriSet", async () => {
                //         try {
                //             console.log("TokenUriSet")
                //             let nftTokenUri = await followerTwitterNft.tokenURI(0)
                //             console.log("Token URI: %s", nftTokenUri)
                //             resolve() // if try passes, resolves the promise 
                //         } catch (e) {
                //             reject(e) // if try fails, rejects the promise
                //         }
                //     })


                //     console.log("Setting deploymentFee to %s", +deployFee)
                //     let tx = await deployerTwitterNft.setDeployFee(+deployFee)
                //     await tx.wait(1)
                //     console.log("Deploying tweet %s", tweetId)
                //     tx = await contentCreatorTwitterNft.deployNftParams(tokenFeature,
                //         transferLimit,
                //         tweetId,
                //         +mintFee)
                //     await tx.wait(1)

                //     console.log(metadata)
                //     //console.log("Tweet deployed ? %s", tweetDeployed)
                //     console.log(JSON.stringify(metadata))
                //     tweetDeployed = await followerTwitterNft.getIfTweetIsDeployed(tweetId)
                //     console.log("Tweet deployed ? %s", tweetDeployed)
                //     console.log("Minting token from tweet: %s", tweetId)
                //     tx = await followerTwitterNft.mintToken(
                //         tweetId
                //     )
                //     await tx.wait(1)
                //     let balance = followerTwitterNft.balanceOf(follower.address)
                //     console.log("Follower balance: %s", balance)
                //     tx = await followerTwitterNft.setTokenURI(0, JSON.stringify(pinataTokenUri))
                //     await tx.wait(1)
                //     let nftTokenUri = await followerTwitterNft.tokenURI(0)
                //     console.log("Token URI: %s", nftTokenUri)

                //     assert.equal(JSON.stringify(pinataTokenUri), nftTokenUri.toString())
                // })
                console.log("Setting deploymentFee to %s", +deployFee)
                let tx = await deployerTwitterNft.setDeployFee(+deployFee)
                await tx.wait(1)
                console.log("Deploying tweet %s", tweetId)
                tx = await contentCreatorTwitterNft.deployNftParams(tokenFeature,
                    transferLimit,
                    tweetId,
                    +mintFee)
                await tx.wait(1)

                console.log(metadata)
                //console.log("Tweet deployed ? %s", tweetDeployed)
                console.log(JSON.stringify(metadata))
                tweetDeployed = await followerTwitterNft.getIfTweetIsDeployed(tweetId)
                console.log("Tweet deployed ? %s", tweetDeployed)
                console.log("Minting token from tweet: %s", tweetId)
                tokenId = await followerTwitterNft.getTokenCounter()
                tx = await followerTwitterNft.mintToken(
                    tweetId
                )
                await tx.wait(1)

                console.log(tokenId)
                console.log(tokenId.toNumber())
                let balance = await followerTwitterNft.balanceOf(follower.address)
                console.log("Follower balance: %s", balance)
                console.log("Setting URI with token Id: %s and URI: %s", tokenId.toNumber(), JSON.stringify(pinataTokenUri))
                tx = await followerTwitterNft.setTokenURI(tokenId.toNumber(), JSON.stringify(pinataTokenUri))
                await tx.wait(1)
                let nftTokenUri = await followerTwitterNft.tokenURI(tokenId.toNumber())
                console.log("Token URI: %s", nftTokenUri)
                assert.equal(JSON.stringify(pinataTokenUri), nftTokenUri.toString())

            })
        })
    })