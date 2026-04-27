"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  PanelLeftClose, PanelLeftOpen,
  Bell, Mail, MessageSquare, User,
  Sun, Moon, X, Send, Plus, Check,
  Settings, LogOut, Edit3, ChevronRight,
  Wallet, CalendarDays, Briefcase, Shield, UserPlus,
  ArrowLeft,
} from "lucide-react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
const COLLAPSED_W = 62;
const EXPANDED_W  = 256;

const B = {
  900:"#1e3a8a",800:"#1e40af",700:"#1d4ed8",600:"#2563eb",500:"#3b82f6",
  400:"#60a5fa",300:"#93c5fd",200:"#bfdbfe",100:"#dbeafe",50:"#eff6ff",
};

/* ─── Mock data ─── */
const INIT_NOTIFS = [
  { id:1, title:"Leave Request",     desc:"Sarah Chen submitted a leave request for Apr 28–30.", time:"2 min ago",  read:false, type:"leave"   },
  { id:2, title:"Payroll Processed", desc:"Payroll for March 2026 has been processed successfully.", time:"1 hr ago", read:false, type:"payroll" },
  { id:3, title:"Onboarding Done",   desc:"James Okafor completed all onboarding tasks.", time:"3 hrs ago", read:false, type:"onboard" },
  { id:4, title:"New Application",   desc:"Application received for UI/UX Lead position.", time:"5 hrs ago", read:true,  type:"recruit" },
  { id:5, title:"System Backup",     desc:"System backup completed successfully.", time:"Yesterday", read:true, type:"system"  },
];
const INIT_EMAILS = [
  { id:1, from:"HR Department",  subject:"Monthly HR Report",         preview:"Please find attached the monthly HR report...", time:"9:42 AM",   read:false },
  { id:2, from:"CEO Office",     subject:"Q1 Performance Review",     preview:"We will be conducting the Q1 review next week.", time:"Yesterday", read:false },
  { id:3, from:"Payroll Team",   subject:"Payroll Confirmation",      preview:"Your payroll for March has been processed.",    time:"Mon",       read:true  },
  { id:4, from:"IT Department",  subject:"System Maintenance Notice", preview:"Scheduled downtime Sunday 2–4 AM.",             time:"Sun",       read:true  },
];
const INIT_CHATS = [
  { id:1, name:"Sarah Chen",   role:"UI/UX Lead",         last:"Can you check my leave request?",  time:"2 min",    unread:2, av:"SC" },
  { id:2, name:"James Okafor", role:"Payroll Manager",    last:"The March payroll is ready.",       time:"1 hr",     unread:0, av:"JO" },
  { id:3, name:"Amelia Chen",  role:"Talent Acquisition", last:"New CV just arrived for review.",   time:"3 hr",     unread:1, av:"AC" },
  { id:4, name:"David Mensah", role:"Benefits Analyst",   last:"Benefits updated successfully.",   time:"Yesterday",unread:0, av:"DM" },
];
const NOTIF_ICONS: Record<string,any> = {
  leave:CalendarDays, payroll:Wallet, onboard:UserPlus, recruit:Briefcase, system:Shield,
};

type Panel   = "notifications"|"email"|"chat"|"profile"|null;
type ChatMsg = { id:number; text:string; from:"me"|"them"; time:string };
type ChatView= { contact:typeof INIT_CHATS[0]; messages:ChatMsg[] } | null;
type AdminUser = { name:string; email:string; initials:string } | null;

function initials2(name:string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0]+p[1][0]).toUpperCase() : name.slice(0,2).toUpperCase();
}

export default function DashboardLayout({ children }:{ children:React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const [isDesktop,   setIsDesktop]   = useState(false);
  const [theme,       setTheme]       = useState<"light"|"dark">("light");
  const [panel,       setPanel]       = useState<Panel>(null);
  const [notifs,      setNotifs]      = useState(INIT_NOTIFS);
  const [emails,      setEmails]      = useState(INIT_EMAILS);
  const [chats,       setChats]       = useState(INIT_CHATS);
  const [chatView,    setChatView]    = useState<ChatView>(null);
  const [chatMsg,     setChatMsg]     = useState("");
  const [compose,     setCompose]     = useState<{to:string;subject:string;body:string}|null>(null);
  const [adminUser,   setAdminUser]   = useState<AdminUser>(null);
  const chatEndRef    = useRef<HTMLDivElement>(null);
  const hoverTimer    = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    const chk = () => { const d = window.innerWidth >= 1024; setIsDesktop(d); if (!d) setCollapsed(true); };
    chk(); window.addEventListener("resize", chk); return () => window.removeEventListener("resize", chk);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatView?.messages]);
  useEffect(() => {
    fetch("/api/auth/me").then(r=>r.json()).then(d => {
      if (d.user) {
        const p = (d.user.name||"").trim().split(/\s+/);
        const ini = p.length>=2 ? (p[0][0]+p[p.length-1][0]).toUpperCase() : (d.user.name||"AD").slice(0,2).toUpperCase();
        setAdminUser({ name:d.user.name, email:d.user.email, initials:ini });
        // New companies that haven't completed setup are redirected to the wizard
        if (d.user.role === "admin" && d.isOnboarded === false) {
          window.location.replace("/setup");
        }
      }
    }).catch(()=>{});
  }, []);

  const sidebarW    = isDesktop ? (collapsed ? COLLAPSED_W : EXPANDED_W) : 0;
  const unreadN     = notifs.filter(n=>!n.read).length;
  const unreadE     = emails.filter(e=>!e.read).length;
  const unreadC     = chats.reduce((s,c)=>s+c.unread, 0);
  const toggle      = (p:Panel) => setPanel(prev => prev===p ? null : p);

  /* Hover helpers — 120 ms grace period so cursor can travel to the dropdown */
  const hoverEnter  = (p: Panel) => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setPanel(p); };
  const hoverLeave  = ()         => { hoverTimer.current = setTimeout(() => setPanel(prev => prev==="chat" ? prev : null), 120); };

  const openChat = (contact: typeof INIT_CHATS[0]) => {
    setChatView({ contact, messages:[
      { id:1, text:`Hi Admin, ${contact.last}`, from:"them", time:"10:00 AM" },
      { id:2, text:"Thanks for reaching out, I'll look into it.", from:"me", time:"10:02 AM" },
      { id:3, text:"Sure, let me know if you need anything else.", from:"them", time:"10:03 AM" },
    ]});
    setChats(c => c.map(x => x.id===contact.id ? {...x,unread:0} : x));
  };
  const sendMsg = () => {
    if (!chatMsg.trim()||!chatView) return;
    const t = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setChatView(prev => prev ? { ...prev, messages:[...prev.messages,{id:Date.now(),text:chatMsg.trim(),from:"me",time:t}] } : prev);
    setChatMsg("");
  };

  /* ─── Shared input style ─── */
  const inp: React.CSSProperties = {
    width:"100%", padding:"8px 11px", borderRadius:8,
    border:"1px solid var(--border)", background:"var(--bg-input)",
    color:"var(--text-primary)", fontSize:12, outline:"none",
    boxSizing:"border-box", fontFamily:"Poppins,sans-serif",
  };

  /* ─── Dropdown card wrapper ─── */
  const DD = ({ children:c, width=360 }:{ children:React.ReactNode; width?:number }) => (
    <div className="dd-card" style={{
      position:"absolute", top:"calc(100% + 10px)", right:0,
      width, maxHeight:520, borderRadius:14,
      background:"var(--bg-card)", border:"1px solid var(--border)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
      zIndex:500, display:"flex", flexDirection:"column",
      overflow:"hidden", fontFamily:"Poppins,sans-serif",
    }}>
      {c}
    </div>
  );

  /* ─── Dropdown header ─── */
  const DDHead = ({ title, badge, action, onBack }:{title:string;badge?:number;action?:React.ReactNode;onBack?:()=>void}) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px 11px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {onBack && (
          <button onClick={onBack} style={{ width:24, height:24, borderRadius:6, border:"1px solid var(--border)", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)" }}>
            <ArrowLeft size={12}/>
          </button>
        )}
        <span style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", letterSpacing:-0.2 }}>{title}</span>
        {!!badge && badge>0 && (
          <span style={{ minWidth:18,height:18,borderRadius:9,background:B[600],color:"#fff",fontSize:10,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 4px" }}>{badge}</span>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {action}
        <button onClick={() => setPanel(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:2,display:"flex",lineHeight:1 }}>
          <X size={15}/>
        </button>
      </div>
    </div>
  );

  /* ─── Scrollable body ─── */
  const DDBody = ({ children:c, style:s }:{ children:React.ReactNode; style?:React.CSSProperties }) => (
    <div className="dd-scroll" style={{ overflowY:"auto", flex:1, ...s }}>{c}</div>
  );

  /* ─── Footer ─── */
  const DDFoot = ({ text }:{ text:string }) => (
    <div style={{ padding:"10px 16px", borderTop:"1px solid var(--border)", textAlign:"center", flexShrink:0 }}>
      <span style={{ fontSize:11, color:"var(--text-muted)", fontWeight:400 }}>{text}</span>
    </div>
  );

  /* ─── Icon topbar button ─── */
  const IBtn = ({ icon:Icon, badge, active, onClick }:{ icon:any; badge?:number; active?:boolean; onClick:()=>void }) => (
    <button onClick={onClick} className="p-iBtn" style={{
      position:"relative", width:34,height:34,borderRadius:8,
      border:`1px solid ${active ? B[300] : "var(--border)"}`,
      background: active ? B[50] : "transparent",
      color: active ? B[600] : "var(--text-muted)",
      cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
      flexShrink:0, transition:"all 0.15s",
    }}>
      <Icon size={14} strokeWidth={1.9}/>
      {!!badge && badge>0 && (
        <span style={{ position:"absolute",top:-4,right:-4,minWidth:15,height:15,borderRadius:8,background:B[600],color:"#fff",fontSize:8.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--bg-card)",padding:"0 2px" }}>{badge}</span>
      )}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .nera-layout * { font-family:'Poppins',sans-serif !important; }
        .dd-scroll { overflow-y:auto; }
        .dd-scroll::-webkit-scrollbar { width:3px; }
        .dd-scroll::-webkit-scrollbar-track { background:transparent; }
        .dd-scroll::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
        @keyframes dd-in { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .dd-card { animation:dd-in 0.18s cubic-bezier(0.16,1,0.3,1) forwards; }
        /* Transparent bridge fills the gap between icon and dropdown so mouse travel doesn't close it */
        .dd-wrap::after { content:""; position:absolute; top:100%; left:-20px; right:-20px; height:14px; }
        .p-row:hover  { background:var(--bg-hover) !important; }
        .p-menu:hover { background:var(--bg-hover) !important; }
        .p-iBtn:hover { background:${B[50]} !important; color:${B[600]} !important; border-color:${B[200]} !important; }
        .chat-overlay { position:fixed;inset:0;top:56px;z-index:199;background:rgba(0,0,0,0.12);backdrop-filter:blur(1px); }
        @keyframes chat-slide-in  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes chat-slide-out { from { transform:translateX(0);    opacity:1; } to { transform:translateX(100%); opacity:0; } }
      `}</style>

      <div className="nera-layout" style={{ minHeight:"100vh",background:"var(--bg)" }}>

        <Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)} collapsed={collapsed} onToggleCollapse={()=>setCollapsed(c=>!c)}/>

        <div style={{ minHeight:"100vh",paddingLeft:sidebarW,transition:"padding-left 0.26s cubic-bezier(.4,0,.2,1)" }}>

          {/* ══ TOP BAR ══ */}
          <div style={{ position:"sticky",top:0,zIndex:30,display:"flex",alignItems:"center",gap:6,padding:"0 20px 0 10px",borderBottom:"1px solid var(--border)",background:"var(--bg-card)",height:56,overflow:"visible" }}>

            <button
              className="hidden lg:flex p-iBtn"
              onClick={()=>setCollapsed(c=>!c)}
              style={{ width:34,height:34,borderRadius:8,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",flexShrink:0,alignItems:"center",justifyContent:"center",color:"var(--text-muted)",transition:"all 0.15s" }}
            >
              {collapsed ? <PanelLeftOpen size={14}/> : <PanelLeftClose size={14}/>}
            </button>

            <div style={{ flex:1,minWidth:0 }}><Header onMenuClick={()=>setSidebarOpen(true)}/></div>

            {/* ── Right icons ── */}
            <div style={{ display:"flex",alignItems:"center",gap:4,flexShrink:0 }}>

              {/* Theme */}
              <button
                className="p-iBtn"
                onClick={()=>setTheme(t=>t==="light"?"dark":"light")}
                style={{ width:34,height:34,borderRadius:8,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)",transition:"all 0.15s",flexShrink:0 }}
              >
                {theme==="light" ? <Moon size={14}/> : <Sun size={14}/>}
              </button>

              {/* ── Bell dropdown ── */}
              <div className="dd-wrap" style={{ position:"relative" }} onMouseEnter={()=>hoverEnter("notifications")} onMouseLeave={hoverLeave}>
                <IBtn icon={Bell} badge={unreadN} active={panel==="notifications"} onClick={()=>toggle("notifications")}/>
                {panel==="notifications" && (
                  <DD width={360}>
                    <DDHead
                      title="Notifications" badge={unreadN}
                      action={unreadN>0 ? (
                        <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{ fontSize:12,fontWeight:500,color:B[600],background:"none",border:"none",cursor:"pointer",padding:0,whiteSpace:"nowrap" }}>
                          Mark all read
                        </button>
                      ) : undefined}
                    />
                    <DDBody>
                      {notifs.length===0 ? (
                        <div style={{ textAlign:"center",padding:"40px 24px" }}>
                          <Bell size={28} style={{ color:"var(--text-muted)",marginBottom:10 }}/>
                          <p style={{ margin:0,fontSize:12,fontWeight:600,color:"var(--text-primary)" }}>No notifications</p>
                          <p style={{ margin:"3px 0 0",fontSize:11,color:"var(--text-muted)" }}>You're all caught up</p>
                        </div>
                      ) : notifs.map(n => {
                        const Icon = NOTIF_ICONS[n.type]||Bell;
                        return (
                          <div
                            key={n.id} className="p-row"
                            onClick={()=>setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}
                            style={{ display:"flex",alignItems:"flex-start",gap:11,padding:"12px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer",background:n.read?"transparent":B[50],transition:"background 0.12s",position:"relative" }}
                          >
                            <div style={{ width:34,height:34,borderRadius:9,background:"var(--bg-hover)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
                              <Icon size={14} style={{ color:n.read?"var(--text-muted)":B[600] }}/>
                            </div>
                            <div style={{ flex:1,minWidth:0,paddingRight:32 }}>
                              <p style={{ margin:0,fontSize:12,fontWeight:n.read?500:700,color:"var(--text-primary)",lineHeight:1.4 }}>{n.title}</p>
                              <p style={{ margin:"2px 0 0",fontSize:11,color:"var(--text-secondary)",lineHeight:1.5 }}>{n.desc}</p>
                              <p style={{ margin:"4px 0 0",fontSize:10.5,color:"var(--text-muted)" }}>{n.time}</p>
                            </div>
                            <div style={{ position:"absolute",top:12,right:12,display:"flex",alignItems:"center",gap:5 }}>
                              {!n.read && <span style={{ width:6,height:6,borderRadius:"50%",background:B[500],display:"block" }}/>}
                              <button
                                onClick={e=>{e.stopPropagation();setNotifs(prev=>prev.filter(x=>x.id!==n.id));}}
                                style={{ width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:0,borderRadius:4 }}
                              >
                                <X size={11}/>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </DDBody>
                    <DDFoot text={`${notifs.length} total notification${notifs.length!==1?"s":""}`}/>
                  </DD>
                )}
              </div>

              {/* ── Mail dropdown ── */}
              <div className="dd-wrap" style={{ position:"relative" }} onMouseEnter={()=>hoverEnter("email")} onMouseLeave={hoverLeave}>
                <IBtn icon={Mail} badge={unreadE} active={panel==="email"} onClick={()=>toggle("email")}/>
                {panel==="email" && (
                  <DD width={360}>
                    {compose ? (
                      <>
                        <DDHead title="New Email" onBack={()=>setCompose(null)}/>
                        <DDBody style={{ padding:14 }}>
                          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                            {(["to","subject"] as const).map(k=>(
                              <div key={k}>
                                <label style={{ fontSize:10,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:4 }}>{k==="to"?"To":"Subject"}</label>
                                <input value={compose[k]} onChange={e=>setCompose({...compose,[k]:e.target.value})} style={inp} placeholder={k==="to"?"recipient@email.com":"Email subject"}/>
                              </div>
                            ))}
                            <div>
                              <label style={{ fontSize:10,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:4 }}>Message</label>
                              <textarea value={compose.body} onChange={e=>setCompose({...compose,body:e.target.value})} style={{ ...inp,minHeight:140,resize:"none" } as React.CSSProperties} placeholder="Write your message..."/>
                            </div>
                            <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
                              <button onClick={()=>setCompose(null)} style={{ padding:"7px 14px",borderRadius:7,border:"1px solid var(--border)",background:"transparent",color:"var(--text-secondary)",fontSize:12,fontWeight:500,cursor:"pointer" }}>Cancel</button>
                              <button onClick={()=>{alert("Email sent!");setCompose(null);}} style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:7,border:"none",background:B[600],color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer" }}>
                                <Send size={11}/> Send
                              </button>
                            </div>
                          </div>
                        </DDBody>
                      </>
                    ) : (
                      <>
                        <DDHead
                          title="Inbox" badge={unreadE}
                          action={
                            <button onClick={()=>setCompose({to:"",subject:"",body:""})} style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:`1px solid ${B[200]}`,background:B[50],color:B[700],fontSize:11,fontWeight:600,cursor:"pointer" }}>
                              <Plus size={10}/> Compose
                            </button>
                          }
                        />
                        <DDBody>
                          {emails.map(email=>(
                            <div
                              key={email.id} className="p-row"
                              onClick={()=>setEmails(e=>e.map(x=>x.id===email.id?{...x,read:true}:x))}
                              style={{ display:"flex",alignItems:"flex-start",gap:11,padding:"11px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer",background:email.read?"transparent":B[50],transition:"background 0.12s" }}
                            >
                              <div style={{ width:32,height:32,borderRadius:8,background:email.read?"var(--bg-hover)":B[100],border:`1px solid ${email.read?"var(--border)":B[200]}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:700,color:email.read?"var(--text-muted)":B[700],flexShrink:0 }}>
                                {initials2(email.from)}
                              </div>
                              <div style={{ flex:1,minWidth:0 }}>
                                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2 }}>
                                  <span style={{ fontSize:12,fontWeight:email.read?500:700,color:"var(--text-primary)" }}>{email.from}</span>
                                  <span style={{ fontSize:10,color:"var(--text-muted)",whiteSpace:"nowrap",marginLeft:8 }}>{email.time}</span>
                                </div>
                                <p style={{ margin:"0 0 2px",fontSize:11.5,fontWeight:email.read?400:600,color:"var(--text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{email.subject}</p>
                                <p style={{ margin:0,fontSize:11,color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{email.preview}</p>
                              </div>
                              {!email.read && <span style={{ width:6,height:6,borderRadius:"50%",background:B[500],flexShrink:0,marginTop:4 }}/>}
                            </div>
                          ))}
                        </DDBody>
                        <DDFoot text={`${emails.length} total emails`}/>
                      </>
                    )}
                  </DD>
                )}
              </div>

              {/* ── Chat — slide panel only ── */}
              <IBtn icon={MessageSquare} badge={unreadC} active={panel==="chat"} onClick={()=>toggle("chat")}/>

              <div style={{ width:1,height:20,background:"var(--border)",margin:"0 2px" }}/>

              {/* ── Profile dropdown ── */}
              <div className="dd-wrap" style={{ position:"relative" }} onMouseEnter={()=>hoverEnter("profile")} onMouseLeave={hoverLeave}>
                <button
                  onClick={()=>toggle("profile")}
                  style={{ display:"flex",alignItems:"center",gap:8,padding:"3px 10px 3px 4px",borderRadius:9,border:`1px solid ${panel==="profile"?B[300]:"var(--border)"}`,background:panel==="profile"?B[50]:"transparent",cursor:"pointer",flexShrink:0,transition:"all 0.15s" }}
                >
                  <div style={{ width:26,height:26,borderRadius:7,background:B[600],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0 }}>
                    {adminUser?.initials||"AD"}
                  </div>
                  <span style={{ fontSize:12,fontWeight:600,color:"var(--text-primary)",whiteSpace:"nowrap" }}>
                    {adminUser?.name?.split(" ")[0]||"Admin"}
                  </span>
                </button>

                {panel==="profile" && (
                  <DD width={360}>
                    {/* Profile hero */}
                    <div style={{ padding:"16px 16px 14px",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                        <div style={{ width:44,height:44,borderRadius:12,background:B[600],display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0 }}>
                          {adminUser?.initials||"AD"}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <p style={{ margin:0,fontSize:13,fontWeight:700,color:"var(--text-primary)",letterSpacing:-0.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{adminUser?.name||"Administrator"}</p>
                          <p style={{ margin:"2px 0 0",fontSize:11,color:B[500],fontWeight:500 }}>Administrator</p>
                          <p style={{ margin:"1px 0 0",fontSize:10.5,color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{adminUser?.email||""}</p>
                        </div>
                      </div>
                      {/* Stats */}
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderRadius:9,overflow:"hidden",border:"1px solid var(--border)" }}>
                        {[{l:"Employees",v:"11"},{l:"Departments",v:"5"},{l:"Payrolls",v:"3"}].map((s,i)=>(
                          <div key={s.l} style={{ textAlign:"center",padding:"9px 4px",background:"var(--bg-hover)",borderLeft:i>0?"1px solid var(--border)":"none" }}>
                            <p style={{ margin:0,fontSize:15,fontWeight:700,color:B[700],letterSpacing:-0.4 }}>{s.v}</p>
                            <p style={{ margin:"1px 0 0",fontSize:9,color:"var(--text-muted)",fontWeight:500 }}>{s.l}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Appearance */}
                    <div style={{ padding:"12px 14px",borderBottom:"1px solid var(--border)" }}>
                      <p style={{ margin:"0 0 8px",fontSize:10,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.07em" }}>Appearance</p>
                      <div style={{ display:"flex",gap:6 }}>
                        {(["light","dark"] as const).map(t=>(
                          <button key={t} onClick={()=>setTheme(t)} style={{ flex:1,padding:"7px 0",borderRadius:8,border:`1px solid ${theme===t?B[300]:"var(--border)"}`,background:theme===t?B[50]:"transparent",color:theme===t?B[700]:"var(--text-secondary)",fontSize:11.5,fontWeight:theme===t?600:400,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all 0.15s" }}>
                            {t==="light"?<Sun size={11}/>:<Moon size={11}/>}
                            {t.charAt(0).toUpperCase()+t.slice(1)}
                            {theme===t&&<Check size={10}/>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Menu */}
                    <div style={{ padding:"6px 8px" }}>
                      {[
                        {icon:User,    label:"My Profile",       sub:"View account details"   },
                        {icon:Settings,label:"Account Settings", sub:"Preferences & security" },
                        {icon:Edit3,   label:"Edit Profile",     sub:"Update your information"},
                      ].map(item=>(
                        <button key={item.label} className="p-menu" style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 8px",borderRadius:8,border:"none",background:"transparent",cursor:"pointer",textAlign:"left",transition:"background 0.12s",marginBottom:1 }}>
                          <div style={{ width:30,height:30,borderRadius:8,background:"var(--bg-hover)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <item.icon size={13} style={{ color:"var(--text-muted)" }}/>
                          </div>
                          <div style={{ flex:1,minWidth:0 }}>
                            <p style={{ margin:0,fontSize:12,fontWeight:600,color:"var(--text-primary)" }}>{item.label}</p>
                            <p style={{ margin:"1px 0 0",fontSize:10.5,color:"var(--text-muted)" }}>{item.sub}</p>
                          </div>
                          <ChevronRight size={12} style={{ color:"var(--text-muted)",flexShrink:0 }}/>
                        </button>
                      ))}
                    </div>

                    {/* Logout */}
                    <div style={{ padding:"6px 8px 12px",borderTop:"1px solid var(--border)" }}>
                      <button
                        className="p-menu"
                        onClick={()=>{ const p=window.location.pathname.split("/").filter(Boolean); const s=p.length>=2&&p[1]==="admin"?p[0]:""; document.cookie="session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0"; window.location.replace(s?`/${s}/login`:"/login"); }}
                        style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 8px",borderRadius:8,border:"1px solid rgba(239,68,68,0.18)",background:"rgba(254,242,242,0.6)",cursor:"pointer",textAlign:"left",transition:"background 0.12s" }}
                      >
                        <div style={{ width:30,height:30,borderRadius:8,background:"rgba(254,226,226,0.7)",border:"1px solid rgba(239,68,68,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <LogOut size={13} style={{ color:"#dc2626" }}/>
                        </div>
                        <div>
                          <p style={{ margin:0,fontSize:12,fontWeight:600,color:"#dc2626" }}>Log Out</p>
                          <p style={{ margin:"1px 0 0",fontSize:10.5,color:"#ef4444" }}>End your session</p>
                        </div>
                      </button>
                    </div>
                  </DD>
                )}
              </div>

            </div>
          </div>

          <main style={{ padding:"0 24px 32px",maxWidth:"100%",overflowX:"hidden" }}>{children}</main>
        </div>

        {/* ══ CHAT — slide panel ══ */}
        {panel==="chat" && <div className="chat-overlay" onClick={()=>setPanel(null)}/>}
        <div style={{
          position:"fixed",top:56,right:0,bottom:0,width:380,maxWidth:"100vw",
          background:"var(--bg-card)",borderLeft:"1px solid var(--border)",
          boxShadow:panel==="chat"?"-6px 0 32px rgba(0,0,0,0.10)":"none",
          zIndex:200,
          transform:panel==="chat"?"translateX(0)":"translateX(100%)",
          transition:"transform 0.32s cubic-bezier(0.16,1,0.3,1), box-shadow 0.32s",
          display:"flex",flexDirection:"column",fontFamily:"Poppins,sans-serif",overflow:"hidden",
        }}>
          {chatView ? (
            <>
              {/* Chat conversation header */}
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
                <button onClick={()=>setChatView(null)} style={{ width:28,height:28,borderRadius:7,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-muted)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <ArrowLeft size={13}/>
                </button>
                <div style={{ position:"relative",flexShrink:0 }}>
                  <div style={{ width:34,height:34,borderRadius:9,background:B[100],border:`1px solid ${B[200]}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:B[700] }}>
                    {chatView.contact.av}
                  </div>
                  <span style={{ position:"absolute",bottom:-1,right:-1,width:9,height:9,borderRadius:"50%",background:B[400],border:"2px solid var(--bg-card)" }}/>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ margin:0,fontSize:13,fontWeight:700,color:"var(--text-primary)" }}>{chatView.contact.name}</p>
                  <p style={{ margin:0,fontSize:10.5,color:B[500],fontWeight:500 }}>{chatView.contact.role}</p>
                </div>
                <button onClick={()=>setPanel(null)} style={{ width:26,height:26,borderRadius:6,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-muted)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <X size={13}/>
                </button>
              </div>

              {/* Messages */}
              <div className="dd-scroll" style={{ flex:1,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10 }}>
                {chatView.messages.map(msg=>(
                  <div key={msg.id} style={{ display:"flex",flexDirection:"column",alignItems:msg.from==="me"?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"78%",padding:"9px 13px",borderRadius:msg.from==="me"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:msg.from==="me"?B[600]:"var(--bg-hover)",color:msg.from==="me"?"#fff":"var(--text-primary)",fontSize:12,lineHeight:1.55,border:msg.from==="me"?"none":"1px solid var(--border)" }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize:10,color:"var(--text-muted)",margin:"3px 3px 0" }}>{msg.time}</span>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>

              {/* Input */}
              <div style={{ padding:"10px 14px",borderTop:"1px solid var(--border)",display:"flex",gap:8,flexShrink:0 }}>
                <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message…" style={{ ...inp,flex:1 }}/>
                <button onClick={sendMsg} style={{ width:34,height:34,borderRadius:8,border:"none",background:B[600],color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <Send size={13}/>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Chat list header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px 11px",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:"var(--text-primary)" }}>Messages</span>
                  {unreadC>0 && <span style={{ minWidth:18,height:18,borderRadius:9,background:B[600],color:"#fff",fontSize:10,fontWeight:700,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 4px" }}>{unreadC}</span>}
                </div>
                <button onClick={()=>setPanel(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:2,display:"flex" }}><X size={15}/></button>
              </div>

              {/* Chat list */}
              <div className="dd-scroll" style={{ flex:1 }}>
                {chats.map(chat=>(
                  <div key={chat.id} className="p-row" onClick={()=>openChat(chat)} style={{ display:"flex",alignItems:"center",gap:11,padding:"12px 14px",borderBottom:"1px solid var(--border)",cursor:"pointer",transition:"background 0.12s" }}>
                    <div style={{ position:"relative",flexShrink:0 }}>
                      <div style={{ width:38,height:38,borderRadius:10,background:chat.unread>0?B[100]:"var(--bg-hover)",border:`1px solid ${chat.unread>0?B[200]:"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:chat.unread>0?B[700]:"var(--text-muted)" }}>
                        {chat.av}
                      </div>
                      <span style={{ position:"absolute",bottom:-1,right:-1,width:8,height:8,borderRadius:"50%",background:B[400],border:"2px solid var(--bg-card)" }}/>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1 }}>
                        <span style={{ fontSize:12.5,fontWeight:chat.unread>0?700:500,color:"var(--text-primary)" }}>{chat.name}</span>
                        <span style={{ fontSize:10,color:"var(--text-muted)" }}>{chat.time}</span>
                      </div>
                      <p style={{ margin:0,fontSize:11,color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{chat.last}</p>
                    </div>
                    {chat.unread>0 && <span style={{ minWidth:17,height:17,borderRadius:9,background:B[600],color:"#fff",fontSize:9.5,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",flexShrink:0 }}>{chat.unread}</span>}
                  </div>
                ))}
              </div>
              <div style={{ padding:"10px 16px",borderTop:"1px solid var(--border)",textAlign:"center" }}>
                <span style={{ fontSize:11,color:"var(--text-muted)" }}>{chats.length} conversations</span>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  );
}
