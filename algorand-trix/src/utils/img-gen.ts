/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import { uploadImageToIPFS } from '@/lib/filebase';
import fs from 'fs';
import path from 'path';

interface GenerateImageResponse {
    nftIpfsUrl: string;
    img: string;
}

export const generateImage = async (prompt: string): Promise<GenerateImageResponse | null> => {
    try {
        // Read the static image from public/pfp.png
        const publicPath = path.join(process.cwd(), 'public', 'pfp.png');
        
        if (!fs.existsSync(publicPath)) {
            console.error("Error: Static image file not found at:", publicPath);
            throw new Error('Static image file not found. Please ensure pfp.png exists in the public directory.');
        }

        console.log("Reading static image from:", publicPath);
        const imageBuffer = fs.readFileSync(publicPath);

        // Upload image to IPFS
        console.log("Uploading static image to IPFS...");
        const ipfsUrl = await uploadImageToIPFS(imageBuffer);
        if (!ipfsUrl) {
            console.error("Error: Image upload to IPFS failed.");
            return null;
        }

        console.log("Image uploaded to IPFS:", ipfsUrl);

        // NFT metadata object
        const nftMetadata = {
            name: "Algorand AI Generated NFT",
            description: `An AI-generated NFT created with the prompt: "${prompt}"`,
            image: ipfsUrl,
            // attributes: [
            //     {
            //         "trait_type": "Type",
            //         "value": "AI Minted NFT"
            //     }
            // ]
        };

        // Upload NFT metadata to IPFS
        console.log("Uploading NFT metadata to IPFS...");
        const nftObjBuffer = JSON.stringify(nftMetadata);
        const nftIpfsUrl = await uploadImageToIPFS(nftObjBuffer);
        if (!nftIpfsUrl) {
            console.error("Error: NFT metadata upload to IPFS failed.");
            return null;
        }

        console.log("NFT metadata uploaded to IPFS:", nftIpfsUrl);

        return {
            nftIpfsUrl,
            img: ipfsUrl
        };

    } catch (error: any) {
        console.error("Error processing image:", error.message || error);
        throw new Error(
            error.message || 'Failed to process image. Please try again.'
        );
    }
};
