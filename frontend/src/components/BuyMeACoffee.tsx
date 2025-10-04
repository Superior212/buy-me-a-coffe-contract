import { useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCoffeeContract } from "@/hooks/useCoffeeContract";
import { Coffee, Heart, Users, DollarSign } from "lucide-react";

export function BuyMeACoffee() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("0.001");

  const {
    totalCoffees,
    totalDonations,
    balance,
    isOwner,
    buyCoffee,
    withdraw,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    receipt,
    reset,
    contractAddress,
    balanceError,
    isBalanceError,
    isBalanceLoading,
  } = useCoffeeContract();

  const handleBuyCoffee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      console.log("Starting buyCoffee transaction...");
      console.log("Contract address:", contractAddress);
      await buyCoffee(message, amount);
      console.log("Transaction submitted, hash:", hash);
    } catch (err) {
      console.error("Error buying coffee:", err);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw();
    } catch (err) {
      console.error("Error withdrawing:", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Coffee className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Buy Me A Coffee</CardTitle>
            <CardDescription>
              Support my work by buying me a coffee! Connect your wallet to get
              started.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={openConnectModal} size="lg" className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <Coffee className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Buy Me A Coffee</h1>
        <p className="text-gray-600 mt-2">
          Support my work by buying me a coffee! Every contribution helps me
          create more content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Coffee className="w-5 h-5 text-amber-600 mr-2" />
              <span className="text-2xl font-bold">{totalCoffees}</span>
            </div>
            <p className="text-sm text-gray-600">Coffees Bought</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                {parseFloat(totalDonations).toFixed(4)} ETH
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold">
                {isBalanceLoading
                  ? "Loading..."
                  : isBalanceError
                  ? "Error"
                  : parseFloat(balance).toFixed(4)}{" "}
                ETH
              </span>
            </div>
            <p className="text-sm text-gray-600">Contract Balance</p>
            {isBalanceError && (
              <p className="text-xs text-red-500 mt-1">
                {balanceError?.message || "Failed to load balance"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buy Coffee Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coffee className="w-5 h-5 mr-2" />
              Buy Me A Coffee
            </CardTitle>
            <CardDescription>
              Send a message and some ETH to show your support!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBuyCoffee} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.001"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: 0.001 ETH</p>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message of support..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending || isConfirming || !message.trim()}>
                {isPending
                  ? "Preparing..."
                  : isConfirming
                  ? "Confirming..."
                  : "Buy Coffee"}
              </Button>

              {/* Transaction Status */}
              {hash && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Transaction Hash:{" "}
                    <code className="font-mono text-xs">{hash}</code>
                  </p>
                  {isConfirming && (
                    <p className="text-sm text-blue-600 mt-1">
                      ⏳ Waiting for confirmation...
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">
                    ❌ Error: {error.message || error.toString()}
                  </p>
                  <button
                    onClick={reset}
                    className="text-xs text-red-500 underline mt-1">
                    Clear Error
                  </button>
                </div>
              )}

              {isConfirmed && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">
                    ✅ Coffee bought successfully!
                  </p>
                  {receipt && (
                    <p className="text-xs text-green-500 mt-1">
                      Gas used: {receipt.gasUsed?.toString()}
                    </p>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Owner Actions */}
        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Owner Actions
              </CardTitle>
              <CardDescription>
                You are the contract owner. You can withdraw funds here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Contract Balance:{" "}
                  <span className="font-semibold">
                    {parseFloat(balance).toFixed(4)} ETH
                  </span>
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                className="w-full"
                disabled={
                  isPending || isConfirming || parseFloat(balance) === 0
                }
                variant="outline">
                {isPending
                  ? "Preparing..."
                  : isConfirming
                  ? "Confirming..."
                  : "Withdraw Funds"}
              </Button>

              {parseFloat(balance) === 0 && (
                <p className="text-sm text-gray-500">No funds to withdraw</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
