import { useState, useEffect } from 'react'

// Mock protocol data (DefiLlama-style)
const PROTOCOLS = [
  { name:'Lido',          category:'Liquid Staking', chain:'Ethereum', tvl:22.4e9,  change24h: 0.8,  apy: 3.8,  token:'stETH',  color:'#00A3FF' },
  { name:'AAVE V3',       category:'Lending',        chain:'Multi',    tvl:11.2e9,  change24h:-1.2,  apy: 5.2,  token:'AAVE',   color:'#B6509E' },
  { name:'Uniswap V3',    category:'DEX',            chain:'Ethereum', tvl: 5.8e9,  change24h: 2.1,  apy: 8.4,  token:'UNI',    color:'#FF007A' },
  { name:'Curve Finance', category:'DEX',            chain:'Multi',    tvl: 4.2e9,  change24h:-0.5,  apy: 6.1,  token:'CRV',    color:'#AA1C1C' },
  { name:'MakerDAO',      category:'CDP',            chain:'Ethereum', tvl: 8.1e9,  change24h: 0.3,  apy: 4.9,  token:'MKR',    color:'#1AAB9B' },
  { name:'Compound V3',   category:'Lending',        chain:'Multi',    tvl: 2.9e9,  change24h:-2.1,  apy: 4.8,  token:'COMP',   color:'#00D395' },
  { name:'Pendle',        category:'Yield',          chain:'Ethereum', tvl: 3.6e9,  change24h: 4.2,  apy:11.2,  token:'PENDLE', color:'#5B21B6' },
  { name:'Convex',        category:'Yield',          chain:'Ethereum', tvl: 3.1e9,  change24h:-1.8,  apy:14.7,  token:'CVX',    color:'#FF6B6B' },
  { name:'GMX',           category:'Derivatives',    chain:'Arbitrum', tvl: 1.8e9,  change24h: 3.1,  apy: 9.8,  token:'GMX',    color:'#2D42FC' },
  { name:'Yearn Finance', category:'Yield',          chain:'Multi',    tvl: 0.9e9,  change24h:-0.9,  apy: 8.4,  token:'YFI',    color:'#006AE3' },
  { name:'Balancer',      category:'DEX',            chain:'Multi',    tvl: 1.4e9,  change24h: 1.2,  apy: 7.3,  token:'BAL',    color:'#1E1E1E' },
  { name:'Rocket Pool',   category:'Liquid Staking', chain:'Ethereum', tvl: 4.3e9,  change24h: 0.6,  apy: 3.4,  token:'RPL',    color:'#FF6600' },
]

const CHAINS = [
  { name:'Ethereum', tvl:58.4e9, dominance:52.1, color:'#627EEA' },
  { name:'Arbitrum', tvl:12.1e9, dominance:10.8, color:'#28A0F0' },
  { name:'BNB Chain',tvl: 8.9e9, dominance: 7.9, color:'#F3BA2F' },
  { name:'Solana',   tvl: 6.2e9, dominance: 5.5, color:'#9945FF' },
  { name:'Base',     tvl: 4.8e9, dominance: 4.3, color:'#0052FF' },
  { name:'Polygon',  tvl: 3.1e9, dominance: 2.8, color:'#8247E5' },
]

const fmt = (n: number) => {
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`
  return `$${n.toFixed(2)}`
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 bg-gray-900 rounded-sm h-1 overflow-hidden">
      <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${(value/max)*100}%`, background: color }} />
    </div>
  )
}

function Sparkline({ up }: { up: boolean }) {
  const pts = Array.from({ length: 20 }, (_, i) => {
    const base = 40
    const trend = up ? i * 1.5 : -i * 1.5
    const noise = (Math.sin(i * 2.3) * 8 + Math.cos(i * 1.7) * 5)
    return Math.max(5, Math.min(55, base + trend + noise))
  })
  const w = 60, h = 24
  const min = Math.min(...pts), max = Math.max(...pts)
  const range = max - min || 1
  const path = pts.map((v, i) => `${(i/19)*w},${h-((v-min)/range)*h}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={path} fill="none" stroke={up ? '#34d399' : '#f87171'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatCard({ label, value, sub, delta, color }: { label: string; value: string; sub?: string; delta?: number; color?: string }) {
  return (
    <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4">
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{label}</p>
      <p className="font-display text-white font-bold text-xl" style={{ fontFamily:'Syne,sans-serif' }}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1 font-mono">{sub}</p>}
      {delta !== undefined && (
        <p className={`text-xs font-mono mt-1 ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)}% 24h
        </p>
      )}
    </div>
  )
}

export default function App() {
  const [activeTab,  setActiveTab]  = useState<'protocols'|'chains'|'yields'>('protocols')
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('All')
  const [sortKey,    setSortKey]    = useState('tvl')
  const [sortDir,    setSortDir]    = useState<1|-1>(-1)
  const [tick,       setTick]       = useState(0)

  // Simulate live data pulse
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000)
    return () => clearInterval(t)
  }, [])

  const totalTvl = PROTOCOLS.reduce((s, p) => s + p.tvl, 0)
  const categories = ['All', ...Array.from(new Set(PROTOCOLS.map(p => p.category)))]

  const filtered = PROTOCOLS
    .filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'All' && p.category !== category) return false
      return true
    })
    .sort((a, b) => {
      const av = (a as any)[sortKey], bv = (b as any)[sortKey]
      return (av > bv ? 1 : -1) * sortDir
    })

  const setSort = (k: string) => {
    if (sortKey === k) setSortDir(d => d === 1 ? -1 : 1)
    else { setSortKey(k); setSortDir(-1) }
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-gray-100" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');`}</style>

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-[#080b10]/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span style={{ fontFamily:'Syne,sans-serif' }} className="font-bold text-white text-lg tracking-tight">ChainPulse</span>
          </div>
          <span className="text-gray-600 text-xs hidden sm:block">DeFi Protocol Analytics</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="font-mono">Total TVL: <span className="text-emerald-400">{fmt(totalTvl)}</span></span>
          <span className="hidden md:block">Last sync: <span className="text-gray-400">{new Date().toLocaleTimeString()}</span></span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Value Locked" value={fmt(totalTvl)} sub={`${PROTOCOLS.length} protocols`} delta={1.4} />
          <StatCard label="Highest APY" value={`${Math.max(...PROTOCOLS.map(p=>p.apy))}%`} sub="Convex Finance" />
          <StatCard label="Chains Tracked" value={`${CHAINS.length}`} sub="Multi-chain coverage" />
          <StatCard label="ETH Dominance" value="52.1%" sub="of total TVL" delta={-0.3} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0d1117] border border-gray-800 rounded-xl p-1 w-fit">
          {(['protocols','chains','yields'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === t ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/50' : 'text-gray-500 hover:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Protocols tab */}
        {activeTab === 'protocols' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search protocols..."
                  className="pl-8 pr-4 py-2 bg-[#0d1117] border border-gray-800 rounded-xl text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-800 w-44" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${category===c ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/50' : 'border border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-800">
                    {[['#',''],['Protocol','name'],['Category','category'],['Chain','chain'],['TVL','tvl'],['24h','change24h'],['APY','apy'],['7d Trend','']].map(([label,key]) => (
                      <th key={label} onClick={() => key && setSort(key)}
                        className={`py-3 px-4 text-left text-[10px] uppercase tracking-widest text-gray-600 ${key ? 'cursor-pointer hover:text-gray-400 transition-colors' : ''}`}>
                        {label} {key && sortKey===key ? (sortDir===-1?'↓':'↑') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.name} className="border-b border-gray-900 hover:bg-gray-900/40 transition-colors">
                      <td className="py-3.5 px-4 text-gray-600 text-xs">{i+1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                          <span className="font-semibold text-white text-sm">{p.name}</span>
                          <span className="text-gray-600 text-xs">{p.token}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-xs">{p.category}</td>
                      <td className="py-3.5 px-4 text-gray-500 text-xs">{p.chain}</td>
                      <td className="py-3.5 px-4 text-white font-semibold text-sm">{fmt(p.tvl)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-semibold ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.change24h >= 0 ? '+' : ''}{p.change24h}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-semibold text-xs">{p.apy}%</span>
                      </td>
                      <td className="py-3.5 px-4"><Sparkline up={p.change24h >= 0} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chains tab */}
        {activeTab === 'chains' && (
          <div className="grid md:grid-cols-2 gap-5">
            {CHAINS.map(c => (
              <div key={c.name} className="bg-[#0d1117] border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                    <span style={{fontFamily:'Syne,sans-serif'}} className="font-bold text-white text-lg">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white text-lg">{fmt(c.tvl)}</p>
                    <p className="text-gray-500 text-xs">{c.dominance}% of total</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MiniBar value={c.tvl} max={CHAINS[0].tvl} color={c.color} />
                  <span className="text-gray-500 text-xs w-12 text-right">{c.dominance}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Yields tab */}
        {activeTab === 'yields' && (
          <div className="space-y-3">
            {[...PROTOCOLS].sort((a,b) => b.apy - a.apy).map((p, i) => (
              <div key={p.name} className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                <span className="text-gray-700 text-xs w-5">{i+1}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-gray-600 text-xs">{p.category} · {p.chain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-gray-400 text-xs">TVL</p>
                    <p className="text-white text-sm font-semibold">{fmt(p.tvl)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">APY</p>
                    <p className="text-emerald-400 text-lg font-bold">{p.apy}%</p>
                  </div>
                  <div className="w-24 bg-gray-900 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${(p.apy/15)*100}%`, background: p.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
