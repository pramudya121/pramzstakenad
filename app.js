// src/App.js
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import stakingAbi from './abi/Staking.json';

const STAKING_ADDRESS = '0x1Bb4576c12374B46DfA83d666d2CDa5Ab4aA1eBE';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [staked, setStaked] = useState('0');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(STAKING_ADDRESS, stakingAbi, signer);

        setProvider(ethProvider);
        setSigner(signer);
        setContract(contract);
        setAddress(address);
        updateBalance(contract, address);
      }
    };
    init();
  }, []);

  const updateBalance = async (contract, addr) => {
    const bal = await contract.myStakedBalance(addr);
    setStaked(ethers.formatUnits(bal, 18));
  };

  const stake = async () => {
    if (!amount) return;
    try {
      const tx = await contract.stake(ethers.parseUnits(amount, 18));
      await tx.wait();
      alert("Staked!");
      updateBalance(contract, address);
    } catch (e) {
      alert("Stake failed");
    }
  };

  const unstake = async () => {
    if (!amount) return;
    try {
      const tx = await contract.unstake(ethers.parseUnits(amount, 18));
      await tx.wait();
      alert("Unstaked!");
      updateBalance(contract, address);
    } catch (e) {
      alert("Unstake failed");
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: 'sans-serif' }}>
      <h2>🪙 Monad Staking</h2>
      <p><strong>Wallet:</strong> {address}</p>
      <p><strong>Staked Balance:</strong> {staked}</p>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <br /><br />
      <button onClick={stake}>Stake</button>
      <button onClick={unstake}>Unstake</button>
    </div>
  );
}

export default App;
