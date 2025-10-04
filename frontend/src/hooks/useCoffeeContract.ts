import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useAccount, useChainId } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ABI, CONTRACT_ADDRESSES } from "../contracts/config";

export function useCoffeeContract() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  // Read contract data
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "owner",
  });

  const { data: totalCoffees } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "totalCoffees",
  });

  const { data: totalDonations } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "totalDonations",
  });

  const {
    data: balance,
    error: balanceError,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
  } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: "getBalance",
  });

  // Write contract functions
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash, // Only run when we have a hash
    },
  });

  const buyCoffee = async (message: string, amount: string) => {
    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }

    try {
      console.log("Buying coffee with:", { message, amount, contractAddress });
      writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: "buyCoffee",
        args: [message],
        value: parseEther(amount),
        gas: 300000n, // Set explicit gas limit
      });
    } catch (err) {
      console.error("Error in buyCoffee:", err);
      throw err;
    }
  };

  const withdraw = async () => {
    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }

    try {
      console.log("Withdrawing from contract:", contractAddress);
      writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: "withdraw",
        gas: 100000n, // Set explicit gas limit
      });
    } catch (err) {
      console.error("Error in withdraw:", err);
      throw err;
    }
  };

  const initializeContract = async () => {
    if (!contractAddress) {
      throw new Error("Contract not deployed on this network");
    }

    try {
      console.log("Initializing contract:", contractAddress);
      writeContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: "init",
        gas: 200000n, // Set explicit gas limit
      });
    } catch (err) {
      console.error("Error in initializeContract:", err);
      throw err;
    }
  };

  const isOwner =
    address &&
    owner &&
    address.toLowerCase() === (owner as string).toLowerCase();

  return {
    // Contract data
    owner,
    totalCoffees: totalCoffees ? Number(totalCoffees) : 0,
    totalDonations: totalDonations
      ? formatEther(totalDonations as bigint)
      : "0",
    balance: balance ? formatEther(balance as bigint) : "0",
    isOwner,

    // Contract functions
    buyCoffee,
    withdraw,
    initializeContract,
    reset, // Add reset function to clear transaction state

    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error: error || receiptError, // Include both write and receipt errors
    hash,
    receipt, // Add receipt data

    // Debug info
    contractAddress,
    chainId,

    // Balance debug info
    balanceError,
    isBalanceError,
    isBalanceLoading,
  };
}
