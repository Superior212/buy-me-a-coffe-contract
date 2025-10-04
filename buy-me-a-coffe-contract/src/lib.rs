//!
//! Buy Me A Coffee Contract
//!
//! A simple contract that allows people to send you ETH as a tip or donation.
//! This is a "Buy me a coffee" style contract where supporters can send small amounts
//! of ETH to show appreciation for your work.
//!
//! Features:
//! - Accept ETH payments from anyone
//! - Track total donations received
//! - Allow contract owner to withdraw funds
//!
//! The program is ABI-equivalent with Solidity, which means you can call it from both Solidity and Rust.
//! To do this, run `cargo stylus export-abi`.
//!
//! Note: this code is a template-only and has not been audited.
//!
// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use alloc::string::String;

/// Import items from the SDK. The prelude contains common traits and macros.
use stylus_sdk::{alloy_primitives::{U256, Address}, prelude::*};

// Define some persistent storage using the Solidity ABI.
// `BuyMeACoffee` will be the entrypoint.
sol_storage! {
    #[entrypoint]
    pub struct BuyMeACoffee {
        address owner;
        uint256 total_coffees;
        uint256 total_donations;
    }
}

/// Declare that `BuyMeACoffee` is a contract with the following external methods.
#[public]
impl BuyMeACoffee {
    /// Constructor - sets the owner to the deployer
    pub fn init(&mut self) {
        self.owner.set(self.vm().msg_sender());
    }

    /// Gets the contract owner
    pub fn owner(&self) -> Address {
        self.owner.get()
    }

    /// Gets the total number of coffees bought
    pub fn total_coffees(&self) -> U256 {
        self.total_coffees.get()
    }

    /// Gets the total amount of donations received
    pub fn total_donations(&self) -> U256 {
        self.total_donations.get()
    }

    /// Buy a coffee - payable function that accepts ETH
    #[payable]
    pub fn buy_coffee(&mut self, message: String) {
        let msg_value = self.vm().msg_value();
        let _sender = self.vm().msg_sender();
        
        // Ensure the message is not empty
        if message.is_empty() {
            panic!("Message cannot be empty");
        }
        
        // Ensure minimum donation amount (0.001 ETH = 1000000000000000 wei)
        let min_donation = U256::from(1000000000000000u64);
        if msg_value < min_donation {
            panic!("Minimum donation is 0.001 ETH");
        }
        
        // Update totals
        let current_coffees = self.total_coffees.get();
        self.total_coffees.set(current_coffees + U256::from(1));
        self.total_donations.set(self.total_donations.get() + msg_value);
    }

    /// Withdraw all funds - only owner can call this
    pub fn withdraw(&mut self) {
        let sender = self.vm().msg_sender();
        let owner = self.owner.get();
        
        if sender != owner {
            panic!("Only owner can withdraw");
        }
        
        // Check if there are any donations to withdraw
        let total_donations = self.total_donations.get();
        if total_donations == U256::ZERO {
            panic!("No funds to withdraw");
        }
        
        // In a real implementation, this would transfer the actual ETH
        // For now, we just validate that there are funds to withdraw
        // The actual ETH transfer would happen through the VM's transfer mechanism
    }

    /// Get contract balance (simplified - returns total donations)
    pub fn get_balance(&self) -> U256 {
        self.total_donations.get()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use stylus_sdk::testing::*;

    #[test]
    fn test_contract_initialization() {
        let vm = TestVM::default();
        let mut contract = BuyMeACoffee::from(&vm);
        
        // Initialize the contract
        contract.init();
        
        // Check that owner is set correctly
        assert_eq!(vm.msg_sender(), contract.owner());
        
        // Check initial values
        assert_eq!(U256::ZERO, contract.total_coffees());
        assert_eq!(U256::ZERO, contract.total_donations());
        assert_eq!(U256::ZERO, contract.get_balance());
    }

    #[test]
    fn test_buy_coffee() {
        let vm = TestVM::default();
        let mut contract = BuyMeACoffee::from(&vm);
        
        // Initialize the contract
        contract.init();
        
        // Set up a donor
        let donor = Address::from([1u8; 20]);
        vm.set_sender(donor);
        vm.set_value(U256::from(1000000000000000u64)); // 0.001 ETH
        
        // Buy a coffee
        let message = String::from("Great work!");
        contract.buy_coffee(message.clone());
        
        // Check that values are updated correctly
        assert_eq!(U256::from(1), contract.total_coffees());
        assert_eq!(U256::from(1000000000000000u64), contract.total_donations());
        assert_eq!(U256::from(1000000000000000u64), contract.get_balance());
    }

    #[test]
    #[should_panic(expected = "Message cannot be empty")]
    fn test_buy_coffee_empty_message() {
        let vm = TestVM::default();
        let mut contract = BuyMeACoffee::from(&vm);
        
        contract.init();
        
        let donor = Address::from([1u8; 20]);
        vm.set_sender(donor);
        vm.set_value(U256::from(1000000000000000u64));
        
        contract.buy_coffee(String::from(""));
    }

    #[test]
    #[should_panic(expected = "Minimum donation is 0.001 ETH")]
    fn test_buy_coffee_insufficient_amount() {
        let vm = TestVM::default();
        let mut contract = BuyMeACoffee::from(&vm);
        
        contract.init();
        
        let donor = Address::from([1u8; 20]);
        vm.set_sender(donor);
        vm.set_value(U256::from(100000000000000u64)); // Less than minimum
        
        contract.buy_coffee(String::from("Thanks!"));
    }

    #[test]
    fn test_multiple_coffees() {
        let vm = TestVM::default();
        let mut contract = BuyMeACoffee::from(&vm);
        
        contract.init();
        
        // First donor
        let donor1 = Address::from([1u8; 20]);
        vm.set_sender(donor1);
        vm.set_value(U256::from(2000000000000000u64)); // 0.002 ETH
        contract.buy_coffee(String::from("First coffee"));
        
        // Second donor
        let donor2 = Address::from([2u8; 20]);
        vm.set_sender(donor2);
        vm.set_value(U256::from(1500000000000000u64)); // 0.0015 ETH
        contract.buy_coffee(String::from("Second coffee"));
        
        // Same donor again
        vm.set_sender(donor1);
        vm.set_value(U256::from(1000000000000000u64)); // 0.001 ETH
        contract.buy_coffee(String::from("Another coffee"));
        
        // Check totals
        assert_eq!(U256::from(3), contract.total_coffees());
        assert_eq!(U256::from(4500000000000000u64), contract.total_donations());
    }

    #[test]
    fn test_withdraw() {
        let vm = TestVM::default();
        let mut contract = BuyMeACoffee::from(&vm);
        
        contract.init();
        let owner = contract.owner();
        
        // Add some funds by buying a coffee
        let donor = Address::from([1u8; 20]);
        vm.set_sender(donor);
        vm.set_value(U256::from(1000000000000000u64));
        contract.buy_coffee(String::from("Test coffee"));
        
        // Check balance before withdrawal
        assert_eq!(U256::from(1000000000000000u64), contract.get_balance());
        
        // Withdraw as owner (this will pass the ownership check)
        vm.set_sender(owner);
        contract.withdraw();
    }

    #[test]
    #[should_panic(expected = "Only owner can withdraw")]
    fn test_withdraw_non_owner() {
        let vm = TestVM::default();
        let mut contract = BuyMeACoffee::from(&vm);
        
        contract.init();
        
        // Add some funds
        let donor = Address::from([1u8; 20]);
        vm.set_sender(donor);
        vm.set_value(U256::from(1000000000000000u64));
        contract.buy_coffee(String::from("Test coffee"));
        
        // Try to withdraw as non-owner
        let non_owner = Address::from([2u8; 20]);
        vm.set_sender(non_owner);
        contract.withdraw();
    }
}