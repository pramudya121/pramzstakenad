let web3;
let contract;
const contractAddress = "0xF9FF43225aA47fA308970f30d1aEd8c4c5e6F74e"; 

// Fungsi untuk koneksi wallet
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);

      // Inisialisasi kontrak
      contract = new web3.eth.Contract(abi, contractAddress);

      const accounts = await web3.eth.getAccounts();
      alert(`Wallet connected: ${accounts[0]}`);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  } else {
    alert("MetaMask belum terpasang!");
  }
}

// Fungsi untuk staking (kirim ETH ke kontrak)
async function stake() {
  const amount = document.getElementById("stakeAmount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Masukkan jumlah ETH yang valid.");
    return;
  }

  const accounts = await web3.eth.getAccounts();
  const valueInWei = web3.utils.toWei(amount, "ether");

  try {
    await contract.methods.stake().send({
      from: accounts[0],
      value: valueInWei
    });
    alert("Staking berhasil!");
  } catch (err) {
    console.error("Staking gagal:", err);
    alert("Staking gagal. Cek console untuk detail.");
  }
}

// Fungsi untuk withdraw (tarik + reward)
async function withdraw() {
  const accounts = await web3.eth.getAccounts();

  try {
    await contract.methods.withdraw().send({
      from: accounts[0]
    });
    alert("Withdraw berhasil!");
  } catch (err) {
    console.error("Withdraw gagal:", err);
    alert("Withdraw gagal. Cek console untuk detail.");
  }
}
