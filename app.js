// Configuration - Fill these with your contract details
const config = {
    stakingContractAddress: "0x...", // Will be filled by user
    tokenContractAddress: "0x...",   // Will be filled by user
    chainId: 56, // Default to BSC (CHANGE as needed)
};

// Global variables
let provider;
let signer;
let stakingContract;
let tokenContract;
let userAddress;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    initializeElements();
    await loadABI();
    
    // Check if wallet is already connected
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            await connectWallet();
        }
    }
});

function initializeElements() {
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    document.getElementById('stakeBtn').addEventListener('click', stakeTokens);
    document.getElementById('unstakeBtn').addEventListener('click', unstakeTokens);
}

async function loadABI() {
    try {
        const response = await fetch('abi.json');
        const abi = await response.json();
        
        // Initialize contract objects
        if (window.ethereum) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            // Initialize contracts with ABI and address
            stakingContract = new ethers.Contract(
                config.stakingContractAddress, 
                abi.stakingAbi, 
                signer
            );
            
            tokenContract = new ethers.Contract(
                config.tokenContractAddress, 
                abi.tokenAbi, 
                signer
            );
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    connectWallet();
                } else {
                    resetWalletConnection();
                }
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    } catch (error) {
        console.error("Error loading ABI:", error);
    }
}

async function connectWallet() {
    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        
        // Verify network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (parseInt(chainId) !== config.chainId) {
            alert(`Please switch to network with ID: ${config.chainId}`);
            return;
        }
        
        // Update UI
        document.getElementById('walletStatus').textContent = "Connected";
        document.getElementById('walletAddress').textContent = userAddress;
        document.getElementById('connectWalletBtn').textContent = "Connected";
        
        // Enable buttons
        document.getElementById('stakeBtn').disabled = false;
        document.getElementById('unstakeBtn').disabled = false;
        
        // Load balances
        await updateBalances();
    } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. Please try again.");
    }
}

function resetWalletConnection() {
    userAddress = null;
    document.getElementById('walletStatus').textContent = "Not Connected";
    document.getElementById('walletAddress').textContent = "-";
    document.getElementById('connectWalletBtn').textContent = "Connect Wallet";
    
    document.getElementById('stakeBtn').disabled = true;
    document.getElementById('unstakeBtn').disabled = true;
}

async function updateBalances() {
    if (!userAddress) return;
    
    try {
        // Token balance
        const tokenBalance = await tokenContract.balanceOf(userAddress);
        document.getElementById('tokenBalance').textContent = ethers.utils.formatUnits(tokenBalance, 18);
        
        // Staked balance
        const stakedBalance = await stakingContract.balanceOf(userAddress);
        document.getElementById('stakedBalance').textContent = ethers.utils.formatUnits(stakedBalance, 18);
        
        // Rewards
        const rewards = await stakingContract.earned(userAddress);
        document.getElementById('rewardsBalance').textContent = ethers.utils.formatUnits(rewards, 18);
    } catch (error) {
        console.error("Error updating balances:", error);
    }
}

async function stakeTokens() {
    const amount = document.getElementById('stakeAmount').value;
    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid stake amount");
        return;
    }
    
    try {
        const amountWei = ethers.utils.parseUnits(amount, 18);
        
        // Check allowance
        const allowance = await tokenContract.allowance(userAddress, config.stakingContractAddress);
        if (allowance.lt(amountWei)) {
            // Approve first
            const txApprove = await tokenContract.approve(config.stakingContractAddress, amountWei);
            await txApprove.wait();
        }
        
        // Stake
        const txStake = await stakingContract.stake(amountWei);
        await txStake.wait();
        
        // Update balances
        await updateBalances();
        alert("Tokens staked successfully!");
    } catch (error) {
        console.error("Error staking tokens:", error);
        alert("Failed to stake tokens. Please try again.");
    }
}

async function unstakeTokens() {
    const amount = document.getElementById('unstakeAmount').value;
    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid unstake amount");
        return;
    }
    
    try {
        const amountWei = ethers.utils.parseUnits(amount, 18);
        
        // Unstake
        const txUnstake = await stakingContract.withdraw(amountWei);
        await txUnstake.wait();
        
        // Update balances
        await updateBalances();
        alert("Tokens unstaked successfully!");
    } catch (error) {
        console.error("Error unstaking tokens:", error);
        alert("Failed to unstake tokens. Please try again.");
    }
}
