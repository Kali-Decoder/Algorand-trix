import { uploadImageToIPFS } from '@/lib/filebase';
import * as algokit from '@algorandfoundation/algokit-utils';
import type algosdk from 'algosdk';

interface MintNFDNameNFTParams {
  nfdName: string;
  years: number;
  activeAddress: string;
  transactionSigner: algosdk.TransactionSigner;
}

interface MintNFDNameNFTResponse {
  assetId: bigint;
  explorerLink: string;
  metadataUrl: string;
}

/**
 * Mints an NFD name NFT by:
 * 1. Creating NFD metadata with name and years
 * 2. Uploading metadata to IPFS
 * 3. Minting NFT on Algorand with the IPFS metadata URL
 * 
 * @param nfdName - The NFD name to mint (e.g., "myname.algo")
 * @param years - Number of years for the NFD registration
 * @param activeAddress - Algorand address to mint the NFT to
 * @param transactionSigner - Transaction signer for signing transactions
 * @returns Object containing assetId, explorerLink, and metadataUrl
 */
export async function mintNFDNameNFT({
  nfdName,
  years,
  activeAddress,
  transactionSigner,
}: MintNFDNameNFTParams): Promise<MintNFDNameNFTResponse> {
  try {
    if (!activeAddress) {
      throw new Error('No active account provided');
    }

    if (!nfdName || nfdName.trim().length === 0) {
      throw new Error('NFD name is required');
    }

    if (!years || years <= 0) {
      throw new Error('Years must be a positive number');
    }

    // Step 1: Create NFD metadata
    const nfdMetadata = {
      name: `NFD: ${nfdName}`,
      description: `Algorand NFD Name NFT for ${nfdName} registered for ${years} year${years > 1 ? 's' : ''}`,
      image: '', // Can be set later if needed
      attributes: [
        {
          trait_type: 'NFD Name',
          value: nfdName,
        },
        {
          trait_type: 'Registration Years',
          value: years.toString(),
        },
        {
          trait_type: 'Type',
          value: 'NFD Name NFT',
        },
        {
          trait_type: 'Network',
          value: 'Algorand',
        },
      ],
      properties: {
        nfdName: nfdName,
        years: years,
        mintedAt: new Date().toISOString(),
      },
    };

    // Step 2: Upload metadata to IPFS
    console.log('Uploading NFD metadata to IPFS...');
    const metadataJson = JSON.stringify(nfdMetadata, null, 2);
    const metadataUrl = await uploadImageToIPFS(metadataJson);

    if (!metadataUrl) {
      throw new Error('Failed to upload NFD metadata to IPFS');
    }

    console.log('Metadata uploaded to IPFS:', metadataUrl);

    // Step 3: Mint NFT on Algorand using the IPFS metadata URL
    console.log('Minting NFD name NFT on Algorand...');
    console.log('Active address:', activeAddress);
    console.log('Transaction signer available:', !!transactionSigner);
    
    if (!transactionSigner) {
      throw new Error('Transaction signer is not available. Please ensure your wallet is connected.');
    }

    const algorand = algokit.AlgorandClient.testNet();
    algorand.setDefaultSigner(transactionSigner);
    console.log('Algorand client initialized with signer');

    const quantity = BigInt(1); // NFT: total supply = 1
    const decimals = 0; // NFT: decimals = 0
    const assetName = `NFD-${nfdName}`;
    const unitName = nfdName.substring(0, 3).toUpperCase() || 'NFD';

    console.log('Creating asset with params:', {
      sender: activeAddress,
      assetName,
      unitName,
      url: metadataUrl,
    });

    const assetCreate = await algorand.send.assetCreate({
      sender: activeAddress,
      total: quantity,
      decimals: decimals,
      assetName: assetName,
      unitName: unitName,
      url: metadataUrl,
    });
    
    console.log('Asset creation transaction sent, waiting for wallet approval...');

    console.log('Asset created:', assetCreate);

    const assetId = BigInt(assetCreate.confirmation.assetIndex!);
    const explorerLink = `https://testnet.explorer.perawallet.app/tx/${assetCreate.txIds[0]}`;

    console.log('✅ NFD Name NFT minted successfully!');
    console.log(`Asset ID: ${assetId}`);
    console.log(`Explorer URL: ${explorerLink}`);
    console.log(`Metadata URL: ${metadataUrl}`);

    return {
      assetId,
      explorerLink,
      metadataUrl,
    };
  } catch (error: any) {
    console.error('❌ Error minting NFD name NFT:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Provide more specific error messages
    if (error.message?.includes('user rejected') || error.message?.includes('User rejected')) {
      throw new Error('Transaction was rejected. Please try again and approve the transaction in your wallet.');
    } else if (error.message?.includes('signer') || error.message?.includes('wallet')) {
      throw new Error('Wallet connection issue. Please ensure your wallet is connected and try again.');
    } else {
      throw new Error(
        error.message || 'Failed to mint NFD name NFT. Please check your wallet connection and try again.'
      );
    }
  }
}

