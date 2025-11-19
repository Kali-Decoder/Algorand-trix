/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, KeyboardEvent } from "react";
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk from "algosdk";
import NFDRegistryAbi from "@/utils/NFD Registry arc32.json";
type MintResult = {
  txId: string;
  confirmedRound: number | null;
  returnedAppId?: bigint | null; // if contract returns the new NFD app id (may be available in logs/return)
};

import {
  accountabstraction,
  oracle,
  crosschain,
  indexer,
  walletinfra,
  rpcs,
  defi,
} from "./HardCodedReplys";
import {
  PiggyBank,
  LineChart,
  Send,
  ImagePlay,
  Loader,
  BrainCircuit,
  RefreshCw,
  Sparkles,
  User,
  Code2Icon,
  ArrowRightLeft,
  Blocks,
  ChartNoAxesCombined,
  HandCoins,
  ArrowUpDown,
  ArrowBigUp,
  Network,
  Tag,
} from "lucide-react";

import ResponseDisplay from "./ResponseDisplay";

import { generateImage } from "@/utils/img-gen";
import { formatNftPrompt } from "@/utils/prompt";

import Image from "next/image";
import { Connect } from "./AlgorandWallet";
import { useWallet } from "@txnlab/use-wallet-react";


type TabType =
  | "general"
  | "swap"
  | "lend"
  | "trade"
  | "swap-tokens"
  | "mint"
  | "mint-token"
  | "transfer-token"
  | "transfer-native-token"
  | "get-quotes"
  | "cross-chain"
  | "generate"
  | "algorand-helper"
  | "ecosystem-project"
  | "nfd-names";

export default function AIAgent() {


  const {
    algodClient,
    activeAddress,
    transactionSigner
  } = useWallet();
  
  const mintNfdName = async (
    nfdName: string,
    reservedFor: string,           // address to own the NFD after mint
    linkOnMint: boolean,           // should the registry auto-link the address on mint
    priceMicroAlgos: bigint,       // price for the name (microAlgos)
    carryMicroAlgos: bigint,       // extra MBR / carry cost (microAlgos)
    registryAppId: number,         // registry application id
    registryAddress: string        // registry account address (to receive payment)
  ) => {
    try {
      if (!activeAddress) throw new Error("[App] No active account");
      
      const algorand = algokit.AlgorandClient.testNet();
      algorand.setDefaultSigner(transactionSigner);

      const registryAbi: any = NFDRegistryAbi;
      if (!registryAbi) {
        throw new Error("Registry ABI not found. Please ensure NFD Registry arc32.json is properly imported.");
      }
  
      // find mintNfd method object
      const mintMethod = registryAbi.methods?.find((m: any) => m.name === "mintNfd");
      if (!mintMethod) throw new Error("mintNfd method not found in registry ABI.");
  
      // Prepare suggested params
      // const algodClient = algorand.algodClient; // algokit client exposes raw algod — adapt if different
      // const suggestedParams = await algodClient.getTransactionParams().do();
  
      // // 1) Build Payment txn (buyer -> registry address)
      // const totalPayment = BigInt(priceMicroAlgos) + BigInt(carryMicroAlgos); // microAlgos
      // const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      //   from: activeAddress,
      //   to: registryAddress,
      //   amount: Number(totalPayment), // algosdk expects number; ensure it fits JS number. For >53-bit use raw signing.
      //   suggestedParams,
      // });
  
      // // 2) Encode ABI method call
      // // algosdk's encodeMethodCall requires a Method object — easiest is to construct the object manually.
      // // We'll convert the ABI method to algosdk Method instance:
      // const method = new algosdk.Method({
      //   name: mintMethod.name,
      //   args: mintMethod.args.map((a: any) => ({ name: a.name, type: a.type })),
      //   returns: mintMethod.returns ? { type: mintMethod.returns.type } : undefined,
      // });
  
      // // The mintNfd ABI expects the `purchaseTxn` as type "pay" (a payment txn object in the group)
      // // For ABI encoding we pass a placeholder for purchaseTxn: with algosdk.encodeMethodCall the ABI encoder
      // // will expect the group index to contain the payment transaction at the right position automatically.
      // // algosdk.encodeMethodCall supports 'txns' as part of the encoded params — we will provide purchase txn as
      // // a special argument using the `txn` ABI type. The helper below uses algosdk.encodeUnsignedTransaction for that.
      // //
      // // Build the encoded call via algosdk:
      // const abiEncode = algosdk.encodeMethodCall({
      //   method,
      //   // method args must match ABI order: [purchaseTxn(pay), nfdName(string), reservedFor(address), linkOnMint(bool)]
      //   methodArgs: [
      //     // For a 'pay' arg, we must pass the actual payment transaction as a SignedTxn? In practice with algosdk,
      //     // encodeMethodCall supports passing a Transaction object to be placed into the group as a "txn" arg.
      //     // We'll pass the paymentTxn object; algosdk will return `appArgs`, `accounts`, `foreignApps`, `foreignAssets`, and `txns` placeholders.
      //     paymentTxn,
      //     nfdName,
      //     reservedFor,
      //     linkOnMint,
      //   ],
      //   sender: activeAddress,
      // });
  
      // // 3) Create the application call transaction (NoOp) with the encoded ABI call data
      // const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      //   from: activeAddress,
      //   appIndex: registryAppId,
      //   appArgs: abiEncode.appArgs,          // raw method selector + args
      //   accounts: abiEncode.accounts || [],
      //   foreignApps: abiEncode.foreignApps || [],
      //   foreignAssets: abiEncode.foreignAssets || [],
      //   suggestedParams,
      // });
  
      // // 4) Group them: IMPORTANT: payment must come BEFORE the appCall (index order)
      // const txns = [paymentTxn, appCallTxn];
      // const groupId = algosdk.computeGroupID(txns as unknown as algosdk.Transaction[]); // compute group id
      // for (let t of txns) (t as any).group = groupId;
  
      // // 5) Sign transactions (use algokit transactionSigner like in your other helpers)
      // // If your transactionSigner is set as the default signer in algorand client,
      // // you can use algorand.signTransaction? But to match your other functions, we sign locally:
      // const signedPayment = await transactionSigner(activeAddress, paymentTxn.toByte()); // adapt to your signer API
      // const signedAppCall = await transactionSigner(activeAddress, appCallTxn.toByte()); // adapt
  
      // // If transactionSigner returns raw signed tx bytes, use them directly; else adjust as needed.
      // const signedTxns = [signedPayment, signedAppCall];
  
      // // 6) Submit
      // const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
  
      // // 7) Wait for confirmation
      // const confirmed = await algorand.waitForConfirmation(txId, 4); // helper on algokit client — adapt as needed
  
      // // Optionally parse returned value (if contract returns the new NFD app id)
      // // The contract returns a uint64 on success — you may find it in the application call return or logs.
      // // Parsing return value is a bit involved — for now we'll return txId + confirmed round.
      // return {
      //   txId,
      //   confirmedRound: confirmed?.confirmedRound ?? null,
      //   returnedAppId: null,
      // };

    } catch (err) {
      console.error("❌ Error minting NFD:", err);
      throw err;
    }
  };


  const createFungibleTokens = async (
    unitName: string,
    assetName: string,
    totalSupply: bigint,
    decimals: number
  ) => {
    try {
      if (!activeAddress) {
        throw new Error("[App] No active account");
      }

      const algorand = algokit.AlgorandClient.testNet();
      algorand.setDefaultSigner(transactionSigner);
      console.log("Connecting to Algorand Testnet...");

      // Create fungible token (FT)
      const assetCreate = await algorand.send.assetCreate({
        sender: activeAddress,
        total: totalSupply, // e.g. 100_000_000n
        decimals,           // e.g. 6 for micro-units
        assetName,          // e.g. "Royalty Points"
        unitName,           // e.g. "RP"
        url: "https://your-metadata-or-website.com", // optional metadata URL
      });

      console.log(assetCreate);

      const assetId = BigInt(assetCreate.confirmation.assetIndex!);

      const explorerLink = `https://testnet.explorer.perawallet.app/tx/${assetCreate.txIds[0]}`;
      console.log("✅ Fungible token deployed!");
      console.log(`Explorer URL: ${explorerLink}`);

      return {
        assetId,
        explorerLink,
      };
    } catch (err) {
      console.error("❌ Error deploying fungible token:", err);
      throw err;
    }
  };





  const algoDirectPayment = async (receiver: string, amount: number) => {
    try {
      if (!activeAddress) {
        throw new Error("[App] No active account");
      }

      const algorand = algokit.AlgorandClient.testNet();
      algorand.setDefaultSigner(transactionSigner);
      console.log("Connecting to Algorand Testnet...");

      // Fetch wallet balance
      const algobalance = await algorand.account.getInformation(activeAddress);
      const balanceInAlgos = algobalance.balance.algos;
      console.log("✅ Account balance:", balanceInAlgos);

      // Let AI tell user their balance
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `💰 You currently have **${balanceInAlgos} ALGO** in your wallet.`,
        },
      ]);

      const algoamount = BigInt(amount);

      // Send payment
      const tx = await algorand.send.payment({
        sender: activeAddress,
        receiver,
        amount: algokit.algos(algoamount),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Payment of **${amount} ALGO** sent successfully!\n\n- [View Transaction on Explorer](https://testnet.explorer.perawallet.app/tx/${tx.txId})`,
        },
      ]);

      console.log("✅ Payment sent!");
    } catch (err) {
      console.error("❌ Error sending payment:", err);
      setError("Something went wrong while sending your ALGO. Please try again.");
      throw err;
    }
  };


  const algoTokensPayment = async (receiver: string, assetId: bigint, _amount: number) => {
    try {
      if (!activeAddress) {
        throw new Error("[App] No active account");
      }

      const algorand = algokit.AlgorandClient.testNet();
      algorand.setDefaultSigner(transactionSigner);
      console.log("Connecting to Algorand Testnet...");

      const amount = BigInt(_amount * (10 ** 6));

      // 🔹 Fetch token balance
      const accountInfo = await algorand.asset.getAccountInformation(activeAddress, assetId);
      const balance = accountInfo?.balance ?? BigInt(0);

      // Send AI message about current balance
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `💰 You currently have **${Number(balance) / (10 ** 6)} units** of token (ID: ${assetId}) in your wallet.`,
        },
      ]);

      if (balance < amount) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "❌ Insufficient balance to complete this transfer.",
          },
        ]);
        return;
      }

      // 🔹 Transfer token
      const tx = await algorand.send.assetTransfer({
        sender: activeAddress,
        assetId: assetId,
        receiver: receiver,
        amount: amount,
      });

      // Success message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Token transfer successful!\n\n- [View Transaction on Explorer](https://testnet.explorer.perawallet.app/tx/${tx.txId})`,
        },
      ]);


    } catch (err) {
      console.error("❌ Error sending token:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong while sending your token. Please try again." },
      ]);
      throw err;
    }
  };

  const createNFT = async (url: string, name: string) => {
    try {

      if (!activeAddress) {
        throw new Error("[App] No active account");
      }
      const algorand = algokit.AlgorandClient.testNet();
      algorand.setDefaultSigner(transactionSigner)
      console.log("Connecting to Algorand Testnet...");

      // For fungible toke
      // total=100_000_000_000,
      // decimals=2,
      // unit_name="RP",
      // asset_name="Royalty Points",

      // Example values for asset creation; replace with your own logic/UI as needed

      // For NFTs
      // We need to upload metadata JSON to IPFS and use the resulting URL here

      const quantity = BigInt(1); // total supply as bigint
      const dec = 0; // decimals
      const assetname = name; // asset name

      const assetCreate = await algorand.send.assetCreate({
        sender: activeAddress,
        total: quantity,
        decimals: dec,
        assetName: assetname,
        unitName: assetname.substring(0, 3),
        url: url,
      });

      console.log(assetCreate)

      const assetId = BigInt(assetCreate.confirmation.assetIndex!)

      const explorerLink = `https://testnet.explorer.perawallet.app/tx/${assetCreate.txIds[0]}`;
      console.log("✅ Token deployed!");
      console.log(`Explorer URL: ${explorerLink}`);

      return explorerLink;
    } catch (err) {
      console.error("❌ Error deploying token:", err);
      throw err;
    }
  };


  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string | React.JSX.Element | object;
    }>
  >([]);

  const [userInput, setUserInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [error, setError] = useState("");
  // NEW: State to hold the NFT data waiting for confirmation
  const [pendingNFT, setPendingNFT] = useState<{ nftIpfsUrl: string } | null>(
    null
  );

  const [pendingFT, setPendingFT] = useState<{
    unitName?: string
    assetName?: string
    totalSupply?: bigint
    decimals?: number
  } | null>(null);

  const [pendingNativeTransfer, setNativePendingTransfer] = useState<{
    receiver: string;
    amount: string;
  } | null>(null);

  async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const [generateCommand, setGenerateCommand] = useState(false);

  const [crossChainState, setCrossChainState] = useState<CrossChainState>({
    action: null,
    srcChainId: "",
    destChainId: "",
    amount: "",
    receivingAccountAddress: "",
  });

  const [pendingTokenTransfer, setPendingTokenTransfer] = useState<{
    step: "receiver" | "assetId" | "amount" | "confirm";
    receiver?: string;
    assetId?: string;
    amount?: string;
  } | null>(null);

  const [pendingNFDLookup, setPendingNFDLookup] = useState<{
    step: "address" | "view" | "confirm" | "name" | "reservedFor" | "linkOnMint";
    address?: string;
    view?: string;
    operation?: "getAllNfds" | "reverseLookup" | "resolveName" | "mintNfd";
    nfdName?: string;
    reservedFor?: string;
    linkOnMint?: boolean;
  } | null>(null);

  const [swapState, setSwapState] = useState<SwapState>({
    action: null,
    tokenId: "",
    amount: "",
  });

  interface SwapState {
    action: "native" | "token" | null;
    tokenId: string;
    amount?: string;
  }

  type SwapStep =
    | "SETUP_CONFIRMATION"
    | "AWAIT_DEPOSIT_APPROVAL"
    | "AWAIT_SWAP_DETAILS"
    | "CONFIRM_SWAP"
    | "AWAIT_AMOUNT"
    | "AWAIT_BUY_TOKEN"
    | "AWAIT_SELL_TOKEN"
    | "AWAIT_PRIVATE_KEY";

  type AbiFunction = {
    inputs: { internalType: string; name: string; type: string }[];
    name: string;
    outputs: { internalType: string; name: string; type: string }[];
    stateMutability: "pure" | "view" | "nonpayable" | "payable";
    type: "function";
  };
  interface SwapDetails {
    inputAmt?: string;
    sellAddress?: string;
    buyAddress?: string;
    sellToken?: string;
    buyToken?: string;
  }

  interface PendingSwap {
    step: SwapStep;
    details?: SwapDetails;
  }

  interface CrossChainState {
    action: "sendOFT" | "setPeer" | null;
    srcChainId: string;
    destChainId: string;
    amount?: string;
    receivingAccountAddress?: string;
  }



  React.useEffect(() => {
    if (!activeAddress && activeTab !== "general" && activeTab !== "ecosystem-project" && activeTab !== "nfd-names") {
      setActiveTab("general");
    }
  }, [activeAddress, activeTab]);

  // Helper function to check for confirmation phrases
  const isConfirmation = (text: string) => {
    const confirmations = [
      "yes",
      "sure",
      "why not",
      "go ahead",
      "mint",
      "confirm",
    ];
    return confirmations.some((phrase) => text.toLowerCase().includes(phrase));
  };

  const handleMintSubmit = async (currentInput: string) => {
    if (!activeAddress) {
      setError(
        "Hey there! It looks like your wallet isn't connected yet. Please connect your wallet so we can mint your NFT together."
      );
      setLoading(false);
      return;
    }

    if (pendingNFT) {
      if (isConfirmation(currentInput)) {

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Awesome! I'm minting your NFT right now. Hang tight...",
          },
        ]);
        let txurl = await createNFT(pendingNFT.nftIpfsUrl, "Algorand AI Generated NFT");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `🎉 Your NFT has been minted successfully!\n\n- [View Transaction on Explorer](${txurl})`,
          },
        ]);

        setPendingNFT(null);
        return;
      } else {
        // No confirmation detected: cancel minting
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Okay, minting cancelled. If you change your mind, just let me know and we can generate another NFT image!",
          },
        ]);
        setPendingNFT(null);
        setLoading(false);
        return;
      }
    } else {
      // No pending NFT – generate the NFT image and ask for confirmation
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Great, let me create a unique NFT image for you. One moment please...",
        },
      ]);
      const tokenUri = await generateImage(formatNftPrompt(currentInput));

      if (tokenUri?.nftIpfsUrl) {
        setPendingNFT({ nftIpfsUrl: tokenUri.nftIpfsUrl });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: {
              text: "Here's your freshly generated NFT image! Do you like it? Reply with 'yes' to mint it or 'no' to cancel.",
              imageSrc: tokenUri?.img,
            },
          },
        ]);
      } else {
        setError(
          "Oops, something went wrong while generating your NFT image. Please try again."
        );
        setLoading(false);
        return;
      }
      setLoading(false);
      // Return early so no further processing is done until the user confirms.
      return;
    }
  };
  // Step-based token creation conversation
  const handleMintTokenSubmit = async (currentInput: string) => {
    if (!activeAddress) {
      setError(
        "Hey there! It looks like your wallet isn't connected yet. Please connect your wallet so we can mint your token together."
      );
      setLoading(false);
      return;
    }

    // If we already have pending FT waiting for confirmation
    if (pendingFT?.unitName && pendingFT?.assetName && pendingFT?.totalSupply && pendingFT?.decimals !== undefined) {
      if (isConfirmation(currentInput)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Awesome! Minting your fungible token now 🚀...",
          },
        ]);

        try {
          const { assetId, explorerLink } = await createFungibleTokens(
            pendingFT.unitName,
            pendingFT.assetName,
            pendingFT.totalSupply,
            pendingFT.decimals
          );

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `🎉 Your fungible token has been created!\n\n- **Asset ID:** ${assetId}\n- [View Transaction on Explorer](${explorerLink})`,
            },
          ]);
        } catch (err) {
          setError("Oops, something went wrong while minting your token.");
        }

        setPendingFT(null);
        setLoading(false);
        return;
      } else {
        // User cancels
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Okay, minting cancelled. If you change your mind, we can try again anytime!",
          },
        ]);
        setPendingFT(null);
        setLoading(false);
        return;
      }
    }

    // If we are in the middle of asking FT details (collect step by step)
    if (!pendingFT) {
      // Step 1: ask unitName
      setPendingFT({});
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Let's create your personalized fungible token 🎨\n\n👉 First, what short symbol should we use (unit name)? Example: `RP` for Royalty Points." },
      ]);
      return;
    } else if (!pendingFT.unitName) {
      setPendingFT({ ...pendingFT, unitName: currentInput.trim() });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Nice choice! Now, give your token a beautiful full name (asset name). Example: `Royalty Points`" },
      ]);
      return;
    } else if (!pendingFT.assetName) {
      setPendingFT({ ...pendingFT, assetName: currentInput.trim() });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Great! How many tokens in total supply should we mint? Example: `1000000`" },
      ]);
      return;
    } else if (!pendingFT.totalSupply) {
      const supply = BigInt(currentInput.trim());
      setPendingFT({ ...pendingFT, totalSupply: supply });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Perfect! Lastly, how many decimals should your token have? Example: `6` (common for micro-units)" },
      ]);
      return;
    } else if (pendingFT.decimals === undefined) {
      const decimals = parseInt(currentInput.trim());
      setPendingFT({ ...pendingFT, decimals });

      // Ask for final confirmation
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Awesome! Here's what I gathered:\n\n- Unit Name: ${pendingFT.unitName}\n- Asset Name: ${pendingFT.assetName}\n- Total Supply: ${pendingFT.totalSupply}\n- Decimals: ${decimals}\n\n👉 Do you want me to mint this token now? (yes / no)`,
        },
      ]);
      return;
    }
  };
  const handleGetQuotes = async (currentInput: string) => {
    if (!activeAddress) {
      setError(
        "Hey there! It looks like your wallet isn't connected yet. Please connect your wallet so we can fetch quotes."
      );
      setLoading(false);
      return;
    }

    // 🟢 First AI message asking for tickers if no input
    if (!currentInput || currentInput.trim().length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "👋 Hi! Please give me the tickers for which you want token details (e.g., `btc, eth, sol`).",
        },
      ]);
      setLoading(false);
      return;
    }

    // If user provided tickers
    if (currentInput.includes(",")) {
      try {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Fetching quotes for your tokens... ⏳" },
        ]);

        const tickers = currentInput
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0);

        // Call API to get details
        const response = await fetch("/api/quotes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tickers }), // send array of tickers
        });

        const data = await response.json();

        if (data.error) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `❌ Error: ${data.error}` },
          ]);
        } else if (data.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "⚠️ I couldn’t find any tokens for the tickers you entered. Please check and try again.",
            },
          ]);
        } else {
          // Build plain text list
          const listText = data
            .map(
              (token: any, index: number) =>
                `${index + 1}. 1 ${token.symbol.toUpperCase()} - $${Number(
                  token.price
                ).toFixed(4)} USDT`
            )
            .join("\n");

          // Push text into messages
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: listText },
          ]);
        }
      } catch (err) {
        setError("⚠️ Failed to fetch token quotes. Please try again.");
      }

      setLoading(false);
      return;
    }
  };


  const handleTransferToken = async (currentInput: string) => {
    if (!activeAddress) {
      setError("⚠️ Your wallet isn't connected yet. Please connect your wallet before sending tokens.");
      setLoading(false);
      return;
    }

    // Step 0: Check if transfer process started
    if (!pendingTokenTransfer) {
      if (currentInput.toLowerCase() === "yes") {
        setPendingTokenTransfer({ step: "receiver" });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "📩 Please share the receiver address." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "👋 Hey, you want to transfer a token? Say **yes** to continue." },
        ]);
      }
      setLoading(false);
      return;
    }

    // Step 1: Receiver
    if (pendingTokenTransfer.step === "receiver") {
      setPendingTokenTransfer({ step: "assetId", receiver: currentInput.trim() });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "🔑 Got the address! Now share the **Asset ID** of the token you want to transfer." },
      ]);
      setLoading(false);
      return;
    }

    // Step 2: Asset ID
    if (pendingTokenTransfer.step === "assetId") {
      setPendingTokenTransfer({
        step: "amount",
        receiver: pendingTokenTransfer.receiver,
        assetId: currentInput.trim(),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "💰 Great! How many units of this token do you want to send?" },
      ]);
      setLoading(false);
      return;
    }

    // Step 3: Amount
    if (pendingTokenTransfer.step === "amount") {
      setPendingTokenTransfer({
        step: "confirm",
        receiver: pendingTokenTransfer.receiver,
        assetId: pendingTokenTransfer.assetId,
        amount: currentInput.trim(),
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ You want to send **${currentInput} units** of token (ID: ${pendingTokenTransfer.assetId}) to:\n\n\`${pendingTokenTransfer.receiver}\`\n\nReply with 'yes' to confirm or 'no' to cancel.`,
        },
      ]);
      setLoading(false);
      return;
    }

    // Step 4: Confirmation
    if (pendingTokenTransfer.step === "confirm") {
      if (currentInput.toLowerCase() === "yes") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `🚀 Transferring ${pendingTokenTransfer.amount} units of token (ID: ${pendingTokenTransfer.assetId}) to ${pendingTokenTransfer.receiver}...`,
          },
        ]);

        try {
          await algoTokensPayment(
            pendingTokenTransfer.receiver!,
            BigInt(pendingTokenTransfer.assetId!),
            Number(pendingTokenTransfer.amount)!
          );


        } catch (err) {
          console.error("❌ Error sending token:", err);
          setError("Something went wrong while transferring your token. Please try again.");
        }

        setPendingTokenTransfer(null);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ Token transfer cancelled. You can start again anytime." },
        ]);
        setPendingTokenTransfer(null);
      }
      setLoading(false);
      return;
    }
  };


  const handleTransferNativeToken = async (currentInput: string) => {
    if (!activeAddress) {
      setError("⚠️ Your wallet isn't connected yet. Please connect your wallet before sending ALGO.");
      setLoading(false);
      return;
    }

    // Step 0: Start transfer flow
    if (!pendingNativeTransfer) {
      if (currentInput.toLowerCase() === "yes") {
        setNativePendingTransfer({ step: "receiver" });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "📩 Please share the receiver address." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "👋 Hey, you have to do a native transfer. Say **yes** to continue." },
        ]);
      }
      setLoading(false);
      return;
    }

    // Step 1: Receiver address
    if (pendingNativeTransfer.step === "receiver") {
      setNativePendingTransfer({ step: "amount", receiver: currentInput.trim() });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "💰 Got it! How much ALGO do you want to send?" },
      ]);
      setLoading(false);
      return;
    }

    // Step 2: Amount
    if (pendingNativeTransfer.step === "amount") {
      setNativePendingTransfer({
        step: "confirm",
        receiver: pendingNativeTransfer.receiver,
        amount: currentInput.trim(),
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ You want to send **${currentInput} ALGO** to:\n\n\`${pendingNativeTransfer.receiver}\`\n\nReply with 'yes' to confirm or 'no' to cancel.`,
        },
      ]);
      setLoading(false);
      return;
    }

    // Step 3: Confirmation
    if (pendingNativeTransfer.step === "confirm") {
      if (currentInput.toLowerCase() === "yes") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `🚀 Sending ${pendingNativeTransfer.amount} ALGO to ${pendingNativeTransfer.receiver}...`,
          },
        ]);

        try {
          // use the reusable function here instead of duplicating code
          await algoDirectPayment(pendingNativeTransfer.receiver, Number(pendingNativeTransfer.amount));
        } catch (err) {
          console.error("❌ Error sending ALGO:", err);
          setError("Something went wrong while sending your ALGO. Please try again.");
        }

        setNativePendingTransfer(null);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "❌ Transfer cancelled. You can start again anytime." },
        ]);
        setNativePendingTransfer(null);
      }
      setLoading(false);
      return;
    }
  };








  // Handles the "swap" flow.
  const handleSwapSubmit = async (
    userInput: string,
    setMessages: (fn: (prev: any[]) => any[]) => void,
    setState?: (state: SwapState) => void
  ) => {
    const state: SwapState = swapState;
    const lowerInput = userInput.toLowerCase();

    // Detect swap action
    if (lowerInput.includes("swap")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Which swap type do you want? \n1️⃣ Native Swap (native) \n2️⃣ Token Swap (token)",
        },
      ]);
      return;
    }

    // Detect swap type selection
    if (!state.action && (lowerInput === "native" || lowerInput === "token")) {
      state.action = lowerInput as "native" | "token";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Understood! You selected ${state.action} swap. Please provide the Token ID.`,
        },
      ]);
      setState?.(state);
      return;
    }

    // Extract token ID
    if (!state.tokenId) {
      state.tokenId = userInput;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Got it! Token ID: ${state.tokenId}. How many tokens would you like to swap?`,
        },
      ]);
      setState?.(state);
      return;
    }

    // Extract amount
    if (!state.amount) {
      state.amount = userInput;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Noted! Swapping ${state.amount} of Token ID: ${state.tokenId}. Confirm? (yes/no)`,
        },
      ]);
      setState?.(state);
      return;
    }

    // Handle confirmation
    if (lowerInput === "yes" || lowerInput === "y") {
      try {
        const response = await fetch("/api/native-swap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: state.action,
            tokenId: state.tokenId,
            amount: state.amount,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `✅ Successfully swapped ${state.amount} TRIX of Token ID: ${state.tokenId}.\n🔄 Swap Type: ${state.action}\n🔗 Verify Transaction: ${data.url}\n\nWould you like to do another swap?`,
            },
          ]);
        } else {
          throw new Error(data.message || "Swap failed");
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `❌ Error: ${error instanceof Error ? error.message : "Swap failed"
              }`,
          },
        ]);
      }

      // Reset state after completion
      setState?.({
        action: null,
        tokenId: "",
        amount: "",
      });
    } else if (lowerInput === "no" || lowerInput === "n") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Swap canceled. If you want to start over, type 'swap'.",
        },
      ]);
      setState?.({
        action: null,
        tokenId: "",
        amount: "",
      });
    }
  };

  // Handles the "lend" flow.
  const handleLendingSubmit = async () => {
    return await fetch("/api/lending", {
      method: "GET",
    });
  };

  const handleAlgorandHelperSubmit = async (
    userInput: string,
    setMessages: (fn: (prev: any[]) => any[]) => void
  ) => {
    try {
      const lowerInput = userInput.trim().toLowerCase();

      //give thinking time for the bot
      await delay(2000);

      if (lowerInput.includes("hardhat")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
          },
        ]);
        return;
      }

      if (lowerInput.includes("account abstraction")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: accountabstraction,
          },
        ]);
        return;
      }

      if (lowerInput.includes("oracles") || lowerInput.includes("oracle")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: oracle,
          },
        ]);
        return;
      }

      if (
        lowerInput.includes("cross-chain") ||
        lowerInput.includes("cross chain") ||
        lowerInput.includes("crosschain") ||
        lowerInput.includes("cross")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: crosschain,
          },
        ]);
        return;
      }

      if (lowerInput.includes("indexers") || lowerInput.includes("indexer")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: indexer,
          },
        ]);
        return;
      }

      if (
        lowerInput.includes("wallet infra") ||
        lowerInput.includes("wallet")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: walletinfra,
          },
        ]);
        return;
      }

      if (
        lowerInput.includes("rpc") ||
        lowerInput.includes("rpcs") ||
        lowerInput.includes("urls")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: rpcs,
          },
        ]);
        return;
      }

      if (lowerInput.includes("defi") || lowerInput.includes("defi-example")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: defi,
          },
        ]);
        return;
      }

      // no command matched
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ask Her topic's like : account abstraction, oracles, cross-chain, indexers, wallet infra, rpcs, defi,hardhat config etc.",
        },
      ]);
      return;
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error processing input. Please try again.",
        },
      ]);
      return;
    }
  };

  // Handles the "trade" flow.
  const handleTradeSubmit = async () => {
    return await fetch("/api/trade", {
      method: "GET",
    });
  };

  // Handles the "general" flow.
  const handleGeneralSubmit = async (currentInput: string) => {
    return await fetch("/api/general", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: currentInput }),
    });
  };

  // Handles the "ecosystem-project" flow.
  const handleEcosystemProjectSubmit = async (currentInput: string) => {
    return await fetch("/api/ecosystem-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: currentInput }),
    });
  };

  // Handles the "nfd-names" flow.
  const handleNFDNamesSubmit = async (
    currentInput: string,
    setMessages: (fn: (prev: any[]) => any[]) => void
  ) => {
    console.log("currentInput", currentInput);
    const lowerInput = currentInput.toLowerCase().trim();
    const input = currentInput.trim();
    
    // Determine operation type based on input
    type OperationType = "getAllNfds" | "resolveName" | "reverseLookup" | null;
    let operationType: OperationType = null;
    
    // Check if user wants to get all NFDs
    const wantsAllNfds = lowerInput.includes('get all') || 
                         lowerInput.includes('all nfd') ||
                         lowerInput.includes('all nfds') ||
                         lowerInput.includes('show all nfd');

    // Address patterns
    const addressPattern = /^[A-Z2-7]{57}[AEIMQUY4]$/i;
    const addressPattern58 = /^[A-Z2-7]{58}$/i;
    

    // Check if user wants to resolve an address (reverse lookup)
    const wantsResolveAddress = lowerInput.includes('resolve') && 
                                (lowerInput.includes('address') || lowerInput.includes('an address'));
    
    // Check if user wants reverse lookup
    const wantsReverseLookup = lowerInput.includes('reverse') && 
                                (lowerInput.includes('lookup') || lowerInput.includes('look up'));
    
    // Check if user wants to mint an NFD
    const wantsMintNfd = lowerInput.includes('mint') && 
                         (lowerInput.includes('nfd') || lowerInput.includes('name'));
    
    // If user wants to mint NFD and we don't have pending state, start the flow
    if (wantsMintNfd && !pendingNFDLookup) {
      if (!activeAddress) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "❌ Please connect your wallet first to mint an NFD name.",
          },
        ]);
        setLoading(false);
        return null;
      }
      
      setPendingNFDLookup({ step: "name", operation: "mintNfd" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sure! Let's mint an NFD name. What name would you like to mint? (e.g., 'myname.algo')",
        },
      ]);
      setLoading(false);
      return null;
    }
    
    // If user wants "Get all NFDs" and we don't have pending state, start the flow
    if (wantsAllNfds && !pendingNFDLookup) {
      setPendingNFDLookup({ step: "address", operation: "getAllNfds" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sure! Which address do you want all NFD names for? Please provide the Algorand address.",
        },
      ]);
      setLoading(false);
      return null;
    }

    // If user wants to resolve an address and we don't have pending state, start the flow
    if (wantsResolveAddress && !pendingNFDLookup) {
      setPendingNFDLookup({ step: "address", operation: "reverseLookup" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sure! Tell me the address you want to resolve.",
        },
      ]);
      setLoading(false);
      return null;
    }

    // If user wants reverse lookup and we don't have pending state, start the flow
    if (wantsReverseLookup && !pendingNFDLookup) {
      setPendingNFDLookup({ step: "address", operation: "reverseLookup" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sure! Tell me the name you want to reverse lookup.",
        },
      ]);
      setLoading(false);
      return null;
    }

    // If we're in the flow, handle step by step
    if (pendingNFDLookup) {
      // Mint NFD flow
      if (pendingNFDLookup.operation === "mintNfd") {
        // Step 1: Collect NFD name
        if (pendingNFDLookup.step === "name") {
          const nfdName = input.trim();
          if (nfdName.length === 0) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "❌ Please provide a valid NFD name.",
              },
            ]);
            setLoading(false);
            return null;
          }
          
          setPendingNFDLookup({ 
            step: "reservedFor", 
            operation: "mintNfd",
            nfdName: nfdName
          });
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Got it! NFD name: \`${nfdName}\`\n\nWhich address should own this NFD? (Press enter to use your connected address: \`${activeAddress}\`)`,
            },
          ]);
          setLoading(false);
          return null;
        }
        
        // Step 2: Collect reserved for address
        if (pendingNFDLookup.step === "reservedFor") {
          const inputAddress = input.trim();
          const reservedFor = inputAddress || activeAddress || '';
          const addressPattern = /^[A-Z2-7]{57}[AEIMQUY4]$/i;
          const addressPattern58 = /^[A-Z2-7]{58}$/i;
          
          // If user provided an address, validate it
          if (inputAddress && !addressPattern.test(inputAddress) && !addressPattern58.test(inputAddress)) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "❌ That doesn't look like a valid Algorand address. Please provide a valid 58-character Algorand address, or press enter to use your connected address.",
              },
            ]);
            setLoading(false);
            return null;
          }
          
          setPendingNFDLookup({ 
            step: "linkOnMint", 
            operation: "mintNfd",
            nfdName: pendingNFDLookup.nfdName,
            reservedFor: reservedFor
          });
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Perfect! Reserved for: \`${reservedFor}\`\n\nShould the registry auto-link this address to the NFD on mint? (yes/no, default: yes)`,
            },
          ]);
          setLoading(false);
          return null;
        }
        
        // Step 3: Collect link on mint preference
        if (pendingNFDLookup.step === "linkOnMint") {
          const linkOnMintInput = lowerInput.trim();
          const linkOnMint = linkOnMintInput === '' || linkOnMintInput === 'yes' || linkOnMintInput === 'y' || linkOnMintInput === 'true';
          
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Great! I'll mint the NFD name \`${pendingNFDLookup.nfdName}\` for address \`${pendingNFDLookup.reservedFor}\` with link on mint: ${linkOnMint}.\n\n⚠️ Note: This will require price and carry costs. Fetching pricing information...`,
            },
          ]);
          
          // Call mintNfdName function
          try {
            // For now, using placeholder values - you may want to fetch these from the registry
            // You might need to call getPrice() method from the registry contract
            const registryAppId = 763844423; // Testnet registry app ID - you may want to make this configurable
            const registryAddress = "RSV2YCHXA7MWGFTX3WYI7TVGAS5W5XH5M7ZQVXPPRQ7DNTNW36OW2TRR6I"; // Testnet registry address - you may want to make this configurable
            const priceMicroAlgos = BigInt(1000000); // 1 ALGO in microAlgos - should be fetched from registry
            const carryMicroAlgos = BigInt(100000); // 0.1 ALGO - should be calculated based on MBR
            
            await mintNfdName(
              pendingNFDLookup.nfdName || '',
              pendingNFDLookup.reservedFor || activeAddress || '',
              linkOnMint,
              priceMicroAlgos,
              carryMicroAlgos,
              registryAppId,
              registryAddress
            );
            
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `✅ NFD name \`${pendingNFDLookup.nfdName}\` minting initiated! The transaction is being processed.`,
              },
            ]);
          } catch (error: any) {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `❌ Error minting NFD: ${error.message || 'Failed to mint NFD. Please try again.'}`,
              },
            ]);
          }
          
          // Reset the flow
          setPendingNFDLookup(null);
          setLoading(false);
          return null;
        }
      }
      
      // Step 1: Collect address or name (for other operations)
      if (pendingNFDLookup.step === "address") {
        // For reverseLookup, user provides a name (not an address)
        if (pendingNFDLookup.operation === "reverseLookup") {
          // Accept any input as a name (not validating as address)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Got it! Looking up address for NFD name: \`${input}\`. Fetching now...`,
            },
          ]);

          // Make the API call with resolveName operation (name to address)
          try {
            const response = await fetch("/api/nfd-names", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                text: input,
                operation: "resolveName",
                view: "brief"
              }),
            });

            const data = await response.json();
            
            if (data.error) {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `❌ Error: ${data.error}` },
              ]);
            } else {
              const formattedContent = formatNFDResponse(data);
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: formattedContent },
              ]);
            }
            
            // Reset the flow
            setPendingNFDLookup(null);
          } catch (error) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "❌ Failed to fetch NFD data. Please try again." },
            ]);
            setPendingNFDLookup(null);
          }
          
          setLoading(false);
          return null;
        } 
        // For getAllNfds, validate address
        else if (addressPattern.test(input) || addressPattern58.test(input)) {
          // For getAllNfds, ask for view type
          setPendingNFDLookup({ step: "view", address: input, operation: pendingNFDLookup.operation });
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Got it! Address: \`${input}\`\n\nWhat view type would you like? (Options: **tiny**, **thumbnail**, **brief**, **full** - or just press enter for default "brief")`,
            },
          ]);
          setLoading(false);
          return null;
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "❌ That doesn't look like a valid Algorand address. Please provide a valid 58-character Algorand address.",
            },
          ]);
          setLoading(false);
          return null;
        }
      }

      // Step 2: Collect view type (optional) - only for getAllNfds
      if (pendingNFDLookup.step === "view") {
        const viewTypes = ["tiny", "thumbnail", "brief", "full"];
        const viewInput = input.toLowerCase();
        const viewType = (viewInput && viewTypes.includes(viewInput)) ? viewInput : "brief";
        
        setPendingNFDLookup({ 
          step: "confirm", 
          address: pendingNFDLookup.address, 
          view: viewType,
          operation: pendingNFDLookup.operation
        });
        
        const viewMessage = viewInput && viewTypes.includes(viewInput) 
          ? `with view type **${viewType}**`
          : `with default view type **brief**`;
        
        const operationMessage = pendingNFDLookup.operation === "getAllNfds"
          ? `fetch all NFDs for address`
          : `resolve address`;
        
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Perfect! I'll ${operationMessage} \`${pendingNFDLookup.address}\` ${viewMessage}. Fetching now...`,
          },
        ]);

        // Make the API call with explicit operation type
        try {
          const response = await fetch("/api/nfd-names", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              text: pendingNFDLookup.address,
              operation: pendingNFDLookup.operation || "getAllNfds",
              view: viewType 
            }),
          });

          const data = await response.json();
          
          if (data.error) {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `❌ Error: ${data.error}` },
            ]);
          } else {
            const formattedContent = formatNFDResponse(data);
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: formattedContent },
            ]);
          }
          
          // Reset the flow
          setPendingNFDLookup(null);
        } catch (error) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "❌ Failed to fetch NFD data. Please try again." },
          ]);
          setPendingNFDLookup(null);
        }
        
        setLoading(false);
        return null;
      }
    }

    // Determine operation type based on keywords in the message
    // Only set operation type if not already in a conversational flow
    if (lowerInput.includes('resolve') && !lowerInput.includes('address')) {
      operationType = "resolveName";
    } else if (wantsAllNfds || lowerInput.includes('all')) {
      operationType = "getAllNfds";
    } else {
      // Default: try to resolve as name
      operationType = "resolveName";
    }

    // For other operations (resolve name, reverse lookup), use direct API call with operation type
    return await fetch("/api/nfd-names", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: currentInput,
        operation: operationType 
      }),
    });
  };

  // Format NFD response for display as HTML cards
  const formatNFDResponse = (data: any): string => {
    const { data: nfdData, lookupType, input } = data;
    
    if (!nfdData) {
      return `<div style="color: #ef4444; padding: 1rem;">❌ No NFD information found for: ${input}</div>`;
    }
    // Helper function to create a card for a single NFD
    const createNFDCard = (nfd: any, index?: number): string => {
      const cardStyle = `
        background: linear-gradient(135deg, rgba(33, 33, 33, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%);
        border: 1px solid rgba(107, 114, 128, 0.2);
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      `;
      
      const labelStyle = `color: #9ca3af; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;`;
      const valueStyle = `color: #e5e7eb; font-size: 0.875rem; word-break: break-all;`;
      const nameStyle = `color: #ffffff; font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;`;
      
      let card = `<div style="${cardStyle}">`;
      
      // Card header with name and avatar
      if (nfd.name) {
        card += `<div style="${nameStyle}">
          <span style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; color: white;">${index !== undefined ? `#${index + 1}` : 'NFD'}</span>
          <span>${nfd.name}</span>
        </div>`;
      }
      
      // Display avatar if available
      const avatarUrl = nfd.avatar || (nfd.properties && nfd.properties.avatar) || (nfd.properties && nfd.properties.userDefined && nfd.properties.userDefined.avatar);
      if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
        card += `<div style="margin-bottom: 1rem; display: flex; justify-content: center;">
          <img 
            src="${avatarUrl}" 
            alt="NFD Avatar" 
            style="width: 120px; height: 120px; border-radius: 1rem; object-fit: cover; border: 2px solid rgba(99, 102, 241, 0.3); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);"
            onerror="this.style.display='none'"
          />
        </div>`;
      }
      
      // Card body with details in grid
      card += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">`;
      
      if (nfd.id) {
        card += `<div>
          <div style="${labelStyle}">NFD ID</div>
          <div style="${valueStyle}">${nfd.id}</div>
        </div>`;
      }
      
      if (nfd.appID) {
        card += `<div>
          <div style="${labelStyle}">App ID</div>
          <div style="${valueStyle}">${nfd.appID}</div>
        </div>`;
      }
      
      if (nfd.asaID) {
        card += `<div>
          <div style="${labelStyle}">ASA ID</div>
          <div style="${valueStyle}">${nfd.asaID}</div>
        </div>`;
      }
      
      if (nfd.state) {
        const stateColor = nfd.state === 'owned' ? '#10b981' : nfd.state === 'forSale' ? '#f59e0b' : '#6b7280';
        card += `<div>
          <div style="${labelStyle}">State</div>
          <div style="${valueStyle}">
            <span style="background: ${stateColor}; padding: 0.125rem 0.5rem; border-radius: 0.375rem; font-size: 0.75rem; color: white; display: inline-block;">${nfd.state}</span>
          </div>
        </div>`;
      }
      
      if (nfd.caAlgo && Array.isArray(nfd.caAlgo) && nfd.caAlgo.length > 0) {
        card += `<div style="grid-column: 1 / -1;">
          <div style="${labelStyle}">Address</div>
          <div style="${valueStyle}; font-family: monospace; background: rgba(107, 114, 128, 0.1); padding: 0.5rem; border-radius: 0.5rem;">${nfd.caAlgo[0]}</div>
        </div>`;
      }
      
      if (nfd.owner) {
        card += `<div style="grid-column: 1 / -1;">
          <div style="${labelStyle}">Owner</div>
          <div style="${valueStyle}; font-family: monospace; background: rgba(107, 114, 128, 0.1); padding: 0.5rem; border-radius: 0.5rem;">${nfd.owner}</div>
        </div>`;
      }
      
      if (nfd.depositAccount) {
        card += `<div style="grid-column: 1 / -1;">
          <div style="${labelStyle}">Deposit Account</div>
          <div style="${valueStyle}; font-family: monospace; background: rgba(107, 114, 128, 0.1); padding: 0.5rem; border-radius: 0.5rem;">${nfd.depositAccount}</div>
        </div>`;
      }
      
      if (nfd.timeCreated) {
        const createdDate = new Date(nfd.timeCreated * 1000).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        card += `<div>
          <div style="${labelStyle}">Created</div>
          <div style="${valueStyle}">${createdDate}</div>
        </div>`;
      }
      
      if (nfd.timeExpires) {
        const expiresDate = new Date(nfd.timeExpires * 1000).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        card += `<div>
          <div style="${labelStyle}">Expires</div>
          <div style="${valueStyle}">${expiresDate}</div>
        </div>`;
      }
      
      // Helper function to render nested properties
      const renderPropertyValue = (value: any, depth: number = 0, key?: string): string => {
        if (value === null || value === undefined) {
          return '<span style="color: #6b7280;">null</span>';
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return '<span style="color: #6b7280;">[]</span>';
          }
          let html = '<div style="margin-left: 1rem;">';
          value.forEach((item, idx) => {
            html += `<div style="margin-bottom: 0.25rem;">
              <span style="color: #9ca3af;">[${idx}]:</span> ${renderPropertyValue(item, depth + 1, undefined)}
            </div>`;
          });
          html += '</div>';
          return html;
        }
        
        if (typeof value === 'object') {
          const keys = Object.keys(value);
          if (keys.length === 0) {
            return '<span style="color: #6b7280;">{}</span>';
          }
          let html = '<div style="margin-left: 1rem; border-left: 2px solid rgba(99, 102, 241, 0.3); padding-left: 0.75rem;">';
          keys.forEach((k) => {
            html += `<div style="margin-bottom: 0.5rem;">
              <span style="color: #a78bfa; font-weight: 600; font-size: 0.75rem;">${k}:</span>
              <div style="margin-top: 0.25rem;">${renderPropertyValue(value[k], depth + 1, k)}</div>
            </div>`;
          });
          html += '</div>';
          return html;
        }
        
        // Primitive values
        if (typeof value === 'string') {
          // Check if it's an avatar field or image URL
          const isAvatarField = key && key.toLowerCase() === 'avatar';
          const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(value) || 
                           (value.startsWith('http') && (value.includes('avatar') || value.includes('image')));
          
          // If it's an avatar field or looks like an image URL, display as image
          if ((isAvatarField || isImageUrl) && value.startsWith('http')) {
            return `<img 
              src="${value}" 
              alt="${key || 'Image'}" 
              style="max-width: 200px; max-height: 200px; border-radius: 0.5rem; object-fit: cover; border: 1px solid rgba(99, 102, 241, 0.3); margin-top: 0.5rem;"
              onerror="this.style.display='none'"
            />`;
          }
          
          return `<span style="color: #e5e7eb;">${value}</span>`;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
          return `<span style="color: #60a5fa;">${value}</span>`;
        }
        
        return `<span style="color: #e5e7eb;">${String(value)}</span>`;
      };

      if (nfd.properties && typeof nfd.properties === 'object' && Object.keys(nfd.properties).length > 0) {
        card += `<div style="grid-column: 1 / -1; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid rgba(107, 114, 128, 0.2);">
          <div style="${labelStyle}">Properties</div>
          <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 0.5rem; padding: 1rem; margin-top: 0.75rem;">`;
        
        Object.entries(nfd.properties).forEach(([key, value]: [string, any]) => {
          // Skip avatar in properties since we already display it at the top
          if (key.toLowerCase() === 'avatar') {
            return;
          }
          
          // Skip userDefined.avatar if it exists (we already display it at the top)
          if (key.toLowerCase() === 'userdefined' && value && typeof value === 'object' && value.avatar) {
            // Render userDefined but without the avatar field
            const { avatar, ...restUserDefined } = value;
            if (Object.keys(restUserDefined).length > 0) {
              card += `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(107, 114, 128, 0.1);">
                <div style="color: #a78bfa; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.5rem; text-transform: capitalize;">${key}</div>
                <div style="color: #e5e7eb; font-size: 0.875rem;">
                  ${renderPropertyValue(restUserDefined, 0, key)}
                </div>
              </div>`;
            }
            return;
          }
          
          card += `<div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(107, 114, 128, 0.1);">
            <div style="color: #a78bfa; font-weight: 700; font-size: 0.875rem; margin-bottom: 0.5rem; text-transform: capitalize;">${key}</div>
            <div style="color: #e5e7eb; font-size: 0.875rem;">
              ${renderPropertyValue(value, 0, key)}
            </div>
          </div>`;
        });
        
        card += `</div></div>`;
      }
      
      card += `</div></div>`;
      return card;
    };

    // Handle reverse lookup (address to NFD names)
    if (lookupType === 'address') {
      if (Array.isArray(nfdData) && nfdData.length > 0) {
        let result = `<div style="margin-bottom: 1.5rem;">
          <div style="color: #10b981; font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">✅ Found ${nfdData.length} NFD name(s) for address:</div>
          <div style="font-family: monospace; color: #9ca3af; background: rgba(107, 114, 128, 0.1); padding: 0.5rem; border-radius: 0.5rem; display: inline-block;">${input}</div>
        </div>`;
        nfdData.forEach((nfd: any, index: number) => {
          result += createNFDCard(nfd, index);
        });
        return result;
      } else {
        return `<div style="color: #ef4444; padding: 1rem;">❌ No NFD names found for address: <code style="background: rgba(107, 114, 128, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${input}</code></div>`;
      }
    }

    // Handle all NFDs lookup (comprehensive list from v2/search API)
    if (lookupType === 'all-nfds') {
      if (Array.isArray(nfdData) && nfdData.length > 0) {
        let result = `<div style="margin-bottom: 1.5rem;">
          <div style="color: #10b981; font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">✅ Found ${nfdData.length} NFD(s) owned by address:</div>
          <div style="font-family: monospace; color: #9ca3af; background: rgba(107, 114, 128, 0.1); padding: 0.5rem; border-radius: 0.5rem; display: inline-block;">${input}</div>
        </div>`;
        nfdData.forEach((nfd: any, index: number) => {
          result += createNFDCard(nfd, index);
        });
        return result;
      } else {
        return `<div style="color: #ef4444; padding: 1rem;">❌ No NFD names found for address: <code style="background: rgba(107, 114, 128, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${input}</code></div>`;
      }
    }

    // Handle forward lookup (NFD name to address)
    if (lookupType === 'name') {
      return createNFDCard(nfdData);
    }

    // Fallback for unknown type
    return `<div style="color: #10b981; padding: 1rem;">✅ NFD Information:</div><pre style="background: rgba(107, 114, 128, 0.1); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; color: #e5e7eb;">${JSON.stringify(nfdData, null, 2)}</pre>`;
  };

  interface AbiMethod {
    name: string;
    args: { name: string; type: string }[];
    returns: { type: string };
    readonly: boolean;
  }

  interface ContractAbi {
    name: string;
    methods: AbiMethod[];
  }


  const generateIntegrationFunction = (abi: { name: string; methods: any[] }) => {
    return abi.methods.map((method) => {
      const { name, args, readonly } = method;

      // Extract parameter names
      const paramNames = (args || []).map((arg) => arg.name).join(", ");

      // Generate function template
      const functionCode = `
const ${name} = async (${paramNames}) => {
  if (!appId) {
    enqueueSnackbar("Please deploy contract first", { variant: "error" });
    return;
  }

  setLoading(true);
  try {
    const client = new ${abi.name}Client({
      appId: BigInt(appId),
      algorand,
      defaultSigner: TransactionSigner,
    });

    ${readonly
          ? `// Readonly call
    const result = await client.get.${name}({ args: [${paramNames}] });
    enqueueSnackbar("${name} executed! Result: " + result, { variant: "success" });`
          : `// On-chain transaction
    await client.send.${name}({ args: [${paramNames}], sender: activeAddress ?? undefined });

    enqueueSnackbar("${name} executed successfully!", { variant: "success" });`
        }
  } catch (e) {
    enqueueSnackbar(\`Error in ${name}: \${(e as Error).message}\`, { variant: "error" });
    console.error("${name} Error:", e);
  } finally {
    setLoading(false);
  }
};`;

      return functionCode;
    });
  };



  const handleGenerateSubmit = async (
    userInput: string,
    setMessages: (fn: (prev: any[]) => any[]) => void
  ) => {
    try {
      const lowerInput = userInput.trim().toLowerCase();

      if (lowerInput === "generate_function") {
        setGenerateCommand(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Please provide the Contract ABI JSON string.",
          },
        ]);
        return;
      }

      if (generateCommand) {
        let inputData;
        try {
          const formattedInput = userInput
            .trim()
            .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
            .replace(/:\s*([a-zA-Z_][\w]*)\s*([,}\]])/g, ':"$1"$2')
            .replace(/,\s*}/g, "}")
            .replace(/,\s*]/g, "]");

          inputData = JSON.parse(formattedInput);
        } catch {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Invalid JSON format. Please provide a valid ABI JSON." },
          ]);
          return;
        }

        if (!inputData.name || !Array.isArray(inputData.methods)) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Invalid ABI format. Must include 'name' and 'methods' array." },
          ]);
          return;
        }

        // ✅ Generate all functions from this contract ABI
        const generatedFunctions = generateIntegrationFunction(inputData).join("\n\n");

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Generated functions:\n\`\`\`typescript\n${generatedFunctions}\n\`\`\``,
          },
        ]);

        setGenerateCommand(false);
        return;
      }

      if (!generateCommand) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Hey, I'm Trix! If you wanna generate an integration function, write 'generate_function' and follow the steps. 🚀",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error processing input. Please try again." },
      ]);
    }
  };



  //handles cross chain
  const handleCrossChainSubmit = async (
    userInput: string,
    setMessages: (fn: (prev: any[]) => any[]) => void,
    setState?: (state: CrossChainState) => void
  ) => {
    const state: CrossChainState = crossChainState;

    const lowerInput = userInput.toLowerCase();

    // Initial action determination
    if (lowerInput.includes("send") || lowerInput.includes("transfer")) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'll help you send tokens across chains. First, which chain would you like to send from? (Please provide the chain ID)",
        },
      ]);
      state.action = "sendOFT";
      setState?.(state);
      return;
    }

    if (
      lowerInput.includes("set peer") ||
      lowerInput.includes("configure peer")
    ) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'll help you set up peers between chains. What's the source chain ID?",
        },
      ]);
      state.action = "setPeer";
      setState?.(state);
      return;
    }

    // Handle chain ID inputs
    const chainIdMatch = userInput.match(/\d+/);
    if (chainIdMatch && state.srcChainId === "") {
      state.srcChainId = chainIdMatch[0];
      if (state.action === "sendOFT") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Great, sending from chain ${state.srcChainId}. Which chain would you like to send to? (Please provide the destination chain ID)`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Source chain ${state.srcChainId} set. What's the destination chain ID?`,
          },
        ]);
      }
      setState?.(state);
      return;
    }

    if (chainIdMatch && state.destChainId === "") {
      state.destChainId = chainIdMatch[0];
      if (state.action === "sendOFT") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Perfect. How many tokens would you like to send?`,
          },
        ]);
      } else {
        // For setPeer, we can now execute
        const confirmMessage = `I'll set up peers between chain ${state.srcChainId} and chain ${state.destChainId}. Is this correct? (yes/no)`;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: confirmMessage,
          },
        ]);
      }
      setState?.(state);
      return;
    }

    // Handle amount for sendOFT
    const amountMatch = userInput.match(/(\d+(\.\d+)?)/);
    if (state.action === "sendOFT" && amountMatch && !state.amount) {
      state.amount = amountMatch[1];
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Got it. What's the receiving wallet address? (Please provide the 0x address)`,
        },
      ]);
      setState?.(state);
      return;
    }

    // Handle address for sendOFT
    const addressMatch = userInput.match(/(0x[a-fA-F0-9]{40})/);
    if (
      state.action === "sendOFT" &&
      addressMatch &&
      !state.receivingAccountAddress
    ) {
      state.receivingAccountAddress = addressMatch[0];
      const confirmMessage = `I'll send ${state.amount} tokens from chain ${state.srcChainId} to chain ${state.destChainId}, to address ${state.receivingAccountAddress}. Is this correct? (yes/no)`;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: confirmMessage,
        },
      ]);
      setState?.(state);
      return;
    }

    // Handle confirmation
    if (lowerInput === "yes" || lowerInput === "y") {
      try {
        const response = await fetch("/api/cross-chain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...state,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          const successMessage =
            state.action === "sendOFT"
              ? `Successfully sent ${state.amount} tokens from chain ${state.srcChainId} to chain ${state.destChainId} Verify Transaction : ${data.url}`
              : `Successfully set up peers between chain ${state.srcChainId} and chain ${state.destChainId}`;

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                successMessage +
                "\n\nIs there anything else I can help you with?",
            },
          ]);
        } else {
          throw new Error(data.message || "Transaction failed");
        }
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${error instanceof Error ? error.message : "Transaction failed"
              }`,
          },
        ]);
      }
      setState?.({
        action: null,
        srcChainId: "",
        destChainId: "",
        amount: "",
        receivingAccountAddress: "",
      });
    } else if (lowerInput === "no" || lowerInput === "n") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Let's start over. What would you like to do? You can send tokens or set up peers.",
        },
      ]);
      setState?.({
        action: null,
        srcChainId: "",
        destChainId: "",
        amount: "",
        receivingAccountAddress: "",
      });
    }
  };

  // Main handleSubmit function
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim()) return;

    setError("");
    setLoading(true);

    const currentInput = userInput;

    // Append the user's message to the conversation and clear input.
    setMessages((prev) => [...prev, { role: "user", content: currentInput }]);
    setUserInput("");

    let response;

    try {
      switch (activeTab) {
        case "mint":
          response = await handleMintSubmit(currentInput);
          if (!response) return; 
          break;

        case "swap-tokens":
          response = await handleSwapSubmit(currentInput);
          if (!response) return; // Early return if mint flow ended early
          break;

        case "transfer-token":
          response = await handleTransferToken(currentInput);
          if (!response) return; // Early return if mint flow ended early
          break;

        case "transfer-native-token":
          response = await handleTransferNativeToken(currentInput);
          if (!response) return; // Early return if mint flow ended early
          break;

        case "mint-token":
          response = await handleMintTokenSubmit(currentInput);
          if (!response) return; 
          break;

        case "get-quotes":
          response = await handleGetQuotes(currentInput);
          if (!response) return; 
          break;
        // case "swap":
        //   await handleSwapSubmit(currentInput, setMessages, setSwapState);
        //   return;
        case "cross-chain":
          await handleCrossChainSubmit(
            currentInput,
            setMessages,
            setCrossChainState
          );
          return; // Early return as we're handling messages in the function
        case "lend":
          response = await handleLendingSubmit();
          break;
        case "trade":
          response = await handleTradeSubmit();
          break;
        case "generate":
          response = await handleGenerateSubmit(currentInput, setMessages);
          break;
        case "algorand-helper":
          response = await handleAlgorandHelperSubmit(currentInput, setMessages);
          break;
        case "ecosystem-project":
          response = await handleEcosystemProjectSubmit(currentInput);
          break;
        case "nfd-names":
          response = await handleNFDNamesSubmit(currentInput, setMessages);
          if (!response) return; // Early return if flow is handled internally
          break;
        case "general":
          response = await handleGeneralSubmit(currentInput);
          break;
        default:
          response = await handleGeneralSubmit(currentInput);
          break;
      }

      if (response) {
        const data = await response.json();
        console.log({ data });
        if (data.error) {
          setError(data.error);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `❌ Error: ${data.error}` },
          ]);
          // Reset NFD lookup state on error so user can start a new operation
          if (activeTab === "nfd-names") {
            setPendingNFDLookup(null);
          }
          return;
        }
        
        // Format NFD response
        if (activeTab === "nfd-names" && data.data) {
          const formattedContent = formatNFDResponse(data);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: formattedContent },
          ]);
          // Reset NFD lookup state so user can start a new operation
          setPendingNFDLookup(null);
          return;
        }
        
        // For minting, you might want to extract and show the transaction link from data.data
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.data },
        ]);
      }
    } catch (err) {
      setError("Failed to process request. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <BrainCircuit size={20} /> },
    {
      id: "generate",
      label: "Coding Helper",
      icon: <Code2Icon size={20} />,
    },
    { id: "mint-token", label: "Mint Tokens", icon: <ArrowBigUp size={20} /> },
    { id: "lend", label: "Lending", icon: <PiggyBank size={20} /> },
    { id: "trade", label: "Trading", icon: <LineChart size={20} /> },
    { id: "get-quotes", label: "Get Quotes", icon: <ChartNoAxesCombined size={20} /> },
    { id: "transfer-native-token", label: "Transfer ALGO", icon: <HandCoins size={20} /> },
    { id: "transfer-token", label: "Transfer Tokens", icon: <HandCoins size={20} /> },
    {
      id: "swap-tokens",
      label: "Swap Tokens",
      icon: <ArrowRightLeft size={20} />,
    },
    { id: "mint", label: "Mint", icon: <ImagePlay size={20} /> },
    {
      id: "algorand-helper",
      label: "Algorand Helper",
      icon: (
        <Image
          className="text-gray-400 w-7 h-7 rounded-full"
          src="https://s2.coinmarketcap.com/static/img/coins/200x200/4030.png"
          alt="Assistant"
          width={20}
          height={20}
        />
      ),
    },
    {
      id: "ecosystem-project",
      label: "Ecosystem Projects",
      icon: <Network size={20} />,
    },
    {
      id: "nfd-names",
      label: "Algorand NFD Names",
      icon: <Tag size={20} />,
    },
  ];

  const visibleTabs = activeAddress
    ? tabs
    : tabs.filter((tab) => tab.id === "general" || tab.id === "ecosystem-project" || tab.id === "nfd-names");



  const StarField = () => {
    return (
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7,
              animation: `twinkle ${Math.random() * 5 + 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen relative overflow-hidden font-sans">
      <StarField />

      {/* Sidebar with glass morphism */}
      <div className="w-72 bg-black/40 backdrop-blur-xl p-6 flex flex-col border-r border-gray-500/20 z-10 shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 flex items-center gap-3 mb-4">
            <Image
              className="text-gray-400 w-10 h-10 rounded-full"
              src="https://s2.coinmarketcap.com/static/img/coins/200x200/4030.png"
              alt="Assistant"
              width={20}
              height={20}
            />
            Algorand TRIX
          </h1>
          <div className="transform transition-all duration-300 hover:scale-105 mt-4">
            <Connect />
          </div>
        </div>

        {/* {activeAddress && (
          <div className="my-0 mb-4 bg-gray-900/10 p-4  rounded-xl border border-gray-500/20">
            <label className="block text-sm font-medium text-white mb-2">
              {activeNetwork}
            </label>
          </div>
        )} */}

        <div className="space-y-2 flex-1">
          <h3 className="text-xs uppercase text-gray-400/70 mb-3 font-semibold tracking-wider">
            Features
          </h3>
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                ? "bg-gradient-to-r from-gray-500/20 to-black/20 text-white border border-gray-500/20 shadow-lg shadow-gray-500/5"
                : "text-gray-300 hover:bg-gray-500/10"
                }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-500/10 text-xs text-gray-400/60 flex items-center gap-2">
          <RefreshCw size={12} />
          <span>Updated Sep 11, 2025</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-black/60 to-gray-900/10 backdrop-blur-md">
        {messages.length === 0 && !(activeTab === "algorand-helper") && !(activeTab === "ecosystem-project") && !(activeTab === "nfd-names") ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="rounded-full bg-gray-500/10 p-6 mb-6">
              <Image
                className="text-gray-400 w-150 h-150 rounded-full"
                src="https://s2.coinmarketcap.com/static/img/coins/200x200/4030.png"
                alt="Assistant"
                width={100}
                height={100}
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-100 mb-3">
              Trix Algorand AI Assistant
            </h2>
            <p className="text-gray-300 text-center max-w-md mb-8">
              Your personal crypto and DeFi guide. Ask me anything about tokens,
              trading, NFTs, or general questions.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              {[
                "Tell me about DeFi yield strategies",
                "How to swap Algo to ETH efficiently?",
                "Generate an NFT with cosmic theme",
                "Analyze Algo price trend",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserInput(suggestion);
                  }}
                  className="bg-gray-500/10  hover:bg-gray-500/20 text-gray-200 p-4 rounded-xl border border-gray-100/10 text-left transition-all duration-200 hover:border-gray-500/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : messages.length === 0 && activeTab === "algorand-helper" ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="rounded-full bg-gray-500/10 mb-6 flex items-center justify-center">
                <img
                  className="text-gray-400 w-20 h-20 rounded-full"
                  src="https://s2.coinmarketcap.com/static/img/coins/200x200/4030.png"
                />
              </div>
              <h2 className="text-2xl text-gray-100 mb-3 font-bold">
                TRIX Algorand Helper
              </h2>
              <p className=" text-center max-w-md mb-8 text-yellow-400">
                Trix will help you with any queries related to Algorand Ecosystem.
                Oracles, RPCs, Contracts etc.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
                {[
                  "List of all Supported Account Abstractions",
                  "List of all Supported Cross Chains ",
                  "List of all Supported Wallet Infra",
                  "List of all Supported RPC's with URL",
                  "List of all Supported Indexers",
                  "List of all Supported Oracles",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserInput(suggestion);
                    }}
                    className="bg-gray-500/10 whitespace-nowrap hover:bg-gray-500/20 text-gray-200 p-4 rounded-xl border border-gray-500/10 text-left transition-all duration-200 hover:border-gray-500/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : messages.length === 0 && activeTab === "ecosystem-project" ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="rounded-full bg-gray-500/10 mb-6 flex items-center justify-center">
                <Network className="text-gray-400 w-20 h-20" size={80} />
              </div>
              <h2 className="text-2xl text-gray-100 mb-3 font-bold">
                Algorand Ecosystem Projects
              </h2>
              <p className="text-center max-w-md mb-8 text-yellow-400">
                Discover and learn about projects in the Algorand ecosystem. Ask about wallets, DEXs, SDKs, tools, and more!
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
                {[
                  "List all wallets in the ecosystem",
                  "Show me DEX projects on Algorand",
                  "What SDKs are available for Algorand?",
                  "List all block explorers",
                  "Show projects with GitHub repositories",
                  "What are the best DeFi projects?",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserInput(suggestion);
                    }}
                    className="bg-gray-500/10 whitespace-nowrap hover:bg-gray-500/20 text-gray-200 p-4 rounded-xl border border-gray-500/10 text-left transition-all duration-200 hover:border-gray-500/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : messages.length === 0 && activeTab === "nfd-names" ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="rounded-full bg-gray-500/10 mb-6 flex items-center justify-center">
                <Tag className="text-gray-400 w-20 h-20" size={80} />
              </div>
              <h2 className="text-2xl text-gray-100 mb-3 font-bold">
                Algorand NFD Names
              </h2>
              <p className="text-center max-w-md mb-8 text-yellow-400">
                Look up Algorand NameFi Domains (NFD) names and addresses. Four operations available: resolve name to address, reverse lookup address to names, get all NFDs for an address, or mint a new NFD name.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
                {[
                  "Resolve NFD name to address",
                  "Reverse lookup: Address to NFD names",
                  "Get all NFDs for an address",
                  "Mint NFD name",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserInput(suggestion);
                    }}
                    className="bg-gray-500/10 whitespace-nowrap hover:bg-gray-500/20 text-gray-200 p-4 rounded-xl border border-gray-500/10 text-left transition-all duration-200 hover:border-gray-500/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-500/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex max-w-5xl mx-auto ${message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
              >
                <div
                  className={`flex items-start gap-4 max-w-4xl ${message.role === "assistant"
                    ? "bg-[#212121] backdrop-blur-sm border border-gray-500/10"
                    : "bg-indigo-400 text-black font-bold"
                    } p-5 rounded-2xl shadow-lg transition-all duration-500 hover:shadow-gray-500/20`}
                >
                  {/* Avatar */}
                  {message.role === "assistant" ? (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500/10">
                        <img
                          className="w-10 h-10 rounded-full"
                          src="https://s2.coinmarketcap.com/static/img/coins/200x200/4030.png"
                          alt="Assistant"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-700 to-indigo-500 shadow-md">
                        <Blocks className="text-white" size={20} />
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="flex-1">
                    <ResponseDisplay response={message.content} />
                  </div>
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {loading && (
              <div className="flex max-w-5xl mx-auto justify-start">
                <div className="flex items-start gap-4 max-w-4xl bg-[#212121] backdrop-blur-sm border border-gray-500/10 p-5 rounded-2xl rounded-tl-sm shadow-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-500/10">
                      <img
                        className="w-10 h-10 rounded-full"
                        src="https://s2.coinmarketcap.com/static/img/coins/200x200/4030.png"
                        alt="Assistant"
                      />
                    </div>
                  </div>
                  <ResponseDisplay response={null} isLoading={true} />
                </div>
              </div>
            )}
          </div>

        )}

        <div className="border-t border-gray-500/10 p-6 bg-black/60 backdrop-blur-xl">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-4 max-w-5xl mx-auto relative"
          >
            <div className="flex-1 relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !activeAddress
                    ? "Connect your wallet or ask general questions..."
                    : activeTab === "swap"
                      ? "e.g., 'Swap 0.1 ETH to USDC with best rate'"
                      : activeTab === "lend"
                        ? "e.g., 'Find best lending rates for ETH'"
                        : activeTab === "trade"
                          ? "e.g., 'Analyze ETH/USDC trading opportunities'"
                          : activeTab === "mint"
                            ? "e.g., 'Create cosmic galaxy NFT with gray theme'"
                            : activeTab === "generate"
                              ? "e.g., 'Generate your any abi function signature into integration function'"
                              : activeTab === "cross-chain"
                                ? "e.g., 'Transfer Your Tokens From One Chain to Other Chain'"
                                : activeTab === "algorand-helper"
                                  ? "e.g., 'Ask Anything You Want From Algorand Ecosystem :  Oracles , RPC's , Contracts etc'"
                                  : activeTab === "ecosystem-project"
                                    ? "e.g., 'List all wallets in the ecosystem'"
                                    : activeTab === "nfd-names"
                                      ? "e.g., 'Resolve NFD name to address' or 'Find NFD name for an address'"
                                      : activeTab === "mint-token"
                                    ? "e.g., 'Mint your personalized tokens in single prompt'" : activeTab === "get-quotes"
                                      ? "e.g., 'Get any token quotes by just ticker'" : activeTab === "transfer-token"
                                        ? "e.g., 'Transfer Tokens to Receiver Just By Communication'" : activeTab === "transfer-native-token"
                                          ? "e.g., 'Transfer Native Algo Tokens to Receiver Just By Communication'" : "Ask me anything..."
                }
                className="w-full bg-black/50 border border-gray-500/20 rounded-2xl p-4 pb-12 text-gray-100 placeholder-gray-100/50 focus:ring-2 focus:ring-gray-500/50 focus:border-transparent resize-none h-24 transition-all duration-200 focus:shadow-lg focus:shadow-gray-500/10"
              />
              {error && (
                <div className="absolute bottom-3 left-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {messages.length > 0 && !loading && (
                <div className="absolute bottom-3 left-4 text-gray-400/70 text-xs flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Algorand Trix is ready to assist</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={
                loading ||
                (!activeAddress && activeTab !== "general" && activeTab !== "ecosystem-project" && activeTab !== "nfd-names") ||
                !userInput.trim()
              }
              className="bg-gradient-to-r from-gray-500 to-white hover:from-gray-600 hover:to-gray-400 disabled:from-gray-600 disabled:to-gray-700 text-white p-4 rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/20 disabled:shadow-none h-12 w-12 mb-2"
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Send size={18} color="black" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
