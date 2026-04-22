"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  PanelLeftClose, PanelLeftOpen,
  Bell, Mail, MessageSquare, User,
  Sun, Moon, X, Send, Plus, Trash2,
  Check, CheckCheck, Circle, Settings,
  LogOut, Edit3, ChevronRight,
} from "lucide-react";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";

const COLLAPSED_W = 62;
const EXPANDED_W  = 256;

const BLUE = {
  700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6",
  400: "#60a5fa", 300: "#93c5fd", 200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

/* ── Mock data ── */
const MOCK_NOTIFICATIONS = [
  { id:1, text:"Sarah Chen submitted a leave request", time:"2 min ago",  read:false, type:"leave"   },
  { id:2, text:"Payroll for March 2026 has been processed", time:"1 hr ago",  read:false, type:"payroll" },
  { id:3, text:"James Okafor completed onboarding tasks", time:"3 hrs ago", read:true,  type:"onboard" },
  { id:4, text:"New job application received for UI/UX Lead", time:"5 hrs ago", read:true,  type:"recruit" },
  { id:5, text:"System backup completed successfully", time:"Yesterday",   read:true,  type:"system"  },
];

const MOCK_EMAILS = [
  { id:1, from:"hr@company.com",       subject:"Monthly HR Report",            preview:"Please find attached the monthly HR...", time:"9:42 AM",  read:false },
  { id:2, from:"ceo@company.com",      subject:"Q1 Performance Review",        preview:"We will be conducting the Q1 review...", time:"Yesterday",read:false },
  { id:3, from:"payroll@company.com",  subject:"Payroll Confirmation",         preview:"Your payroll for March has been...",     time:"Mon",      read:true  },
  { id:4, from:"it@company.com",       subject:"System Maintenance Notice",    preview:"Scheduled downtime on Sunday 2–4 AM...", time:"Sun",     read:true  },
];

const MOCK_CHATS = [
  { id:1, name:"Sarah Chen",     role:"UI/UX Lead",      last:"Can you check my leave request?",  time:"2 min",  unread:2, avatar:"SC" },
  { id:2, name:"James Okafor",   role:"Payroll Manager", last:"The March payroll is ready.",       time:"1 hr",   unread:0, avatar:"JO" },
  { id:3, name:"Amelia Chen",    role:"Talent Acquisition",last:"New CV just arrived for review.", time:"3 hr",   unread:1, avatar:"AC" },
  { id:4, name:"David Mensah",   role:"Benefits Analyst",last:"Benefits updated successfully.",   time:"Yesterday",unread:0,avatar:"DM" },
];

type Panel = "notifications" | "email" | "chat" | "profile" | null;
type ChatView = { contact: typeof MOCK_CHATS[0]; messages: Array<{ id:number; text:string; from:"me"|"them"; time:string }> } | null;
type ComposeEmail = { to:string; subject:string; body:string } | null;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [collapsed,    setCollapsed]    = useState(false);
  const [isDesktop,    setIsDesktop]    = useState(false);
  const [theme,        setTheme]        = useState<"light"|"dark">("light");
  const [activePanel,  setActivePanel]  = useState<Panel>(null);
  const [notifications,setNotifications]= useState(MOCK_NOTIFICATIONS);
  const [emails,       setEmails]       = useState(MOCK_EMAILS);
  const [chats,        setChats]        = useState(MOCK_CHATS);
  const [chatView,     setChatView]     = useState<ChatView>(null);
  const [chatMsg,      setChatMsg]      = useState("");
  const [compose,      setCompose]      = useState<ComposeEmail>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ── Responsive ── */
  useEffect(() => {
    const check = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) setCollapsed(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Theme ── */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  /* ── Scroll chat to bottom ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chatView?.messages]);

  const sidebarW = isDesktop ? (collapsed ? COLLAPSED_W : EXPANDED_W) : 0;
  const unreadNotif = notifications.filter(n => !n.read).length;
  const unreadEmail = emails.filter(e => !e.read).length;
  const unreadChat  = chats.reduce((s,c) => s + c.unread, 0);

  const togglePanel = (p: Panel) => setActivePanel(prev => prev === p ? null : p);

  const markAllNotifRead = () => setNotifications(n => n.map(x => ({...x, read:true})));
  const markEmailRead = (id:number) => setEmails(e => e.map(x => x.id===id ? {...x,read:true} : x));

  const openChat = (contact: typeof MOCK_CHATS[0]) => {
    setChatView({
      contact,
      messages: [
        { id:1, text:`Hi Admin, ${contact.last}`, from:"them", time:"10:00 AM" },
        { id:2, text:"Thanks for reaching out, I'll look into it.",  from:"me",   time:"10:02 AM" },
        { id:3, text:"Sure, let me know if you need anything else.",  from:"them", time:"10:03 AM" },
      ],
    });
    setChats(c => c.map(x => x.id===contact.id ? {...x,unread:0} : x));
  };

  const sendChatMsg = () => {
    if (!chatMsg.trim() || !chatView) return;
    setChatView(prev => prev ? {
      ...prev,
      messages: [...prev.messages, { id: Date.now(), text: chatMsg.trim(), from:"me", time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) }],
    } : prev);
    setChatMsg("");
  };

  /* ── Icon button ── */
  const IconBtn = ({ icon: Icon, badge, active, onClick, title }: { icon:any; badge?:number; active?:boolean; onClick:()=>void; title:string }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        position:"relative", width:36, height:36, borderRadius:9,
        border:`1px solid ${active ? BLUE[400] : "var(--border)"}`,
        background: active ? BLUE[50] : "var(--bg-hover)",
        color: active ? BLUE[600] : "var(--text-muted)",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0, transition:"all 0.15s", fontFamily:"Poppins,sans-serif",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = BLUE[50];
        (e.currentTarget as HTMLButtonElement).style.color = BLUE[600];
        (e.currentTarget as HTMLButtonElement).style.borderColor = BLUE[300];
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        }
      }}
    >
      <Icon size={15}/>
      {!!badge && badge > 0 && (
        <span style={{
          position:"absolute", top:-4, right:-4,
          width:16, height:16, borderRadius:"50%",
          background: BLUE[600], color:"#fff",
          fontSize:9, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center",
          border:"2px solid var(--bg-card)",
        }}>{badge > 9 ? "9+" : badge}</span>
      )}
    </button>
  );

  /* ── Slide panel wrapper ── */
  const SlidePanel = ({ open, children: c }: { open:boolean; children:React.ReactNode }) => (
    <div style={{
      position:"fixed", top:56, right:0, bottom:0,
      width: 380, maxWidth:"100vw",
      background:"var(--bg-card)",
      borderLeft:"1px solid var(--border)",
      zIndex:200,
      transform: open ? "translateX(0)" : "translateX(100%)",
      transition:"transform 0.28s cubic-bezier(.4,0,.2,1)",
      display:"flex", flexDirection:"column",
      fontFamily:"Poppins,sans-serif",
      overflowY:"auto",
    }}>
      {c}
    </div>
  );

  /* ── Panel header ── */
  const PanelHeader = ({ title, action }: { title:string; action?:React.ReactNode }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
      <div>
        <p style={{ margin:"0 0 1px", fontSize:9.5, fontWeight:700, color:BLUE[500], textTransform:"uppercase", letterSpacing:"0.09em" }}>Panel</p>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"var(--text-primary)", letterSpacing:-0.3 }}>{title}</h3>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {action}
        <button onClick={() => setActivePanel(null)} style={{ width:28, height:28, borderRadius:7, border:"1px solid var(--border)", background:"var(--bg-hover)", cursor:"pointer", color:"var(--text-muted)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <X size={13}/>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .nera-layout * { font-family: 'Poppins', sans-serif !important; }
        .panel-overlay { position:fixed; inset:0; top:56px; z-index:199; background:rgba(0,0,0,0.18); backdrop-filter:blur(1px); }
      `}</style>

      <div className="nera-layout" style={{ minHeight:"100vh", background:"var(--bg)" }}>

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />

        <div style={{ minHeight:"100vh", paddingLeft:sidebarW, transition:"padding-left 0.26s cubic-bezier(.4,0,.2,1)" }}>

          {/* ════════════════════════════ TOP BAR ════════════════════════════ */}
          <div style={{
            position:"sticky", top:0, zIndex:30,
            display:"flex", alignItems:"center", gap:8,
            padding:"0 16px 0 8px",
            borderBottom:"1px solid var(--border)",
            background:"var(--bg-card)", height:56,
          }}>

            {/* Collapse toggle */}
            <button
              className="hidden lg:flex"
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{ width:36, height:36, borderRadius:9, border:"1px solid var(--border)", background:"var(--bg-hover)", cursor:"pointer", flexShrink:0, alignItems:"center", justifyContent:"center", color:"var(--text-muted)", transition:"all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = BLUE[600]; (e.currentTarget as HTMLButtonElement).style.color="#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor=BLUE[600]; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLButtonElement).style.color="var(--text-muted)"; (e.currentTarget as HTMLButtonElement).style.borderColor="var(--border)"; }}
            >
              {collapsed ? <PanelLeftOpen size={15}/> : <PanelLeftClose size={15}/>}
            </button>

            {/* Existing Header content */}
            <div style={{ flex:1, minWidth:0 }}>
              <Header onMenuClick={() => setSidebarOpen(true)} />
            </div>

            {/* ── Right side icons ── */}
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                style={{ width:36, height:36, borderRadius:9, border:"1px solid var(--border)", background:"var(--bg-hover)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", transition:"all 0.15s", flexShrink:0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = BLUE[50]; (e.currentTarget as HTMLButtonElement).style.color=BLUE[600]; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLButtonElement).style.color="var(--text-muted)"; }}
              >
                {theme === "light" ? <Moon size={15}/> : <Sun size={15}/>}
              </button>

              {/* Notifications */}
              <IconBtn icon={Bell} badge={unreadNotif} active={activePanel==="notifications"} onClick={() => togglePanel("notifications")} title="Notifications"/>

              {/* Email */}
              <IconBtn icon={Mail} badge={unreadEmail} active={activePanel==="email"} onClick={() => togglePanel("email")} title="Email"/>

              {/* Chat */}
              <IconBtn icon={MessageSquare} badge={unreadChat} active={activePanel==="chat"} onClick={() => togglePanel("chat")} title="Messages"/>

              {/* Divider */}
              <div style={{ width:1, height:24, background:"var(--border)", margin:"0 2px" }}/>

              {/* Admin profile button */}
              <button
                onClick={() => togglePanel("profile")}
                title="Admin Profile"
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"4px 8px 4px 4px", borderRadius:9,
                  border:`1px solid ${activePanel==="profile" ? BLUE[400] : "var(--border)"}`,
                  background: activePanel==="profile" ? BLUE[50] : "var(--bg-hover)",
                  cursor:"pointer", flexShrink:0, transition:"all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background=BLUE[50]; (e.currentTarget as HTMLButtonElement).style.borderColor=BLUE[300]; }}
                onMouseLeave={e => { if (activePanel!=="profile") { (e.currentTarget as HTMLButtonElement).style.background="var(--bg-hover)"; (e.currentTarget as HTMLButtonElement).style.borderColor="var(--border)"; } }}
              >
                <div style={{ width:28, height:28, borderRadius:7, background:BLUE[600], display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff", flexShrink:0 }}>NA</div>
                <span style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", whiteSpace:"nowrap" }}>Admin</span>
              </button>
            </div>
          </div>

          {/* Main content */}
          <main style={{ padding:"0 24px 32px", maxWidth:"100%", overflowX:"hidden" }}>
            {children}
          </main>
        </div>

        {/* ════ OVERLAY ════ */}
        {activePanel && <div className="panel-overlay" onClick={() => setActivePanel(null)} />}

        {/* ════════════════════════════
            NOTIFICATIONS PANEL
        ════════════════════════════ */}
        <SlidePanel open={activePanel==="notifications"}>
          <PanelHeader
            title="Notifications"
            action={
              unreadNotif > 0 ? (
                <button onClick={markAllNotifRead} style={{ fontSize:11, fontWeight:600, color:BLUE[600], background:"none", border:"none", cursor:"pointer", padding:"4px 8px", borderRadius:6 }}>
                  Mark all read
                </button>
              ) : undefined
            }
          />
          <div style={{ flex:1, overflowY:"auto" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => setNotifications(prev => prev.map(x => x.id===n.id ? {...x,read:true} : x))}
                style={{
                  display:"flex", alignItems:"flex-start", gap:12, padding:"14px 18px",
                  borderBottom:"1px solid var(--border)", cursor:"pointer",
                  background: n.read ? "transparent" : BLUE[50],
                  transition:"background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background="var(--bg-hover)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background= n.read ? "transparent" : BLUE[50]}
              >
                <div style={{ width:36, height:36, borderRadius:10, background:BLUE[100], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                  <Bell size={15} style={{ color:BLUE[600] }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight: n.read ? 400 : 600, color:"var(--text-primary)", lineHeight:1.5 }}>{n.text}</p>
                  <p style={{ margin:"3px 0 0", fontSize:10, color:"var(--text-muted)" }}>{n.time}</p>
                </div>
                {!n.read && <div style={{ width:7, height:7, borderRadius:"50%", background:BLUE[500], flexShrink:0, marginTop:6 }}/>}
              </div>
            ))}
          </div>
        </SlidePanel>

        {/* ════════════════════════════
            EMAIL PANEL
        ════════════════════════════ */}
        <SlidePanel open={activePanel==="email"}>
          {compose ? (
            <>
              <PanelHeader
                title="New Email"
                action={
                  <button onClick={() => setCompose(null)} style={{ fontSize:11, color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer" }}>← Back</button>
                }
              />
              <div style={{ padding:18, display:"flex", flexDirection:"column", gap:12, flex:1 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>To</label>
                  <input value={compose.to} onChange={e => setCompose({...compose, to:e.target.value})} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-input)", color:"var(--text-primary)", fontSize:12, outline:"none", fontFamily:"Poppins,sans-serif", boxSizing:"border-box" }} placeholder="recipient@email.com"/>
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Subject</label>
                  <input value={compose.subject} onChange={e => setCompose({...compose, subject:e.target.value})} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-input)", color:"var(--text-primary)", fontSize:12, outline:"none", fontFamily:"Poppins,sans-serif", boxSizing:"border-box" }} placeholder="Email subject"/>
                </div>
                <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
                  <label style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Message</label>
                  <textarea value={compose.body} onChange={e => setCompose({...compose, body:e.target.value})} style={{ flex:1, minHeight:200, padding:"8px 12px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-input)", color:"var(--text-primary)", fontSize:12, outline:"none", fontFamily:"Poppins,sans-serif", resize:"none", boxSizing:"border-box" }} placeholder="Write your message..."/>
                </div>
                <div style={{ display:"flex", gap:8, justifyContent:"flex-end", paddingTop:8, borderTop:"1px solid var(--border)" }}>
                  <button onClick={() => setCompose(null)} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid var(--border)", background:"var(--bg-hover)", color:"var(--text-secondary)", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"Poppins,sans-serif" }}>Discard</button>
                  <button onClick={() => { alert("Email sent!"); setCompose(null); }} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:8, border:"none", background:BLUE[600], color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Poppins,sans-serif" }}>
                    <Send size={13}/> Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <PanelHeader
                title="Inbox"
                action={
                  <button onClick={() => setCompose({to:"",subject:"",body:""})} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:7, border:"none", background:BLUE[600], color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"Poppins,sans-serif" }}>
                    <Plus size={11}/> Compose
                  </button>
                }
              />
              <div style={{ flex:1, overflowY:"auto" }}>
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => markEmailRead(email.id)}
                    style={{
                      padding:"14px 18px", borderBottom:"1px solid var(--border)", cursor:"pointer",
                      background: email.read ? "transparent" : BLUE[50],
                      transition:"background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background="var(--bg-hover)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background= email.read ? "transparent" : BLUE[50]}
                  >
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight: email.read ? 500 : 700, color:"var(--text-primary)" }}>{email.from}</span>
                      <span style={{ fontSize:10, color:"var(--text-muted)" }}>{email.time}</span>
                    </div>
                    <p style={{ margin:"0 0 3px", fontSize:12, fontWeight: email.read ? 400 : 600, color:"var(--text-primary)" }}>{email.subject}</p>
                    <p style={{ margin:0, fontSize:11, color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{email.preview}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </SlidePanel>

        {/* ════════════════════════════
            CHAT PANEL
        ════════════════════════════ */}
        <SlidePanel open={activePanel==="chat"}>
          {chatView ? (
            <>
              {/* Chat conversation */}
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
                <button onClick={() => setChatView(null)} style={{ width:28, height:28, borderRadius:7, border:"1px solid var(--border)", background:"var(--bg-hover)", cursor:"pointer", color:"var(--text-muted)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={13}/>
                </button>
                <div style={{ width:34, height:34, borderRadius:10, background:BLUE[600], display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>
                  {chatView.contact.avatar}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{chatView.contact.name}</p>
                  <p style={{ margin:0, fontSize:10, color:BLUE[500] }}>{chatView.contact.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
                {chatView.messages.map((msg) => (
                  <div key={msg.id} style={{ display:"flex", flexDirection:"column", alignItems: msg.from==="me" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth:"78%", padding:"9px 13px", borderRadius: msg.from==="me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: msg.from==="me" ? BLUE[600] : "var(--bg-hover)",
                      color: msg.from==="me" ? "#fff" : "var(--text-primary)",
                      fontSize:12, lineHeight:1.5,
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize:9.5, color:"var(--text-muted)", margin:"3px 4px 0" }}>{msg.time}</span>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>

              {/* Input */}
              <div style={{ padding:12, borderTop:"1px solid var(--border)", display:"flex", gap:8, flexShrink:0 }}>
                <input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && sendChatMsg()}
                  placeholder="Type a message…"
                  style={{ flex:1, padding:"9px 12px", borderRadius:9, border:"1px solid var(--border)", background:"var(--bg-input)", color:"var(--text-primary)", fontSize:12, outline:"none", fontFamily:"Poppins,sans-serif" }}
                />
                <button onClick={sendChatMsg} style={{ width:36, height:36, borderRadius:9, border:"none", background:BLUE[600], color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Send size={14}/>
                </button>
              </div>
            </>
          ) : (
            <>
              <PanelHeader title="Messages"/>
              <div style={{ flex:1, overflowY:"auto" }}>
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderBottom:"1px solid var(--border)", cursor:"pointer", transition:"background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background="var(--bg-hover)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background="transparent"}
                  >
                    <div style={{ position:"relative", flexShrink:0 }}>
                      <div style={{ width:38, height:38, borderRadius:11, background:BLUE[600], display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>
                        {chat.avatar}
                      </div>
                      <span style={{ position:"absolute", bottom:0, right:0, width:9, height:9, borderRadius:"50%", background:"#22c55e", border:"2px solid var(--bg-card)" }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)" }}>{chat.name}</span>
                        <span style={{ fontSize:10, color:"var(--text-muted)" }}>{chat.time}</span>
                      </div>
                      <p style={{ margin:0, fontSize:11, color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{chat.last}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span style={{ width:18, height:18, borderRadius:"50%", background:BLUE[600], color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{chat.unread}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </SlidePanel>

        {/* ════════════════════════════
            PROFILE PANEL
        ════════════════════════════ */}
        <SlidePanel open={activePanel==="profile"}>
          <PanelHeader title="Admin Profile"/>

          {/* Profile hero */}
          <div style={{ padding:"24px 18px 20px", borderBottom:"1px solid var(--border)", display:"flex", flexDirection:"column", alignItems:"center", gap:12, textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:20, background:`linear-gradient(135deg, ${BLUE[500]}, ${BLUE[700]})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:700, color:"#fff" }}>
              NA
            </div>
            <div>
              <h3 style={{ margin:"0 0 3px", fontSize:17, fontWeight:700, color:"var(--text-primary)", letterSpacing:-0.3 }}>NeraAdmin</h3>
              <p style={{ margin:0, fontSize:12, color:BLUE[500], fontWeight:500 }}>System Administrator</p>
              <p style={{ margin:"3px 0 0", fontSize:11, color:"var(--text-muted)" }}>admin@neraadmin.com</p>
            </div>
            <div style={{ display:"flex", gap:20, paddingTop:4 }}>
              {[{label:"Employees",val:"11"},{label:"Departments",val:"5"},{label:"Payrolls",val:"3"}].map(s=>(
                <div key={s.label} style={{ textAlign:"center" }}>
                  <p style={{ margin:0, fontSize:16, fontWeight:700, color:BLUE[600], letterSpacing:-0.3 }}>{s.val}</p>
                  <p style={{ margin:"1px 0 0", fontSize:9.5, color:"var(--text-muted)", fontWeight:500 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Theme toggle inside profile */}
          <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>
            <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Appearance</p>
            <div style={{ display:"flex", gap:8 }}>
              {(["light","dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{
                    flex:1, padding:"9px 0", borderRadius:9,
                    border:`1px solid ${theme===t ? BLUE[400] : "var(--border)"}`,
                    background: theme===t ? BLUE[50] : "var(--bg-hover)",
                    color: theme===t ? BLUE[700] : "var(--text-secondary)",
                    fontSize:12, fontWeight: theme===t ? 600 : 400,
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    fontFamily:"Poppins,sans-serif", transition:"all 0.15s",
                  }}
                >
                  {t==="light" ? <Sun size={13}/> : <Moon size={13}/>}
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                  {theme===t && <Check size={11}/>}
                </button>
              ))}
            </div>
          </div>

          {/* Profile menu items */}
          <div style={{ padding:"8px 10px", flex:1 }}>
            {[
              { icon:User,     label:"My Profile",       sub:"View account details"    },
              { icon:Settings, label:"Account Settings", sub:"Preferences & security"  },
              { icon:Edit3,    label:"Edit Profile",     sub:"Update your information" },
            ].map((item) => (
              <button
                key={item.label}
                style={{
                  display:"flex", alignItems:"center", gap:12, width:"100%",
                  padding:"11px 10px", borderRadius:10, border:"none",
                  background:"transparent", cursor:"pointer", textAlign:"left",
                  transition:"background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background="var(--bg-hover)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background="transparent"}
              >
                <div style={{ width:34, height:34, borderRadius:9, background:BLUE[50], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <item.icon size={15} style={{ color:BLUE[500] }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:"var(--text-primary)", fontFamily:"Poppins,sans-serif" }}>{item.label}</p>
                  <p style={{ margin:"1px 0 0", fontSize:10, color:"var(--text-muted)", fontFamily:"Poppins,sans-serif" }}>{item.sub}</p>
                </div>
                <ChevronRight size={13} style={{ color:"var(--text-muted)", flexShrink:0 }}/>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding:"10px 10px 20px", borderTop:"1px solid var(--border)" }}>
            <button
              onClick={() => {
                document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
                window.location.replace("/login");
              }}
              style={{
                display:"flex", alignItems:"center", gap:10, width:"100%",
                padding:"11px 14px", borderRadius:10, border:`1px solid ${BLUE[200]}`,
                background:BLUE[50], cursor:"pointer", textAlign:"left",
                transition:"background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background=BLUE[100]}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background=BLUE[50]}
            >
              <div style={{ width:34, height:34, borderRadius:9, background:BLUE[100], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <LogOut size={15} style={{ color:BLUE[600] }}/>
              </div>
              <div>
                <p style={{ margin:0, fontSize:12, fontWeight:600, color:BLUE[700], fontFamily:"Poppins,sans-serif" }}>Log Out</p>
                <p style={{ margin:"1px 0 0", fontSize:10, color:BLUE[400], fontFamily:"Poppins,sans-serif" }}>End your session</p>
              </div>
            </button>
          </div>
        </SlidePanel>

      </div>
    </>
  );
}