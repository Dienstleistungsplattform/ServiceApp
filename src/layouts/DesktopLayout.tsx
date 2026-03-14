import { useState, useMemo } from 'react';
import type { Offer, Booking, BookingDraft, CategoryId } from '@/types';
import { CATEGORIES, NAV_ITEMS } from '@/config';
import { useOffersStore, useBookingsStore, useFavoritesStore, useUserStore } from '@/store';
import { useTheme } from '@/context/ThemeContext';
import { ServiceImage, Badge, DetailContent } from '@/components/Shared';
import { OfferCard } from '@/components/OfferCard';

type NavId = typeof NAV_ITEMS[number]['id'];

function Sidebar({ nav, setNav }: { nav:NavId; setNav:(id:NavId)=>void }) {
  const { c } = useTheme();
  const { user } = useUserStore();
  return (
    <div style={{ width:220, background:c.navBg, display:'flex', flexDirection:'column', padding:'28px 0', flexShrink:0, borderRight:`1px solid ${c.navBorder}` }}>
      <div style={{ padding:'0 24px 32px' }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:c.navText, letterSpacing:'-0.02em' }}>
          Service<span style={{ color:c.accent }}>App</span>
        </div>
        <div style={{ fontSize:11, color:c.navText, opacity:0.55, marginTop:3 }}>Dienstleistungen finden</div>
      </div>
      <div style={{ flex:1, padding:'0 12px' }}>
        {NAV_ITEMS.map(item=>{
          const a=nav===item.id;
          return (
            <div key={item.id} onClick={()=>setNav(item.id as NavId)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:14, marginBottom:4, cursor:'pointer', background:a?`${c.accent}22`:'transparent', color:a?c.navText:c.navMuted, transition:'all .15s' }}>
              <span style={{ fontSize:18, width:22, textAlign:'center' }}>{item.icon}</span>
              <span style={{ fontSize:14, fontWeight:a?700:500 }}>{item.label}</span>
              {a && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:c.accent }}/>}
            </div>
          );
        })}
      </div>
      <div style={{ padding:'20px 16px 0', borderTop:`1px solid ${c.navBorder}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:10 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:`${c.accent}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>👤</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:c.navText, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.firstName} {user.lastName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Topbar({ title, subtitle, searchQuery, onSearch }: { title:string; subtitle?:string; searchQuery?:string; onSearch?:(q:string)=>void; }) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 32px 18px', background:c.topbar, borderBottom:`1px solid ${c.topbarBorder}`, flexShrink:0 }}>
      <div>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, fontWeight:800, color:c.text, letterSpacing:'-0.02em' }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:c.textSecondary, marginTop:2 }}>{subtitle}</div>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {onSearch && (
          <div style={{ background:c.bgInput, borderRadius:12, padding:'1px 16px', display:'flex', alignItems:'center', gap:8, width:240, border:`1.5px solid ${focused?c.accent:c.border}`, transition:'border-color .15s' }}>
            <span style={{ color:c.textMuted, flexShrink:0 }}>🔍</span>
            <input
              value={searchQuery??''} onChange={e=>onSearch(e.target.value)}
              onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
              placeholder="Suchen..."
              style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:c.text, padding:'9px 0', fontFamily:'inherit' }}
            />
            {searchQuery && <button onClick={()=>onSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:c.textMuted, fontSize:18 }}>×</button>}
          </div>
        )}
        <div style={{ width:40, height:40, borderRadius:12, background:c.bgInput, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer' }}>🔔</div>
      </div>
    </div>
  );
}

function CategoryFilter({ active, setActive }: { active: CategoryId[]; setActive: (c: CategoryId[]) => void }) {
  const { c } = useTheme();

  const toggle = (id: CategoryId) => {
    if (id === 'all') { setActive(['all']); return; }
    const withoutAll = active.filter(a => a !== 'all');
    if (withoutAll.includes(id)) {
      const next = withoutAll.filter(a => a !== id);
      setActive(next.length === 0 ? ['all'] : next);
    } else {
      setActive([...withoutAll, id]);
    }
  };

  return (
    <div style={{ display:'flex', gap:8, overflowX:'auto', flexWrap:'nowrap', paddingBottom:4, scrollbarWidth:'none' } as React.CSSProperties}>
      {CATEGORIES.map(cat=>{
        const isAll = cat.id === 'all';
        const a = isAll ? (active.includes('all') || active.length === 0) : active.includes(cat.id as CategoryId);
        return (
          <button key={cat.id} onClick={()=>toggle(cat.id as CategoryId)}
            style={{ flexShrink:0, padding:'8px 16px', borderRadius:22, border:a?'none':`1.5px solid ${c.border}`, background:a?c.accent:c.chip, color:a?'#fff':c.chipText, fontSize:13, fontWeight:600, display:'flex', gap:6, alignItems:'center', boxShadow:a?`0 4px 14px ${c.accent}44`:'none', transition:'all .15s', cursor:'pointer' }}>
            {cat.icon} {cat.label}
            {a && !isAll && <span style={{ fontSize:11, opacity:0.85 }}>✕</span>}
          </button>
        );
      })}
    </div>
  );
}

function RightPanel({ offer, onClose, onBook, isFav, onToggleFav }: { offer:Offer|Booking|null; onClose:()=>void; onBook:(d:BookingDraft)=>Promise<void>; isFav:boolean; onToggleFav:()=>void; }) {
  const { c } = useTheme();
  if (!offer) return null;
  return (
    <div style={{ width:340, background:c.bgCard, borderLeft:`1px solid ${c.border}`, display:'flex', flexDirection:'column', animation:'fadeIn .2s ease', flexShrink:0 }}>
      <DetailContent offer={offer} onClose={onClose} isMobile={false} onBook={onBook} isFav={isFav} onToggleFav={onToggleFav}/>
    </div>
  );
}

function DesktopExplorePage({ bookStore, favStore }: { bookStore:ReturnType<typeof useBookingsStore>; favStore:ReturnType<typeof useFavoritesStore>; }) {
  const { c } = useTheme();
  const [cat, setCat]     = useState<CategoryId[]>(['all']);
  const [query, setQuery] = useState('');
  const { offers, loading } = useOffersStore(cat);
  const [selected, setSelected] = useState<Offer|null>(null);
  const toggle = (o:Offer) => setSelected(s=>s?.id===o.id?null:o);

  const filtered = useMemo(() =>
    query.trim() ? offers.filter(o =>
      o.title.toLowerCase().includes(query.toLowerCase()) ||
      o.provider.toLowerCase().includes(query.toLowerCase()) ||
      o.description.toLowerCase().includes(query.toLowerCase())
    ) : offers
  , [offers, query]);

  const minPrice = filtered.length>0?Math.min(...filtered.map(o=>o.price)):null;

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar title="Angebote entdecken" subtitle="Finde den perfekten Termin" searchQuery={query} onSearch={q=>{setQuery(q);setSelected(null);}}/>
        <div style={{ padding:'16px 32px', background:c.topbar, flexShrink:0, borderBottom:`1px solid ${c.topbarBorder}` }}>
          <div style={{ marginBottom:14 }}><CategoryFilter active={cat} setActive={d=>{setCat(d);setSelected(null);}}/></div>
          <div style={{ display:'flex', gap:10 }}>
            {[{v:filtered.length,l:'Angebote',icon:'✦'},{v:filtered.filter(o=>o.status==='available').length,l:'Verfügbar',icon:'◉'},{v:minPrice!=null?`€${minPrice}`:'–',l:'Ab Preis',icon:'💳'}].map((s,i)=>(
              <div key={i} style={{ background:c.statsBg, borderRadius:14, padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:800, color:c.text, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:11, color:c.textMuted, marginTop:1 }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 32px 32px' }}>
          {loading
            ? <div style={{ textAlign:'center', color:c.textSecondary, marginTop:60 }}>Lädt...</div>
            : filtered.length===0
              ? <div style={{ textAlign:'center', color:c.textSecondary, marginTop:80 }}><div style={{ fontSize:40, marginBottom:12 }}>🔍</div><div style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:700 }}>Keine Ergebnisse für „{query}"</div></div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18 }}>
                  {filtered.map(o=><OfferCard key={o.id} offer={o} onPress={toggle} selected={selected?.id===o.id} cardHeight={160}/>)}
                </div>
          }
        </div>
      </div>
      <RightPanel offer={selected} onClose={()=>setSelected(null)}
        onBook={async d=>{if(selected)await bookStore.book(d,selected);setSelected(null);}}
        isFav={selected?favStore.isFav(selected.id):false}
        onToggleFav={()=>selected&&(favStore.isFav(selected.id)?favStore.remove(selected.id):favStore.add(selected.id))}/>
    </div>
  );
}

function DesktopBookingsPage({ bookStore }: { bookStore:ReturnType<typeof useBookingsStore> }) {
  const { c } = useTheme();
  const [tab, setTab]     = useState<'upcoming'|'past'>('upcoming');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Booking|null>(null);

  const list = useMemo(() => {
    const base = tab==='upcoming' ? bookStore.upcoming : bookStore.past;
    return query.trim() ? base.filter(b =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.provider.toLowerCase().includes(query.toLowerCase())
    ) : base;
  }, [tab, bookStore.upcoming, bookStore.past, query]);

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar title="Meine Buchungen" subtitle={`${bookStore.upcoming.length} bevorstehende Termine`} searchQuery={query} onSearch={setQuery}/>
        <div style={{ padding:'16px 32px', background:c.topbar, borderBottom:`1px solid ${c.topbarBorder}`, flexShrink:0 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ display:'flex', background:c.bgInput, borderRadius:14, padding:4 }}>
              {(['upcoming','past'] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{ padding:'9px 20px', borderRadius:11, border:'none', background:tab===t?c.bgCard:'transparent', color:tab===t?c.text:c.textMuted, fontSize:13, fontWeight:tab===t?700:500, cursor:'pointer', boxShadow:tab===t?c.shadow:'none', transition:'all .15s' }}>
                  {t==='upcoming'?'Bevorstehend':'Vergangen'}
                </button>
              ))}
            </div>
            {tab==='upcoming'&&bookStore.upcoming[0]&&(
              <div style={{ marginLeft:'auto', background:'linear-gradient(135deg,#1a1a2e,#3a3a6e)', borderRadius:14, padding:'10px 18px', color:'#fff', display:'flex', alignItems:'center', gap:14 }}>
                <div>
                  <div style={{ fontSize:11, opacity:.55 }}>Nächster Termin</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700 }}>{bookStore.upcoming[0].title} · {bookStore.upcoming[0].date} {bookStore.upcoming[0].time}</div>
                </div>
                <span style={{ fontSize:18, opacity:.6 }}>📅</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 32px' }}>
          {list.length===0
            ? <div style={{ textAlign:'center', color:c.textSecondary, marginTop:60 }}>{query?`Keine Buchungen für „${query}"`:'Keine Buchungen vorhanden.'}</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {list.map(b=>(
                  <div key={b.id} onClick={()=>setSelected(s=>s?.id===b.id?null:b)}
                    style={{ background:c.bgCard, borderRadius:20, overflow:'hidden', cursor:'pointer', boxShadow:selected?.id===b.id?`0 0 0 2.5px ${c.accent}, 0 8px 24px ${c.accent}22`:c.shadow, display:'flex', height:110, transition:'box-shadow .15s' }}>
                    <div style={{ width:110, flexShrink:0 }}><ServiceImage category={b.category} height={110} iconSize={20}><div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.1)' }}/></ServiceImage></div>
                    <div style={{ flex:1, padding:'13px 16px', display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:c.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.title}</div>
                        <Badge status={b.status}/>
                      </div>
                      <div style={{ fontSize:12, color:c.textSecondary }}>{b.provider}</div>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', gap:12 }}>
                          <span style={{ fontSize:11, color:c.textMuted }}>📅 {b.date}</span>
                          <span style={{ fontSize:11, color:c.textMuted }}>🕐 {b.time}</span>
                          <span style={{ fontSize:11, color:c.textMuted }}>⏱ {b.duration}</span>
                        </div>
                        <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800, color:c.accent }}>€{b.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
      {selected&&(
        <div style={{ width:340, background:c.bgCard, borderLeft:`1px solid ${c.border}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
          <DetailContent offer={selected} onClose={()=>setSelected(null)} isMobile={false} onBook={async()=>{}}/>
        </div>
      )}
    </div>
  );
}

function DesktopFavoritesPage({ bookStore, favStore, allOffers }: { bookStore:ReturnType<typeof useBookingsStore>; favStore:ReturnType<typeof useFavoritesStore>; allOffers:Offer[]; }) {
  const { c } = useTheme();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Offer|null>(null);
  const toggle = (o:Offer) => setSelected(s=>s?.id===o.id?null:o);

  const list = useMemo(() =>
    query.trim() ? favStore.favoriteOffers.filter(o =>
      o.title.toLowerCase().includes(query.toLowerCase()) ||
      o.provider.toLowerCase().includes(query.toLowerCase())
    ) : favStore.favoriteOffers
  , [favStore.favoriteOffers, query]);

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar title="Favoriten" subtitle={`${favStore.favoriteOffers.length} gespeicherte Angebote`} searchQuery={query} onSearch={setQuery}/>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 32px 32px' }}>
          {list.length===0
            ? <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:c.textMuted }}>
                <div style={{ fontSize:56, marginBottom:16 }}>♡</div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:700 }}>{query?`Nichts für „${query}"` :'Noch keine Favoriten'}</div>
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18 }}>
                {list.map(o=>(
                  <div key={o.id} style={{ position:'relative' }}>
                    <OfferCard offer={o} onPress={toggle} selected={selected?.id===o.id} cardHeight={160}/>
                    <button onClick={e=>{e.stopPropagation();favStore.remove(o.id);if(selected?.id===o.id)setSelected(null);}}
                      style={{ position:'absolute', top:12, right:12, width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#e53935', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', zIndex:2 }}>♥</button>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
      <RightPanel offer={selected} onClose={()=>setSelected(null)}
        onBook={async d=>{if(selected)await bookStore.book(d,selected);setSelected(null);}}
        isFav={selected?favStore.isFav(selected.id):false}
        onToggleFav={()=>selected&&(favStore.isFav(selected.id)?favStore.remove(selected.id):favStore.add(selected.id))}/>
    </div>
  );
}

function DesktopProfilePage() {
  const { c, dark, toggle } = useTheme();
  const { user, update } = useUserStore();
  const [notif, setNotif]   = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft]   = useState(user);

  const inputStyle: React.CSSProperties = {
    width:'100%', background:c.bgInput, border:`1.5px solid ${c.inputBorder}`,
    borderRadius:12, padding:'12px 14px', fontSize:14, color:c.text,
    outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color .15s',
  };

  const openEdit = () => { setDraft(user); setEditOpen(true); };
  const save     = () => { update(draft); setEditOpen(false); };

  const menu = [
    { icon:'👤', label:'Persönliche Daten',  fn: openEdit },
    { icon:'💳', label:'Zahlungsmethoden',   fn:()=>{} },
    { icon:'🔔', label:'Benachrichtigungen', toggle:true, val:notif, tog:()=>setNotif(v=>!v) },
    { icon:'🌙', label:'Dark Mode',          toggle:true, val:dark,  tog:toggle },
    { icon:'🔒', label:'Datenschutz',        fn:()=>{} },
    { icon:'❓', label:'Hilfe & Support',    fn:()=>{} },
    { icon:'🚪', label:'Abmelden',           fn:()=>{}, danger:true },
  ] as const;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <Topbar title="Profil" subtitle="Einstellungen & Konto"/>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:24, maxWidth:900 }}>
          <div>
            <div style={{ background:'linear-gradient(135deg,#1a1a2e,#3a3a6e)', borderRadius:24, padding:'24px 20px', color:'#fff', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                <div style={{ width:58, height:58, borderRadius:18, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, border:'2px solid rgba(255,255,255,0.2)', flexShrink:0 }}>👤</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:19, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.firstName} {user.lastName}</div>
                  <div style={{ fontSize:12, opacity:.55, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {[{v:'12',l:'Buchungen'},{v:'4.9',l:'Bewertung'},{v:'4',l:'Favoriten'}].map((s,i)=>(
                  <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:14, padding:'11px 8px', textAlign:'center', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:21, fontWeight:800 }}>{s.v}</div>
                    <div style={{ fontSize:10, opacity:.5, marginTop:2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={openEdit} style={{ width:'100%', padding:'13px', borderRadius:14, border:`1.5px solid ${c.border}`, background:c.bgCard, color:c.text, fontSize:14, fontWeight:600, cursor:'pointer' }}>Profil bearbeiten</button>
          </div>

          <div style={{ background:c.bgCard, borderRadius:20, overflow:'hidden', boxShadow:c.shadow }}>
            <div style={{ padding:'18px 22px', borderBottom:`1px solid ${c.borderLight}` }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700, color:c.text }}>Einstellungen</div>
            </div>
            {menu.map((item,i)=>(
              <div key={i} onClick={'fn' in item?item.fn:undefined}
                style={{ display:'flex', alignItems:'center', padding:'15px 22px', borderBottom:i<menu.length-1?`1px solid ${c.borderLight}`:'none', cursor:'pointer' }}>
                <span style={{ fontSize:20, marginRight:14, width:26, textAlign:'center' }}>{item.icon}</span>
                <span style={{ flex:1, fontSize:14, fontWeight:500, color:'danger' in item&&item.danger?'#e53935':c.text }}>{item.label}</span>
                {'toggle' in item
                  ? <div onClick={e=>{e.stopPropagation();item.tog();}} style={{ width:46, height:26, borderRadius:13, background:item.val?c.accent:'#ccc', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:item.val?23:3, transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                    </div>
                  : <span style={{ color:c.border, fontSize:20 }}>›</span>
                }
              </div>
            ))}
            <div style={{ padding:'14px 22px', fontSize:12, color:c.textSubtle, textAlign:'center' }}>Version 1.0.0 · ServiceApp GmbH</div>
          </div>
        </div>
      </div>

      {editOpen&&(
        <>
          <div onClick={()=>setEditOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50 }}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:c.bgCard, borderRadius:24, padding:32, width:420, zIndex:51, boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:c.text, marginBottom:20 }}>Profil bearbeiten</div>
            {([['Vorname','firstName'],['Nachname','lastName'],['E-Mail','email'],['Telefon','phone']] as [string, keyof typeof draft][]).map(([label,key])=>(
              <div key={key} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:c.textSecondary, marginBottom:5, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</div>
                <input value={draft[key]} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))} style={inputStyle}/>
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button onClick={()=>setEditOpen(false)} style={{ flex:1, padding:13, borderRadius:14, border:`1.5px solid ${c.border}`, background:c.bgCard, color:c.textSecondary, fontSize:14, fontWeight:600, cursor:'pointer' }}>Abbrechen</button>
              <button onClick={save} style={{ flex:2, padding:13, borderRadius:14, border:'none', background:'linear-gradient(135deg,#1a1a2e,#3a3a6e)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>Speichern</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DesktopLayout() {
  const { c } = useTheme();
  const [nav, setNav] = useState<NavId>('explore');
  const { offers: allOffers } = useOffersStore('all');
  const bookStore = useBookingsStore();
  const favStore  = useFavoritesStore(allOffers);
  return (
    <div style={{ display:'flex', height:'100vh', background:c.bg, overflow:'hidden' }}>
      <Sidebar nav={nav} setNav={setNav}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {nav==='explore'   && <DesktopExplorePage  bookStore={bookStore} favStore={favStore}/>}
        {nav==='bookings'  && <DesktopBookingsPage bookStore={bookStore}/>}
        {nav==='favorites' && <DesktopFavoritesPage bookStore={bookStore} favStore={favStore} allOffers={allOffers}/>}
        {nav==='profile'   && <DesktopProfilePage/>}
      </div>
    </div>
  );
}
