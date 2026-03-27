/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, User, Package, Map, Play, RefreshCw, Trophy, Skull } from 'lucide-react';
import { Web3Provider, useWeb3 } from './Web3Context';
import { MONSTERS, CARDS, WEAPON_POOL, BACKGROUND_IMAGE } from './constants';
import { cn } from './lib/utils';

type GameMode = 'START' | 'STORY' | 'BATTLE' | 'INVENTORY' | 'VICTORY' | 'DEFEAT';

interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  level: number;
  exp: number;
}

interface Weapon {
  itemName: string;
  description: string;
  image: string;
  isUsed: boolean;
}

function Game() {
  const { account, contract, connect, isConnecting, chainId } = useWeb3();
  const [mode, setMode] = useState<GameMode>('START');
  const [player, setPlayer] = useState<PlayerStats>({ hp: 100, maxHp: 100, atk: 15, def: 10, level: 1, exp: 0 });
  const [monster, setMonster] = useState(MONSTERS[0]);
  const [monsterHp, setMonsterHp] = useState(MONSTERS[0].hp);
  const [inventory, setInventory] = useState<Weapon[]>([]);
  const [hand, setHand] = useState<typeof CARDS>([]);
  const [battleLog, setBattleLog] = useState<string[]>(["A wild monster appears!"]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  const stories = [
    "ในดินแดนแห่งเงามรณะ ผนึกโบราณได้ถูกทำลายลง...",
    "เหล่ากองทัพคนตายที่นำโดย Grave Titan กำลังตื่นขึ้นจากการหลับใหล",
    "คุณคือนักล่าวิญญาณพเนจร ผู้ต้องออกตามหาอาวุธแห่งแสงที่สาบสูญ",
    "เพื่อขับไล่ความมืดมิดกลับคืนสู่ขุมนรกชั่วนิรันดร์..."
  ];

  const fetchInventory = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const weapons = await contract.getMyWeapons();
      setInventory(weapons.map((w: any) => ({
        itemName: w.itemName,
        description: w.description,
        image: w.image,
        isUsed: w.isUsed
      })));
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }, [contract, account]);

  useEffect(() => {
    if (account) fetchInventory();
  }, [account, fetchInventory]);

  const startBattle = () => {
    const randomMonster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    setMonster(randomMonster);
    setMonsterHp(randomMonster.hp);
    setHand(drawHand());
    setBattleLog([`You encountered ${randomMonster.name}!`]);
    setMode('BATTLE');
    setIsPlayerTurn(true);
  };

  const drawHand = () => {
    const shuffled = [...CARDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const handleCardPlay = (card: typeof CARDS[0]) => {
    if (!isPlayerTurn) return;

    let damage = 0;
    let defenseBonus = 0;

    if (card.type === 'ATK') {
      damage = Math.max(0, (player.atk + card.value) - monster.def);
      setMonsterHp(prev => Math.max(0, prev - damage));
      setBattleLog(prev => [`You used ${card.name} and dealt ${damage} damage!`, ...prev]);
    } else {
      defenseBonus = card.value;
      setBattleLog(prev => [`You used ${card.name} and increased defense by ${defenseBonus}!`, ...prev]);
    }

    setIsPlayerTurn(false);
    
    // Check if monster died
    if (monsterHp - damage <= 0) {
      setTimeout(() => setMode('VICTORY'), 1000);
      return;
    }

    // Monster Turn
    setTimeout(() => {
      const monsterDamage = Math.max(0, monster.atk - (player.def + defenseBonus));
      setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - monsterDamage) }));
      setBattleLog(prev => [`${monster.name} attacks and deals ${monsterDamage} damage!`, ...prev]);
      
      if (player.hp - monsterDamage <= 0) {
        setMode('DEFEAT');
      } else {
        setHand(drawHand());
        setIsPlayerTurn(true);
      }
    }, 1000);
  };

  const mintReward = async () => {
    if (!contract || !account) return;
    setIsMinting(true);
    try {
      const reward = WEAPON_POOL[Math.floor(Math.random() * WEAPON_POOL.length)];
      const tx = await contract.mintWeapon(account, reward.name, reward.description, reward.image);
      await tx.wait();
      alert("NFT Weapon Minted Successfully!");
      fetchInventory();
      setPlayer(prev => ({ ...prev, atk: prev.atk + 5, level: prev.level + 1 }));
      setMode('STORY');
    } catch (error: any) {
      console.error("Minting error:", error);
      if (error.message.includes("already been minted")) {
        alert("This unique weapon was already minted by someone else! Try again next time.");
      } else {
        alert("Failed to mint NFT. Check your wallet.");
      }
    } finally {
      setIsMinting(false);
    }
  };

  if (!account) {
    return (
      <div className="game-container bg-zinc-950">
        <div className="battle-bg opacity-30" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center space-y-8 p-8 glass-panel max-w-md"
        >
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
            Shadow Realm
          </h1>
          <p className="text-zinc-400 font-light">Connect your wallet to begin your journey into the abyss.</p>
          <button 
            onClick={connect}
            disabled={isConnecting}
            className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
          >
            {isConnecting ? <RefreshCw className="animate-spin" /> : <Play className="fill-current" />}
            {isConnecting ? "Connecting..." : "Enter the Realm"}
          </button>
          {chainId && chainId !== "31337" && (
            <p className="text-red-500 text-sm">Please switch to Localhost (31337)</p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="battle-bg" />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <User className="text-white" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Soul Hunter</p>
            <p className="text-lg font-black text-white italic">LVL {player.level}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setMode('INVENTORY')}
            className="glass-panel p-4 hover:bg-white/10 transition-colors"
          >
            <Package className="text-white" />
          </button>
          <button 
            onClick={() => setMode('STORY')}
            className="glass-panel p-4 hover:bg-white/10 transition-colors"
          >
            <Map className="text-white" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'START' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 text-center space-y-8"
          >
            <h1 className="text-8xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
              Shadow Realm
            </h1>
            <button 
              onClick={() => setMode('STORY')}
              className="px-12 py-4 bg-white text-black font-bold rounded-full text-xl hover:scale-105 transition-transform"
            >
              Start Adventure
            </button>
          </motion.div>
        )}

        {mode === 'STORY' && (
          <motion.div 
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-2xl p-8 glass-panel space-y-8"
          >
            <div className="h-64 flex items-center justify-center">
              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center"
              >
                <User size={64} className="text-white" />
              </motion.div>
            </div>
            <div className="p-6 bg-black/60 rounded-xl border border-white/20">
              <p className="text-2xl font-medium leading-relaxed text-center">
                {stories[storyIndex]}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              {storyIndex < stories.length - 1 ? (
                <button 
                  onClick={() => setStoryIndex(prev => prev + 1)}
                  className="px-8 py-3 bg-white text-black font-bold rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={startBattle}
                  className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500"
                >
                  Enter Battle
                </button>
              )}
            </div>
          </motion.div>
        )}

        {mode === 'BATTLE' && (
          <motion.div 
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-between p-12 pt-32"
          >
            {/* Monster Area */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-64 relative">
                <motion.img 
                  src={monster.image} 
                  alt={monster.name}
                  animate={{ 
                    y: [0, -10, 0],
                    filter: monsterHp < monster.hp * 0.3 ? "grayscale(1) brightness(0.5)" : "none"
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -top-12 left-0 right-0">
                  <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden border border-white/20">
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: `${(monsterHp / monster.hp) * 100}%` }}
                      className="h-full bg-red-500"
                    />
                  </div>
                  <p className="text-center text-xs font-bold mt-1 uppercase tracking-widest">{monster.name} HP: {monsterHp}/{monster.hp}</p>
                </div>
              </div>
            </div>

            {/* Battle Log */}
            <div className="w-full max-w-lg h-32 overflow-y-auto glass-panel p-4 space-y-2 text-sm font-mono">
              {battleLog.map((log, i) => (
                <p key={i} className={cn(i === 0 ? "text-white" : "text-zinc-500")}>
                  {log}
                </p>
              ))}
            </div>

            {/* Player Area */}
            <div className="w-full flex flex-col items-center gap-8">
              <div className="flex gap-4">
                <div className="glass-panel px-6 py-2 flex items-center gap-2">
                  <Sword size={16} className="text-red-400" />
                  <span className="font-bold">{player.atk}</span>
                </div>
                <div className="glass-panel px-6 py-2 flex items-center gap-2">
                  <Shield size={16} className="text-blue-400" />
                  <span className="font-bold">{player.def}</span>
                </div>
                <div className="glass-panel px-6 py-2 flex items-center gap-2">
                  <div className="w-32 bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                      className="h-full bg-green-500"
                    />
                  </div>
                  <span className="text-xs font-bold">HP {player.hp}</span>
                </div>
              </div>

              <div className="flex gap-4 h-64 items-end">
                {hand.map((card, i) => (
                  <motion.button
                    key={`${card.id}-${i}`}
                    whileHover={{ y: -20, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isPlayerTurn}
                    onClick={() => handleCardPlay(card)}
                    className={cn(
                      "relative w-40 h-56 rounded-xl overflow-hidden border-2 transition-all",
                      isPlayerTurn ? "border-white/20 hover:border-white shadow-xl" : "border-transparent opacity-50 grayscale"
                    )}
                  >
                    <img src={card.image} alt={card.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{card.type}</p>
                      <p className="text-lg font-black italic">{card.name}</p>
                      <p className="text-xl font-black text-white">+{card.value}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {mode === 'VICTORY' && (
          <motion.div 
            key="victory"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center space-y-8 glass-panel p-12"
          >
            <Trophy size={80} className="text-yellow-400 mx-auto" />
            <h2 className="text-6xl font-black italic uppercase text-white">Victory!</h2>
            <p className="text-zinc-400">You have defeated the {monster.name}.</p>
            <div className="space-y-4">
              <button 
                onClick={mintReward}
                disabled={isMinting}
                className="w-full py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
              >
                {isMinting ? "Minting NFT..." : "Claim NFT Weapon"}
              </button>
              <button 
                onClick={() => setMode('STORY')}
                className="w-full py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20"
              >
                Continue Journey
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'DEFEAT' && (
          <motion.div 
            key="defeat"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center space-y-8 glass-panel p-12"
          >
            <Skull size={80} className="text-red-600 mx-auto" />
            <h2 className="text-6xl font-black italic uppercase text-white">Defeated</h2>
            <p className="text-zinc-400">Your soul has been consumed by the darkness.</p>
            <button 
              onClick={() => {
                setPlayer({ hp: 100, maxHp: 100, atk: 15, def: 10, level: 1, exp: 0 });
                setMode('START');
              }}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {mode === 'INVENTORY' && (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="relative z-10 w-full max-w-4xl h-[80vh] glass-panel p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black italic uppercase text-white">Soul Armory</h2>
              <button onClick={() => setMode('STORY')} className="p-2 hover:bg-white/10 rounded-full">
                <RefreshCw />
              </button>
            </div>
            
            {inventory.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <Package size={48} />
                <p>No NFT weapons collected yet. Defeat monsters to earn them!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inventory.map((item, i) => (
                  <div key={i} className="glass-panel overflow-hidden group">
                    <div className="h-48 bg-zinc-900 relative">
                      <img src={item.image} alt={item.itemName} className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-white/20">
                        NFT #{i}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-xl font-black italic text-white">{item.itemName}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                      <div className="pt-4 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Verified on Chain</span>
                        <Sword size={14} className="text-zinc-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <Game />
    </Web3Provider>
  );
}
