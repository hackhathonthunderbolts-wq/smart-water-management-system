import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Bell, ChevronLeft, ChevronRight, CircleUserRound, CloudRain, Droplets, Activity, History, LayoutDashboard, Menu, Settings, ShieldAlert, Sparkles, Waves, X, ArrowDownToLine, Recycle, FlaskConical } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
  const [source, setSource] = useState('municipal')
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
  const [qualityScore, setQualityScore] = useState(92)

  useEffect(() => {
    const timer = setInterval(() => {
      setTank(v => Math.max(8, Math.min(96, v + (Math.random() - .55) * 1.4)))
      setRainTank(v => Math.max(5, Math.min(98, v + (Math.random() - .48) * 1.1)))
      setUsage(v => +(v + (valveOn ? Math.random() * 1.2 : 0)).toFixed(1))
      setRainCollected(v => +(v + (Math.random() > .75 ? Math.random() * .8 : 0)).toFixed(1))
      setQualityScore(v => Math.max(88, Math.min(96, +(v + (Math.random() - .5) * .5).toFixed(1))))
      setHistory(old => old.map((d, i) => i === old.length - 1 ? {
        ...d,
        municipal: Math.max(0, Math.round(d.municipal + (valveOn ? Math.random() * 2 - 1 : -d.municipal * .2))),
        rainwater: Math.max(0, Math.round(d.rainwater + (source === 'rainwater' && valveOn ? Math.random() * 2 - 1 : -d.rainwater * .2))),
      } : d))
    }, 3500)
    return () => clearInterval(timer)
  }, [valveOn, source])

  const flow = valveOn ? (source === 'rainwater' ? 12.8 : 14.6) : 0
  const lowTank = tank < lowThreshold
  const chartData = useMemo(() => range === '24h' ? history : weekHistory, [range, history])
  const nav = [['Dashboard', LayoutDashboard], ['History', History], ['Rainwater', CloudRain], ['Alerts', ShieldAlert], ['Settings', Settings]]

  return <div className={`min-h-screen font-nunito app ${dark ? 'dark-mode' : ''}`}>
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand"><div className="brand-mark"><Waves size={22}/></div>{!collapsed && <div><div className="brand-name">AquaPulse</div><div className="brand-sub">SMART WATER</div></div>}</div>
      <button className="collapse-btn" onClick={() => setCollapsed(v => !v)} aria-label="Collapse navigation">{collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
      <nav>{nav.map(([name, Icon]) => <button key={name} className={`nav-item ${active === name ? 'active' : ''}`} onClick={() => setActive(name)}><Icon size={19}/>{!collapsed && <span>{name}</span>}{name === 'Alerts' && !collapsed && <span className="nav-badge">{lowTank ? 1 : 0}</span>}</button>)}</nav>
      {!collapsed && <div className="sidebar-foot"><div className="online-dot"/><div><strong>System online</strong><span>All sensors synced</span></div></div>}
    </aside>

    <main className={`main ${collapsed ? 'expanded' : ''}`}>
      <header className="topbar">
        <div className="mobile-menu"><Menu size={22}/></div>
        <div><div className="eyebrow">WEDNESDAY · SEPTEMBER 09</div><h1>{active === 'Dashboard' ? 'Good evening, there.' : active}</h1></div>
        <div className="top-actions"><button className="icon-btn theme-btn" onClick={() => setDark(v => !v)}>{dark ? '☀' : '☾'}</button><button className="icon-btn notification" onClick={() => setNotifications(v => !v)}><Bell size={19}/>{notifications && <i/>}</button><div className="profile"><CircleUserRound size={33}/><div><strong>Water Admin</strong><span>Smart control center</span></div></div></div>
      </header>

      {active === 'Dashboard' && <Dashboard {...{flow,valveOn,setValveOn,source,setSource,tank,usage,qualityScore,lowTank,notifications,setNotifications,chartData,range,setRange}}/>}
      {active === 'History' && <HistoryPage data={chartData}/>} 
      {active === 'Rainwater' && <RainwaterPage {...{rainTank,rainCollected,source,setSource,autoRain,setAutoRain}}/>}
      {active === 'Alerts' && <AlertsPage {...{lowTank,tank,threshold:lowThreshold}}/>}
      {active === 'Settings' && <SettingsPage {...{dark,setDark,lowThreshold,setLowThreshold,notifications,setNotifications,autoRain,setAutoRain}}/>}
    </main>
  </div>
}

function Dashboard({flow,valveOn,setValveOn,source,setSource,tank,usage,qualityScore,lowTank,notifications,setNotifications,chartData,range,setRange}) {
  return <>
    {lowTank && notifications && <div className="alert-banner"><div className="alert-icon"><ShieldAlert size={18}/></div><div><strong>Tank level is running low</strong><span>Tank is below your configured threshold. Reduce non-essential water use.</span></div><button onClick={() => setNotifications(false)}><X size={17}/></button></div>}

    <section className="hero-card"><div className="hero-copy"><div className="pill live"><span/> LIVE SMART SYSTEM</div><div className="flow-value">{flow.toFixed(1)}<small>L/min</small></div><div className="hero-label">CURRENT FLOW RATE</div><p>Real-time water supply monitoring with remote valve control.</p><div className="source-chip"><span className={source === 'rainwater' ? 'rain-dot' : 'mun-dot'}/>{source === 'rainwater' ? 'Rainwater supply' : 'Municipal supply'}</div></div><div className="tank-visual"><div className="tank-shell"><div className="water-fill" style={{height:`${tank}%`}}/><div className="tank-wave"/><div className="tank-number">{Math.round(tank)}<small>%</small></div></div><div className="tank-meta"><strong>Tank level</strong><span>Current available level</span></div></div><div className="valve-panel"><div className="eyebrow">REMOTE VALVE</div><button className={`valve ${valveOn ? 'on' : 'off'}`} onClick={() => setValveOn(v => !v)}><span className="valve-knob"/></button><div className="valve-state">{valveOn ? 'SUPPLY ON' : 'SUPPLY OFF'}</div><div className="valve-hint">{valveOn ? 'Tap to stop water flow' : 'Tap to resume supply'}</div></div></section>

    <div className="dashboard-heading"><div><div className="eyebrow">SMART WATER SYSTEM</div><h2>Water supply overview</h2><p>Only the essentials for monitoring and controlling your water supply.</p></div></div>

    <section className="smart-dashboard-grid">
      <div className="smart-panel dashboard-smart-card"><div className="panel-head"><div className="panel-icon"><Activity size={19}/></div><div><b>SMART WATER SYSTEM</b><span>Supply & consumption</span></div><span className="live-chip">LIVE</span></div><div className="smart-stats"><MiniStat icon={Droplets} label="Today used" value={`${Math.round(usage)} L`}/><MiniStat icon={Activity} label="Flow" value={`${flow.toFixed(1)} L/min`}/><MiniStat icon={FlaskConical} label="Water quality" value={`${Math.round(qualityScore)}/100`}/></div><div className="simple-status"><span className="status-dot"/><div><b>Water supply active</b><small>System is monitoring your current water flow.</small></div></div></div>
      <div className="dashboard-summary-card"><div className="panel-head"><div className="panel-icon"><Droplets size={19}/></div><div><b>DAILY USAGE SUMMARY</b><span>Today's consumption</span></div></div><div className="summary-number">{Math.round(usage)}<small>L</small></div><p>Total water consumed today</p><div className="summary-progress"><span style={{width:`${Math.min(100, usage/10)}%`}}/></div><div className="summary-row"><span>Tank level <b>{Math.round(tank)}%</b></span><span>Flow <b>{flow.toFixed(1)} L/min</b></span></div></div>
    </section>

    <section className="metric-grid smart-metrics"><Metric icon={Droplets} label="Today's usage" value={`${Math.round(usage)} L`} note="Running consumption counter"/><Metric icon={Activity} label="Current flow" value={`${flow.toFixed(1)} L/min`} note="Live supply rate"/><Metric icon={FlaskConical} label="Water quality" value={`${Math.round(qualityScore)}/100`} note="Current quality index"/><Metric icon={ShieldAlert} label="Tank level" value={`${Math.round(tank)}%`} note={`Alert below ${lowThreshold}%`}/></section>

    <section className="chart-card"><div className="chart-header"><div><div className="eyebrow">CONSUMPTION LOG</div><h2>Usage history</h2><p>Track water consumption over the last 24 hours or 7 days.</p></div><div className="range-tabs"><button className={range==='24h'?'active':''} onClick={()=>setRange('24h')}>24 hours</button><button className={range==='7d'?'active':''} onClick={()=>setRange('7d')}>7 days</button></div></div><div className="legend"><span><i className="mun-dot"/>Municipal</span><span><i className="rain-dot"/>Rainwater</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}><defs><linearGradient id="municipalFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0077b6" stopOpacity=".18"/><stop offset="100%" stopColor="#0077b6" stopOpacity="0"/></linearGradient><linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#59aaa9" stopOpacity=".18"/><stop offset="100%" stopColor="#59aaa9" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="#a9c9ca" strokeOpacity=".28"/><XAxis dataKey="label" tick={{fontSize:11,fill:'#58717c'}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:11,fill:'#58717c'}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{borderRadius:14,border:'1px solid #a9c9ca',fontFamily:'Nunito'}}/><Area type="monotone" dataKey="municipal" stroke="#0077b6" strokeWidth={2.5} fill="url(#municipalFill)"/><Area type="monotone" dataKey="rainwater" stroke="#4b9ea1" strokeWidth={2.5} fill="url(#rainFill)"/></AreaChart></ResponsiveContainer></div></section>
  </>
}

function MiniStat({icon:Icon,label,value}) { return <div className="mini-control-stat"><span><Icon size={14}/></span><div><b>{value}</b><small>{label}</small></div></div> }
function Metric({icon:Icon,label,value,note}) { return <div className="metric-card"><div className="metric-head"><span className="metric-icon"><Icon size={17}/></span><span>{label}</span></div><strong>{value}</strong><small>{note}</small></div> }
function Section({children}) { return <section className="module-section">{children}</section> }

function HistoryPage({data}) {
  const municipal=data.reduce((a,b)=>a+b.municipal,0), rain=data.reduce((a,b)=>a+b.rainwater,0), share=Math.round(rain/(municipal+rain)*100), pie=[{name:'Municipal',value:municipal},{name:'Rainwater',value:rain}]
  return <Section><div className="module-title"><div><div className="eyebrow">ANALYTICS CENTER</div><h2>Water usage history</h2><p>Review consumption trends and source contribution.</p></div><div className="mini-stat"><b>{share}%</b><span>rainwater share</span></div></div><div className="chart-card"><div className="chart-header"><div><div className="eyebrow">SOURCE COMPARISON</div><h2>Consumption trend</h2><p>Municipal vs rainwater over the selected period.</p></div></div><div className="chart-wrap tall"><ResponsiveContainer><LineChart data={data}><CartesianGrid stroke="#a9c9ca" strokeOpacity=".25" vertical={false}/><XAxis dataKey="label" tick={{fontSize:10}} tickLine={false} axisLine={false}/><YAxis tick={{fontSize:10}} tickLine={false} axisLine={false}/><Tooltip/><Line type="monotone" dataKey="municipal" name="Municipal" stroke="#0077b6" strokeWidth={3} dot={false}/><Line type="monotone" dataKey="rainwater" name="Rainwater" stroke="#4b9ea1" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div></div><div className="two-col"><div className="chart-card"><div className="eyebrow">SOURCE MIX</div><h2>Water source distribution</h2><div className="pie-wrap"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={3}>{pie.map((_,i)=><Cell key={i} fill={i===0?'#0077b6':'#4b9ea1'}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut"><div><b>{share}%</b><span>rainwater</span></div></div></div></div><div className="insight-card"><div className="metric-icon"><Sparkles size={17}/></div><h3>Usage insight</h3><p>Use harvested rainwater when available to reduce dependence on the main supply.</p><strong>{Math.round(rain)} L</strong><small>rainwater contribution</small></div></div></Section>
}

function RainwaterPage({rainTank,rainCollected,source,setSource,autoRain,setAutoRain}) {
  const available = Math.round((100-rainTank)*7.5)
  return <Section><div className="module-title"><div><div className="eyebrow">RAINWATER CENTER</div><h2>Rainwater harvesting</h2><p>A simple view of collection, storage and reuse.</p></div><div className="status-chip">● Collection system healthy</div></div><div className="rain-grid"><div className="big-rain-card"><div className="eyebrow">STORAGE TANK</div><div className="rain-big"><b>{Math.round(rainTank)}%</b><span>capacity</span></div><div className="capacity-bar"><span style={{width:`${rainTank}%`}}/></div><div className="rain-details"><span>Available space <b>{available} L</b></span><span>Stored <b>{Math.round(rainTank*7.5)} L</b></span></div></div><Metric icon={CloudRain} label="Collected today" value={`${Math.round(rainCollected)} L`} note="Live collection counter"/><Metric icon={ArrowDownToLine} label="Next-rain capacity" value={`${available} L`} note="Available storage"/></div><div className="rain-feature-grid"><Feature icon={Activity} title="Catchment efficiency" value="86%" text="Roof runoff is being captured efficiently."/><Feature icon={CloudRain} title="Rain forecast capacity" value={`${available} L`} text="Current free storage for the next rainfall."/><Feature icon={Droplets} title="Rainwater stored" value={`${Math.round(rainTank*7.5)} L`} text="Estimated water currently available."/></div><div className="source-card"><div><div className="eyebrow">WATER SOURCE</div><h2>Supply routing</h2><p>Choose which source supplies the household, with rainwater available as a reusable source.</p></div><div className="source-controls"><div className="segmented"><button className={source==='municipal'?'selected':''} onClick={()=>setSource('municipal')}><Droplets size={17}/> Municipal</button><button className={source==='rainwater'?'selected':''} onClick={()=>setSource('rainwater')}><CloudRain size={17}/> Rainwater</button></div><label className="check-row"><input type="checkbox" checked={autoRain} onChange={e=>setAutoRain(e.target.checked)}/><span className="fake-check">✓</span><span><b>Auto-prioritize rainwater</b><small>Use rainwater when storage is available</small></span></label></div></div></Section>
}
function Feature({icon:Icon,title,value,text}) { return <div className="feature-card"><span className="feature-icon"><Icon size={18}/></span><div><div className="feature-label">{title}</div><strong>{value}</strong><p>{text}</p></div></div> }
function AlertsPage({lowTank,tank,threshold}) { return <Section><div className="module-title"><div><div className="eyebrow">SYSTEM MONITOR</div><h2>Alerts</h2><p>Important water-level notifications.</p></div><div className="alert-count">{lowTank ? 1 : 0} active</div></div><div className="alert-list"><div className={`alert-row ${lowTank?'active-alert':''}`}><div className="alert-row-icon"><Droplets size={19}/></div><div><b>Low tank level</b><p>Tank is at {Math.round(tank)}%. Your alert threshold is {threshold}%.</p></div><span className={lowTank?'warning-state':'ok-state'}>{lowTank?'ACTION NEEDED':'NORMAL'}</span></div></div></Section> }
function SettingsPage({dark,setDark,lowThreshold,setLowThreshold,notifications,setNotifications,autoRain,setAutoRain}) { return <Section><div className="module-title"><div><div className="eyebrow">CONTROL CENTER</div><h2>System settings</h2><p>Configure the essential monitoring options.</p></div></div><div className="settings-grid"><div className="setting-card"><div><b>Appearance</b><p>Switch between light and dark themes.</p></div><button className="setting-toggle" onClick={()=>setDark(v=>!v)}>{dark?'☀ Light mode':'☾ Dark mode'}</button></div><div className="setting-card"><div><b>Notifications</b><p>Show low tank warning banners.</p></div><button className={`setting-toggle ${notifications?'on':''}`} onClick={()=>setNotifications(v=>!v)}>{notifications?'Enabled':'Disabled'}</button></div><div className="setting-card"><div><b>Auto-prioritize rainwater</b><p>Prefer stored rainwater when available.</p></div><button className={`setting-toggle ${autoRain?'on':''}`} onClick={()=>setAutoRain(v=>!v)}>{autoRain?'Enabled':'Disabled'}</button></div><div className="setting-card"><div><b>Low tank threshold</b><p>Show an alert below this level.</p></div><input type="range" min="5" max="50" value={lowThreshold} onChange={e=>setLowThreshold(+e.target.value)}/><strong>{lowThreshold}%</strong></div></div></Section> }

createRoot(document.getElementById('root')).render(<App />)
