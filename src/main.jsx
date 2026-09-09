import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Bell, ChevronLeft, ChevronRight, CircleUserRound, CloudRain, Droplets,
  Gauge, History, LayoutDashboard, Menu, Settings, ShieldAlert, Sparkles,
  Waves, X, Zap, ArrowDownToLine, Leaf, Activity, GaugeCircle, Recycle,
  CalendarClock, FlaskConical, BatteryCharging, TrendingDown
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar
} from 'recharts'
import './index.css'

const initialHistory = Array.from({ length: 24 }, (_, i) => ({
  label: `${String(i).padStart(2, '0')}:00`,
  municipal: Math.round(18 + Math.sin(i / 2.5) * 7 + Math.random() * 7),
  rainwater: Math.round(8 + Math.cos(i / 3) * 5 + Math.random() * 5),
}))

const weekHistory = [
  { label: 'Mon', municipal: 410, rainwater: 210 }, { label: 'Tue', municipal: 380, rainwater: 250 },
  { label: 'Wed', municipal: 450, rainwater: 290 }, { label: 'Thu', municipal: 330, rainwater: 310 },
  { label: 'Fri', municipal: 390, rainwater: 340 }, { label: 'Sat', municipal: 300, rainwater: 370 },
  { label: 'Sun', municipal: 270, rainwater: 390 },
]

function App() {
  const [active, setActive] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [valveOn, setValveOn] = useState(true)
  const [source, setSource] = useState('rainwater')
  const [autoRain, setAutoRain] = useState(true)
  const [tank, setTank] = useState(67)
  const [rainTank, setRainTank] = useState(74)
  const [usage, setUsage] = useState(384)
  const [rainCollected, setRainCollected] = useState(128)
  const [history, setHistory] = useState(initialHistory)
  const [range, setRange] = useState('24h')
  const [notifications, setNotifications] = useState(true)
  const [dark, setDark] = useState(false)
  const [lowThreshold, setLowThreshold] = useState(20)
  const [overflowThreshold, setOverflowThreshold] = useState(90)
  const [leakProtection, setLeakProtection] = useState(true)
  const [smartSchedule, setSmartSchedule] = useState(true)
  const [qualityScore, setQualityScore] = useState(92)
  const [pumpHealth, setPumpHealth] = useState(96)

  useEffect(() => {
    const timer = setInterval(() => {
      setTank(v => Math.max(8, Math.min(96, v + (Math.random() - 0.55) * 1.4)))
      setRainTank(v => Math.max(5, Math.min(98, v + (Math.random() - 0.48) * 1.1)))
      setUsage(v => +(v + (valveOn ? Math.random() * 1.2 : 0)).toFixed(1))
      setRainCollected(v => +(v + (Math.random() > 0.75 ? Math.random() * 0.8 : 0)).toFixed(1))
      setQualityScore(v => Math.max(88, Math.min(96, +(v + (Math.random() - .5) * .5).toFixed(1))))
      setPumpHealth(v => Math.max(92, Math.min(99, +(v + (Math.random() - .5) * .2).toFixed(1))))
      setHistory(old => old.map((d, i) => i === old.length - 1 ? {
        ...d,
        municipal: Math.max(0, Math.round(d.municipal + (valveOn ? Math.random() * 2 - 1 : -d.municipal * 0.2))),
        rainwater: Math.max(0, Math.round(d.rainwater + (source === 'rainwater' && valveOn ? Math.random() * 2 - 1 : -d.rainwater * 0.2))),
      } : d))
    }, 3500)
    return () => clearInterval(timer)
  }, [valveOn, source])

  const flow = valveOn ? (source === 'rainwater' ? 12.8 : 14.6) : 0
  const lowTank = tank < lowThreshold
  const overflow = rainTank > overflowThreshold
  const leakRisk = leakProtection && valveOn && flow > 0 && flow < 4
  const waterSaved = 8240
  const rupeesSaved = 742
  const smartScore = Math.round(Math.min(99, 70 + (rainTank * .12) + (autoRain ? 9 : 0) + (leakProtection ? 6 : 0)))
  const collectionForecast = Math.round((100 - rainTank) * 7.5)
  const chartData = useMemo(() => range === '24h' ? history : weekHistory, [range, history])

  const nav = [
    ['Dashboard', LayoutDashboard], ['History', History], ['Rainwater', CloudRain],
    ['Alerts', ShieldAlert], ['Settings', Settings],
  ]

  return (
    <div className={`min-h-screen font-nunito app ${dark ? 'dark-mode' : ''}`}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="brand"><div className="brand-mark"><Waves size={22} /></div>{!collapsed && <div><div className="brand-name">AquaPulse</div><div className="brand-sub">SMART WATER</div></div>}</div>
        <button className="collapse-btn" onClick={() => setCollapsed(v => !v)} aria-label="Collapse navigation">{collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
        <nav>{nav.map(([name, Icon]) => <button key={name} className={`nav-item ${active === name ? 'active' : ''}`} onClick={() => setActive(name)}><Icon size={19}/>{!collapsed && <span>{name}</span>}{name === 'Alerts' && !collapsed && <span className="nav-badge">{[lowTank, overflow, leakRisk].filter(Boolean).length}</span>}</button>)}</nav>
        {!collapsed && <div className="sidebar-foot"><div className="online-dot"></div><div><strong>System online</strong><span>All sensors synced</span></div></div>}
      </aside>

      <main className={`main ${collapsed ? 'expanded' : ''}`}>
        <header className="topbar">
          <div className="mobile-menu"><Menu size={22}/></div>
          <div><div className="eyebrow">WEDNESDAY · SEPTEMBER 09</div><h1>{active === 'Dashboard' ? 'Good evening, there.' : active}</h1></div>
          <div className="top-actions"><button className="icon-btn theme-btn" onClick={() => setDark(v => !v)} title="Toggle theme">{dark ? '☀' : '☾'}</button><button className="icon-btn notification" onClick={() => setNotifications(v => !v)}><Bell size={19}/>{notifications && <i/>}</button><div className="profile"><CircleUserRound size={33}/><div><strong>Water Admin</strong><span>Smart control center</span></div></div></div>
        </header>

        {active === 'Dashboard' && <Dashboard {...{flow, valveOn, setValveOn, source, setSource, tank, rainTank, usage, rainCollected, autoRain, setAutoRain, collectionForecast, smartScore, qualityScore, pumpHealth, leakProtection, setLeakProtection, smartSchedule, setSmartSchedule, lowTank, overflow, leakRisk, notifications, setNotifications, waterSaved, rupeesSaved, chartData, range, setRange, smartScore}} />}
        {active === 'History' && <HistoryPage data={chartData} />}
        {active === 'Rainwater' && <RainwaterPage {...{rainTank, rainCollected, source, setSource, autoRain, setAutoRain, overflow, threshold: overflowThreshold, collectionForecast}} />}
        {active === 'Alerts' && <AlertsPage {...{lowTank, overflow, leakRisk, tank, rainTank, flow, threshold: lowThreshold, overflowThreshold}} />}
        {active === 'Settings' && <SettingsPage {...{dark, setDark, lowThreshold, setLowThreshold, overflowThreshold, setOverflowThreshold, notifications, setNotifications, leakProtection, setLeakProtection, smartSchedule, setSmartSchedule}} />}
      </main>
    </div>
  )
}

function Dashboard({flow,valveOn,setValveOn,source,setSource,tank,rainTank,usage,rainCollected,autoRain,setAutoRain,collectionForecast,smartScore,qualityScore,pumpHealth,leakProtection,setLeakProtection,smartSchedule,setSmartSchedule,lowTank,overflow,leakRisk,notifications,setNotifications,waterSaved,rupeesSaved,chartData,range,setRange}) {
  return <>
    {(lowTank || overflow || leakRisk) && notifications && <div className="alert-banner"><div className="alert-icon"><ShieldAlert size={18}/></div><div><strong>{leakRisk ? 'Unusual flow pattern detected' : lowTank ? 'Municipal tank is running low' : 'Rainwater tank is nearing overflow'}</strong><span>{leakRisk ? 'Leak protection is monitoring the outlet. Check fixtures if the pattern continues.' : lowTank ? 'Smart routing recommends harvested rainwater.' : 'Use available harvested water to create storage capacity.'}</span></div><button onClick={() => setNotifications(false)}><X size={17}/></button></div>}

    <section className="hero-card"><div className="hero-copy"><div className="pill live"><span></span> LIVE SMART SYSTEM</div><div className="flow-value">{flow.toFixed(1)}<small>L/min</small></div><div className="hero-label">CURRENT FLOW RATE</div><p>Remote supply is {valveOn ? 'active' : 'paused'} through the {source === 'rainwater' ? 'harvested rainwater' : 'municipal'} source.</p><div className="source-chip"><span className={source === 'rainwater' ? 'rain-dot' : 'mun-dot'}></span>{source === 'rainwater' ? 'Harvested rainwater' : 'Municipal supply'}</div></div><div className="tank-visual"><div className="tank-shell"><div className="water-fill" style={{height:`${tank}%`}}></div><div className="tank-wave"></div><div className="tank-number">{Math.round(tank)}<small>%</small></div></div><div className="tank-meta"><strong>Municipal tank</strong><span>Primary reserve</span></div></div><div className="valve-panel"><div className="eyebrow">REMOTE VALVE</div><button className={`valve ${valveOn ? 'on' : 'off'}`} onClick={() => setValveOn(v => !v)}><span className="valve-knob"></span></button><div className="valve-state">{valveOn ? 'SUPPLY ON' : 'SUPPLY OFF'}</div><div className="valve-hint">{valveOn ? 'Tap to stop water flow' : 'Tap to resume supply'}</div></div></section>

    <div className="balance-title"><div><div className="eyebrow">50 / 50 CONTROL CENTER</div><h2>Smart Water <span>×</span> Rainwater</h2><p>One system, two sources — optimized together instead of managed separately.</p></div><div className="system-score"><Sparkles size={15}/><b>{smartScore}/100</b><span>efficiency score</span></div></div>

    <section className="balance-grid">
      <div className="smart-panel"><div className="panel-head"><div className="panel-icon"><GaugeCircle size={19}/></div><div><b>SMART WATER SYSTEM</b><span>Supply, consumption & protection</span></div><span className="live-chip">LIVE</span></div><div className="smart-stats"><MiniStat icon={Droplets} label="Today used" value={`${Math.round(usage)} L`} /><MiniStat icon={Activity} label="Flow" value={`${flow.toFixed(1)} L/min`} /><MiniStat icon={FlaskConical} label="Quality index" value={`${Math.round(qualityScore)}/100`} /><MiniStat icon={BatteryCharging} label="Pump health" value={`${Math.round(pumpHealth)}%`} /></div><div className="control-row"><div><b>Leak protection</b><small>Detect unusual flow while supply is active</small></div><Toggle checked={leakProtection} onChange={() => setLeakProtection(v => !v)} /></div><div className="control-row"><div><b>Smart usage schedule</b><small>Reduce non-essential supply during peak hours</small></div><Toggle checked={smartSchedule} onChange={() => setSmartSchedule(v => !v)} /></div></div>

      <div className="rain-panel"><div className="panel-head"><div className="panel-icon rain-icon"><CloudRain size={19}/></div><div><b>RAINWATER HARVESTING</b><span>Capture, store & reuse</span></div><span className="capacity-chip">{Math.round(rainTank)}% FULL</span></div><div className="rain-visual-row"><div className="mini-tank"><div style={{height:`${rainTank}%`}}></div><b>{Math.round(rainTank)}%</b></div><div><strong>{Math.round(rainCollected)} L</strong><span>collected today</span><p><CloudRain size={13}/> Next rain can add up to <b>{collectionForecast} L</b></p></div></div><div className="capture-metrics"><span><b>86%</b><small>catchment efficiency</small></span><span><b>1,240 L</b><small>ground recharge this month</small></span><span><b>{Math.round((rainTank / 100) * 7.5)} L</b><small>currently stored</small></span></div></div>
    </section>

    <section className="source-card"><div><div className="eyebrow">SMART SOURCE ORCHESTRATION</div><h2>Let the system choose the lowest-cost source</h2><p>Rainwater is prioritized when available; municipal supply remains the backup.</p></div><div className="source-controls"><div className="segmented"><button className={source==='municipal'?'selected':''} onClick={()=>setSource('municipal')}><Droplets size={17}/> Municipal</button><button className={source==='rainwater'?'selected':''} onClick={()=>setSource('rainwater')}><CloudRain size={17}/> Harvested</button></div><label className="check-row"><input type="checkbox" checked={autoRain} onChange={e=>setAutoRain(e.target.checked)}/><span className="fake-check">✓</span><span><b>Auto-prioritize harvested water</b><small>Switch automatically when storage is healthy</small></span></label></div></section>

    <section className="metric-grid"><Metric icon={Droplets} label="Today's usage" value={`${Math.round(usage)} L`} note="Running consumption counter"/><Metric icon={Recycle} label="Water saved" value={`${waterSaved.toLocaleString()} L`} note={`≈ ₹${rupeesSaved.toLocaleString()} saved this month`}/><Metric icon={ArrowDownToLine} label="Rainwater used" value={`${Math.round(rainCollected * .62)} L`} note="Offset from municipal demand"/><Metric icon={TrendingDown} label="Municipal dependency" value="38%" note="Down 12% with smart routing"/></section>

    <section className="chart-card"><div className="chart-header"><div><div className="eyebrow">CONSUMPTION LOG</div><h2>Usage history</h2><p>Compare municipal dependency with harvested water contribution.</p></div><div className="range-tabs"><button className={range==='24h'?'active':''} onClick={()=>setRange('24h')}>24 hours</button><button className={range==='7d'?'active':''} onClick={()=>setRange('7d')}>7 days</button></div></div><div className="legend"><span><i className="mun-dot"></i>Municipal</span><span><i className="rain-dot"></i>Rainwater</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}><defs><linearGradient id="municipalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0077b6" stopOpacity=".18"/><stop offset="100%" stopColor="#0077b6" stopOpacity="0"/></linearGradient><linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6bbec0" stopOpacity=".20"/><stop offset="100%" stopColor="#6bbec0" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#a9c9ca" strokeOpacity=".28"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#58717c'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#58717c'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{borderRadius:14,border:'1px solid #a9c9ca',fontFamily:'Nunito'}}/><Area type="monotone" dataKey="municipal" stroke="#0077b6" strokeWidth={2.5} fill="url(#municipalFill)"/><Area type="monotone" dataKey="rainwater" stroke="#4b9ea1" strokeWidth={2.5} fill="url(#rainFill)"/></AreaChart></ResponsiveContainer></div></section>
  </>
}

function MiniStat({icon:Icon,label,value}) { return <div className="mini-control-stat"><span><Icon size={14}/></span><div><b>{value}</b><small>{label}</small></div></div> }
function Toggle({checked,onChange}) { return <button className={`mini-toggle ${checked?'checked':''}`} onClick={onChange} aria-label="Toggle setting"><span/></button> }
function Metric({icon:Icon,label,value,note}) { return <div className="metric-card"><div className="metric-head"><span className="metric-icon"><Icon size={17}/></span><span>{label}</span></div><strong>{value}</strong><small>{note}</small></div> }
function Section({children}) { return <section className="module-section">{children}</section> }

function HistoryPage({data}) {
  const totalMunicipal=data.reduce((a,b)=>a+b.municipal,0), totalRain=data.reduce((a,b)=>a+b.rainwater,0), pieData=[{name:'Municipal',value:totalMunicipal},{name:'Rainwater',value:totalRain}]
  return <Section><div className="module-title"><div><div className="eyebrow">ANALYTICS CENTER</div><h2>Water intelligence</h2><p>See exactly how smart control and harvesting change the source mix.</p></div><div className="mini-stat"><b>{Math.round(totalRain/(totalMunicipal+totalRain)*100)}%</b><span>rainwater share</span></div></div><div className="chart-card"><div className="chart-header"><div><div className="eyebrow">SOURCE COMPARISON</div><h2>Consumption trend</h2><p>Municipal vs harvested water over the selected period.</p></div></div><div className="chart-wrap tall"><ResponsiveContainer><LineChart data={data} margin={{top:12,right:20,left:-15,bottom:0}}><CartesianGrid stroke="#a9c9ca" strokeOpacity=".25" vertical={false}/><XAxis dataKey="label" tick={{fontSize:10}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:10}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{borderRadius:12,border:'1px solid #a9c9ca'}}/><Line type="monotone" dataKey="municipal" name="Municipal" stroke="#0077b6" strokeWidth={3} dot={false}/><Line type="monotone" dataKey="rainwater" name="Rainwater" stroke="#4b9ea1" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div></div><div className="two-col"><div className="chart-card"><div className="eyebrow">SOURCE MIX</div><h2>Where your water came from</h2><div className="pie-wrap"><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={3}>{pieData.map((_,i)=><Cell key={i} fill={i===0?'#0077b6':'#4b9ea1'}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut"><div><b>{Math.round(totalRain/(totalMunicipal+totalRain)*100)}%</b><span>rainwater</span></div></div></div></div><div className="insight-card"><div className="metric-icon"><Sparkles size={17}/></div><h3>Smart routing is reducing dependency</h3><p>Use harvested water for eligible demand while keeping municipal supply available as the reliable backup source.</p><strong>{totalRain.toLocaleString()} L</strong><small>harvested contribution shown</small></div></div></Section>
}

function RainwaterPage({rainTank,rainCollected,source,setSource,autoRain,setAutoRain,overflow,threshold,collectionForecast}) { return <Section><div className="module-title"><div><div className="eyebrow">RAINWATER CENTER</div><h2>Harvest, store & recharge</h2><p>A dedicated rainwater layer that works alongside the smart water network.</p></div><div className={`status-chip ${overflow?'warn':''}`}>{overflow?'⚠ Overflow risk':'● Capture system healthy'}</div></div><div className="rain-grid"><div className="big-rain-card"><div className="eyebrow">STORAGE TANK</div><div className="rain-big"><b>{Math.round(rainTank)}%</b><span>capacity</span></div><div className="capacity-bar"><span style={{width:`${rainTank}%`}}/></div><div className="rain-details"><span>Available space <b>{Math.round((100-rainTank)*7.5)} L</b></span><span>Overflow alert <b>{threshold}%</b></span></div></div><Metric icon={CloudRain} label="Collected today" value={`${Math.round(rainCollected)} L`} note="Live simulated capture"/><Metric icon={ArrowDownToLine} label="Next-rain capacity" value={`${collectionForecast} L`} note="Estimated available storage"/></div><div className="rain-feature-grid"><Feature icon={Activity} title="Catchment efficiency" value="86%" text="Roof runoff is being routed into storage with minimal loss."/><Feature icon={Recycle} title="Groundwater recharge" value="1,240 L" text="Estimated recharge contribution this month."/><Feature icon={Zap} title="First-flush status" value="READY" text="Initial runoff diversion is armed before storage."/><Feature icon={Waves} title="Overflow diversion" value={overflow?'ACTIVE':'STANDBY'} text="Overflow can be diverted to the recharge path."/></div><div className="source-card"><div><div className="eyebrow">ACTIVE SOURCE</div><h2>Supply routing</h2><p>Switch household feed without leaving the rainwater module.</p></div><div className="source-controls"><div className="segmented"><button className={source==='municipal'?'selected':''} onClick={()=>setSource('municipal')}><Droplets size={17}/> Municipal</button><button className={source==='rainwater'?'selected':''} onClick={()=>setSource('rainwater')}><CloudRain size={17}/> Rainwater</button></div><label className="check-row"><input type="checkbox" checked={autoRain} onChange={e=>setAutoRain(e.target.checked)}/><span className="fake-check">✓</span><span><b>Auto-prioritize harvested water</b><small>Keep municipal as backup</small></span></label></div></div></Section> }
function Feature({icon:Icon,title,value,text}) { return <div className="feature-card"><span className="feature-icon"><Icon size={18}/></span><div><div className="feature-label">{title}</div><strong>{value}</strong><p>{text}</p></div></div> }

function AlertsPage({lowTank,overflow,leakRisk,tank,rainTank,flow,threshold,overflowThreshold}) { const alerts=[{active:lowTank,icon:Droplets,title:'Low municipal tank',text:`Tank is at ${Math.round(tank)}%. Alert below ${threshold}%.`},{active:overflow,icon:CloudRain,title:'Rainwater overflow risk',text:`Rainwater tank is at ${Math.round(rainTank)}%. Alert above ${overflowThreshold}%.`},{active:leakRisk,icon:Activity,title:'Flow anomaly / leak check',text:`Flow is ${flow.toFixed(1)} L/min while leak protection is enabled.`}]; return <Section><div className="module-title"><div><div className="eyebrow">SYSTEM MONITOR</div><h2>Alerts & protection</h2><p>Smart-water safety and rainwater protection in one place.</p></div><div className="alert-count">{alerts.filter(a=>a.active).length} active</div></div><div className="alert-list">{alerts.map(({active,icon:Icon,title,text})=><div className={`alert-row ${active?'active-alert':''}`} key={title}><div className="alert-row-icon"><Icon size={19}/></div><div><b>{title}</b><p>{text}</p></div><span className={active?'warning-state':'ok-state'}>{active?'ACTION NEEDED':'NORMAL'}</span></div>)}</div><div className="protection-note"><ShieldAlert size={19}/><div><b>Protection logic</b><span>Low-level alerts protect municipal reserve, overflow alerts protect harvested storage, and flow anomaly monitoring protects the distribution network.</span></div></div></Section> }

function SettingsPage({dark,setDark,lowThreshold,setLowThreshold,overflowThreshold,setOverflowThreshold,notifications,setNotifications,leakProtection,setLeakProtection,smartSchedule,setSmartSchedule}) { return <Section><div className="module-title"><div><div className="eyebrow">CONTROL CENTER</div><h2>System settings</h2><p>Configure the intelligence layer without changing the core dashboard.</p></div></div><div className="settings-grid"><div className="setting-card"><div><b>Appearance</b><p>Switch between bright and deep-ocean themes.</p></div><button className="setting-toggle" onClick={()=>setDark(v=>!v)}>{dark?'☀ Light mode':'☾ Dark mode'}</button></div><div className="setting-card"><div><b>Notifications</b><p>Show live warning banners.</p></div><button className={`setting-toggle ${notifications?'on':''}`} onClick={()=>setNotifications(v=>!v)}>{notifications?'Enabled':'Disabled'}</button></div><div className="setting-card"><div><b>Leak protection</b><p>Monitor unusual flow patterns.</p></div><button className={`setting-toggle ${leakProtection?'on':''}`} onClick={()=>setLeakProtection(v=>!v)}>{leakProtection?'Enabled':'Disabled'}</button></div><div className="setting-card"><div><b>Smart usage schedule</b><p>Reduce avoidable peak-hour consumption.</p></div><button className={`setting-toggle ${smartSchedule?'on':''}`} onClick={()=>setSmartSchedule(v=>!v)}>{smartSchedule?'Enabled':'Disabled'}</button></div><div className="setting-card"><div><b>Low tank threshold</b><p>Alert below this municipal level.</p></div><input type="range" min="5" max="50" value={lowThreshold} onChange={e=>setLowThreshold(+e.target.value)}/><strong>{lowThreshold}%</strong></div><div className="setting-card"><div><b>Overflow threshold</b><p>Alert above this rainwater level.</p></div><input type="range" min="70" max="99" value={overflowThreshold} onChange={e=>setOverflowThreshold(+e.target.value)}/><strong>{overflowThreshold}%</strong></div></div></Section> }

createRoot(document.getElementById('root')).render(<App />)
