import { BigNumber, Contract, ethers, utils } from 'ethers';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Web3Modal from 'web3modal';
import {
  CRYPTO_DEV_NFT_ABI,
  CRYPTO_DEV_NFT_CONTRACT_ADDRESS,
  CRYPTO_DEV_TOKEN_ABI,
  CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
} from '../constants';
import logo from '../public/0.svg';
import {
  Container,
  ImageSection,
  ImageWrapper,
  Main,
  MintSection,
} from '../styles/styles';

export default function Home() {
  const zero = BigNumber.from(0);

  const [walletConnected, setWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokensToBeClaim, setTokensToBeClaim] = useState(zero);
  const [tokensOwned, setTokensOwned] = useState(zero);
  const [totalTokensMinted, setTotalTokensMinted] = useState(zero);
  const amountOfTokens = useRef();
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (isSigner = false) => {
    try {
      const instance = await web3ModalRef.current.connect();
      const provider = new ethers.providers.Web3Provider(instance);

      const { chainId } = await provider.getNetwork();

      if (chainId !== 4) {
        window.alert('Change to Rinkeby Network');
        throw new Error('Change to Rinkeby Network');
      }

      if (isSigner) return provider.getSigner();

      return provider;
    } catch (error) {
      console.error(error);
    }
  };

  const renderButton = () => {
    if (isLoading) return <button>Loading...</button>;
    if (walletConnected && isOwner)
      return <button onClick={withdrawBalance}>Withdraw Coins</button>;
    if (tokensToBeClaim > 0) {
      return (
        <>
          <p>{tokensToBeClaim * 10} Tokens can be claim!</p>
          <button onClick={claimTokens}>Claim Tokens</button>
        </>
      );
    }
    return <button onClick={mintTokens}>Mint Tokens</button>;
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      await getProviderOrSigner();
      setWalletConnected(true);
      if (await verifyIsOwner()) setIsOwner(true);
      await getTokensOwned();
      await getTotalSuply();
      await getTokensToBeClaim();
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const getCryptoDevTokenContract = (providerOrSigner) => {
    try {
      return new Contract(
        CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_ABI,
        providerOrSigner
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getCryptoDevNFTContract = (providerOrSigner) => {
    try {
      return new Contract(
        CRYPTO_DEV_NFT_CONTRACT_ADDRESS,
        CRYPTO_DEV_NFT_ABI,
        providerOrSigner
      );
    } catch (e) {
      console.error(e);
    }
  };

  const verifyIsOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const signerAddress = await signer.getAddress();
      const cryptoDevTokenContract = getCryptoDevTokenContract(signer);
      const contractOwner = await cryptoDevTokenContract.owner();
      if (signerAddress.toLowerCase() === contractOwner.toLowerCase())
        return true;
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const mintTokens = async () => {
    try {
      const amount = amountOfTokens.current.value;
      const value = 0.001 * amount;
      const signer = await getProviderOrSigner(true);
      const cryptoDevTokenContract = getCryptoDevTokenContract(signer);
      const tx = await cryptoDevTokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
      window.alert(`Successfully minted ${amount} Crypto Dev Tokens`);
      await getTokensOwned();
      await getTotalSuply();
      amountOfTokens.current.value = '';
    } catch (error) {
      console.error(error);
    }
  };

  const claimTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const cryptoDevTokenContract = getCryptoDevTokenContract(signer);
      const tx = await cryptoDevTokenContract.claim();
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
      window.alert(`Successfully claimed ${tokensToBeClaim} Crypto Dev Tokens`);
      await getTokensOwned();
      await getTotalSuply();
      await getTokensToBeClaim();
    } catch (error) {
      console.error(error);
    }
  };

  const withdrawBalance = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const cryptoDevTokenContract = getCryptoDevTokenContract(signer);
      const tx = await cryptoDevTokenContract.withdraw();
      setIsLoading(true);
      await tx.wait();
      setIsLoading(false);
      window.alert('Funds withdraw succesfully');
    } catch (error) {
      console.error(error);
    }
  };

  const getTokensToBeClaim = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const signerAddress = await signer.getAddress();

      const cryptoDevTokenContract = getCryptoDevTokenContract(signer);
      const cryptoDevNFTContract = getCryptoDevNFTContract(signer);

      const nftsOwned = await cryptoDevNFTContract.balanceOf(signerAddress);
      if (nftsOwned > zero) {
        let nftsWithUnclaimedTokens = 0;
        for (let i = 0; i < nftsOwned; i++) {
          const _tokenId = await cryptoDevNFTContract.tokenOfOwnerByIndex(
            signerAddress,
            i
          );
          const _tokensIdClaimed = await cryptoDevTokenContract.tokenIdsClaimed(
            _tokenId
          );
          if (!_tokensIdClaimed) nftsWithUnclaimedTokens++;
        }
        setTokensToBeClaim(BigNumber.from(nftsWithUnclaimedTokens));
      }
    } catch (error) {
      console.error(error);
      return zero;
    }
  };

  const getTotalSuply = async () => {
    try {
      const provider = await getProviderOrSigner();
      const cryptoDevTokenContract = getCryptoDevTokenContract(provider);
      const _totalSupply = await cryptoDevTokenContract.totalSupply();
      setTotalTokensMinted(_totalSupply);
    } catch (error) {
      console.error(error);
      setTotalTokensMinted(zero);
    }
  };

  const getTokensOwned = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const signerAddress = await signer.getAddress();
      const cryptoDevTokenContract = getCryptoDevTokenContract(signer);
      const balanceOfTokensOwned = await cryptoDevTokenContract.balanceOf(
        signerAddress
      );
      setTokensOwned(balanceOfTokensOwned);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [walletConnected]);

  return (
    <Container>
      <Head>
        <title>Cryto Devs ICO</title>
        <meta name="description" content="ICO for crypto devs token" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Main>
        <MintSection>
          <h1>Welcome to Crypto Devs ICO!</h1>
          <p>You can claim or mint Crypto Dev tokens here</p>
          {walletConnected && (
            <>
              <p>
                You have minted {utils.formatEther(tokensOwned)} Crypto Dev
                Tokens
              </p>
              <p>
                Overall {utils.formatEther(totalTokensMinted)}/10000 have been
                minted!!!
              </p>
              <input
                type="number"
                placeholder="Amount of Tokens"
                ref={amountOfTokens}
              />
              {renderButton()}
            </>
          )}
          {!walletConnected && (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </MintSection>
        <ImageSection>
          <ImageWrapper>
            <Image alt="Crypto Devs Logo" src={logo} />
          </ImageWrapper>
        </ImageSection>
      </Main>
    </Container>
  );
}
