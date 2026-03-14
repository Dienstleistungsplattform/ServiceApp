import { useState, useMemo } from 'react';
import type { Offer, Booking, BookingDraft, CategoryId } from '@/types';
import { CATEGORIES, NAV_ITEMS } from '@/config';
import { useOffersStore, useBookingsStore, useFavoritesStore, useUserStore } from '@/store';
import { useTheme } from '@/context/ThemeContext';
import { ServiceImage, Badge, DetailContent } from '@/components/Shared';
import { OfferCard } from '@/components/OfferCard';

type NavId = typeof NAV_ITEMS[number]['id'];

function CategoryFilter({ active, setActive }: { active: CategoryId[]; setActive: (c: CategoryId[]) => void }) {
  const { c } = useTheme();

  const toggle = (id: CategoryId) => {
    if (id === 'all') {
      setActive(['all']);
      return;
    }
    // Remove 'all' when selecting a specific category
    const withoutAll = active.filter(a => a !== 'all');
    if (withoutAll.includes(id)) {
      // Deselect: if nothing left, fall back to 'all'
      const next = withoutAll.filter(a => a !== id);
      setActive(next.length === 0 ? ['all'] : next);
    } else {
      setActive([...withoutAll, id]);
    }
  };

  return (
    <div style={{ display:'flex', gap:8, overflowX:'auto', flexWrap:'nowrap', paddingBottom:4, scrollbarWidth:'none' } as React.CSSProperties}>
      {CATEGORIES.map(cat => {
        const isAll = cat.id === 'all';
        const a = isAll ? (active.includes('all') || active.length === 0) : active.includes(cat.id as CategoryId);
        return (
          <button key={cat.id} onClick={() => toggle(cat.id as CategoryId)}
            style={{ flexShrink:0, padding:'7px 15px', borderRadius:22, border: a ? 'none' : `1.5px solid ${c.border}`, background: a ? c.accent : c.chip, color: a ? '#fff' : c.chipText, fontSize:13, fontWeight:600, display:'flex', gap:5, alignItems:'center', boxShadow: a ? `0 4px 12px ${c.accent}44` : 'none', transition:'all .15s', cursor:'pointer', position: 'relative' }}>
            {cat.icon} {cat.label}
            {a && !isAll && (
              <span style={{ marginLeft:2, fontSize:11, opacity:0.85 }}>✕</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DetailSheet({ offer, onClose, onBook, isFav, onToggleFav }: { offer:Offer|Booking; onClose:()=>void; onBook:(d:BookingDraft)=>Promise<void>; isFav:boolean; onToggleFav:()=>void; }) {
  const { c } = useTheme();
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', zIndex:9 }}/>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:c.bgCard, borderRadius:'28px 28px 0 0', zIndex:10, overflow:'hidden', animation:'slideUp .28s cubic-bezier(.22,1,.36,1)', maxHeight:'90%', display:'flex', flexDirection:'column' }}>
        <DetailContent offer={offer} onClose={onClose} isMobile onBook={onBook} isFav={isFav} onToggleFav={onToggleFav}/>
      </div>
    </>
  );
}

function MobileExplorePage({ bookStore, favStore }: { bookStore:ReturnType<typeof useBookingsStore>; favStore:ReturnType<typeof useFavoritesStore>; }) {
  const { c } = useTheme();
  const [cat, setCat]       = useState<CategoryId[]>(['all']);
  const [query, setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const { offers, loading } = useOffersStore(cat);
  const [selected, setSelected] = useState<Offer|null>(null);

  const filtered = useMemo(() =>
    query.trim() ? offers.filter(o =>
      o.title.toLowerCase().includes(query.toLowerCase()) ||
      o.provider.toLowerCase().includes(query.toLowerCase()) ||
      o.description.toLowerCase().includes(query.toLowerCase())
    ) : offers
  , [offers, query]);

  return (
    <>
      <div style={{ background:c.navBg, padding:'16px 20px 0', flexShrink:0, borderBottom:`1px solid ${c.navBorder}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:12, color:c.textSecondary, fontWeight:500 }}>Willkommen zurück 👋</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, fontWeight:800, color:c.text }}>Angebote entdecken</div>
          </div>
          <div style={{ width:40, height:40, borderRadius:12, background:c.bgInput, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🔔</div>
        </div>
        {/* Functional search */}
        <div style={{ background:c.bgInput, borderRadius:14, padding:'1px 15px', display:'flex', gap:8, alignItems:'center', marginBottom:12, border:`1.5px solid ${focused?c.accent:c.border}`, transition:'border-color .15s' }}>
          <span style={{ color:c.textSecondary, fontSize:16, flexShrink:0 }}>🔍</span>
          <input
            value={query} onChange={e=>setQuery(e.target.value)}
            onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
            placeholder="Dienstleistung suchen..."
            style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:c.text, padding:'9px 0', fontFamily:'inherit' }}
          />
          {query && <button onClick={()=>setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', color:c.textMuted, fontSize:18, padding:'0 2px' }}>×</button>}
        </div>
        <CategoryFilter active={cat} setActive={d=>{setCat(d);setSelected(null);}}/>
      </div>

      <div style={{ margin:'8px 16px', background:'linear-gradient(135deg,#1a1a2e,#3a3a6e)', borderRadius:16, padding:'12px 18px', display:'flex', justifyContent:'space-between', flexShrink:0 }}>
        {[{v:filtered.length,l:'Angebote'},{v:filtered.filter(o=>o.status==='available').length,l:'Verfügbar'},{v:filtered.length>0?`€${Math.min(...filtered.map(o=>o.price))}`:'–',l:'Ab Preis'}].map((s,i)=>(
          <div key={i} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:'#fff' }}>{s.v}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'4px 16px 16px' }}>
        {loading
          ? <div style={{ textAlign:'center', color:c.textSecondary, marginTop:40 }}>Lädt...</div>
          : filtered.length === 0
            ? <div style={{ textAlign:'center', color:c.textSecondary, marginTop:48 }}><div style={{ fontSize:32, marginBottom:10 }}>🔍</div><div style={{ fontWeight:600 }}>Keine Ergebnisse für „{query}"</div></div>
            : filtered.map(o=><OfferCard key={o.id} offer={o} onPress={setSelected} selected={selected?.id===o.id} cardHeight={148}/>)
        }
      </div>

      {selected && <DetailSheet offer={selected} onClose={()=>setSelected(null)}
        onBook={async d=>{await bookStore.book(d,selected);setSelected(null);}}
        isFav={favStore.isFav(selected.id)} onToggleFav={()=>favStore.isFav(selected.id)?favStore.remove(selected.id):favStore.add(selected.id)}/>}
    </>
  );
}

function MobileBookingsPage({ bookStore }: { bookStore:ReturnType<typeof useBookingsStore> }) {
  const { c } = useTheme();
  const [tab, setTab] = useState<'upcoming'|'past'>('upcoming');
  const [selected, setSelected] = useState<Booking|null>(null);
  const list = tab==='upcoming' ? bookStore.upcoming : bookStore.past;
  return (
    <>
      <div style={{ background:c.navBg, padding:'16px 20px 0', flexShrink:0, borderBottom:`1px solid ${c.navBorder}` }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, fontWeight:800, color:c.text, marginBottom:14 }}>Meine Buchungen</div>
        <div style={{ display:'flex', background:c.bgInput, borderRadius:14, padding:4, marginBottom:12 }}>
          {(['upcoming','past'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:'9px', borderRadius:12, border:'none', background:tab===t?c.bgCard:'transparent', color:tab===t?c.text:c.textMuted, fontSize:13, fontWeight:tab===t?700:500, cursor:'pointer', boxShadow:tab===t?c.shadow:'none', transition:'all .15s' }}>
              {t==='upcoming'?'Bevorstehend':'Vergangen'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 16px' }}>
        {list.map(b=>(
          <div key={b.id} onClick={()=>setSelected(s=>s?.id===b.id?null:b)}
            style={{ background:c.bgCard, borderRadius:20, overflow:'hidden', cursor:'pointer', boxShadow:selected?.id===b.id?`0 0 0 2.5px ${c.accent}`:c.shadow, display:'flex', height:96, marginBottom:12, transition:'box-shadow .15s' }}>
            <div style={{ width:96, flexShrink:0 }}><ServiceImage category={b.category} height={96} iconSize={20}><div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.1)' }}/></ServiceImage></div>
            <div style={{ flex:1, padding:'11px 14px', display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:6 }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, color:c.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.title}</div>
                <Badge status={b.status}/>
              </div>
              <div style={{ fontSize:11, color:c.textSecondary }}>{b.provider}</div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:c.textMuted }}>📅 {b.date} · {b.time}</span>
                <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:800, color:c.accent }}>€{b.price}</span>
              </div>
            </div>
          </div>
        ))}
        {tab==='upcoming'&&bookStore.upcoming[0]&&(
          <div style={{ background:'linear-gradient(135deg,#1a1a2e,#3a3a6e)', borderRadius:20, padding:'18px 20px', marginTop:4, color:'#fff' }}>
            <div style={{ fontSize:11, opacity:.55, marginBottom:4 }}>Nächster Termin</div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800 }}>{bookStore.upcoming[0].title}</div>
            <div style={{ fontSize:13, opacity:.7, marginTop:2 }}>{bookStore.upcoming[0].date} · {bookStore.upcoming[0].time}</div>
          </div>
        )}
      </div>
      {selected&&<DetailSheet offer={selected} onClose={()=>setSelected(null)} onBook={async()=>{}} isFav={false} onToggleFav={()=>{}}/>}
    </>
  );
}

function MobileFavoritesPage({ bookStore, favStore }: { bookStore:ReturnType<typeof useBookingsStore>; favStore:ReturnType<typeof useFavoritesStore>; }) {
  const { c } = useTheme();
  const [selected, setSelected] = useState<Offer|null>(null);
  return (
    <>
      <div style={{ background:c.navBg, padding:'16px 20px 12px', flexShrink:0, borderBottom:`1px solid ${c.navBorder}` }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:24, fontWeight:800, color:c.text }}>Favoriten</div>
        <div style={{ fontSize:13, color:c.textSecondary, marginTop:2 }}>{favStore.favoriteOffers.length} gespeicherte Angebote</div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 16px' }}>
        {favStore.favoriteOffers.length===0
          ? <div style={{ textAlign:'center', color:c.textSecondary, marginTop:70 }}><div style={{ fontSize:44, marginBottom:12 }}>♡</div><div style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700 }}>Noch keine Favoriten</div></div>
          : favStore.favoriteOffers.map(o=>(
            <div key={o.id} style={{ position:'relative' }}>
              <OfferCard offer={o} onPress={setSelected} selected={selected?.id===o.id} cardHeight={148}/>
              <button onClick={e=>{e.stopPropagation();favStore.remove(o.id);if(selected?.id===o.id)setSelected(null);}}
                style={{ position:'absolute', top:15, right:13, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.95)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#e53935', boxShadow:'0 2px 8px rgba(0,0,0,0.15)', zIndex:2 }}>♥</button>
            </div>
          ))}
      </div>
      {selected&&<DetailSheet offer={selected} onClose={()=>setSelected(null)}
        onBook={async d=>{await bookStore.book(d,selected);setSelected(null);}}
        isFav={favStore.isFav(selected.id)} onToggleFav={()=>favStore.isFav(selected.id)?favStore.remove(selected.id):favStore.add(selected.id)}/>}
    </>
  );
}

function MobileProfilePage() {
  const { c, dark, toggle } = useTheme();
  const { user, update } = useUserStore();
  const [notif, setNotif]   = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  // Local draft while editing (committed on Save)
  const [draft, setDraft] = useState(user);

  const inputStyle: React.CSSProperties = { width:'100%', background:c.bgInput, border:`1.5px solid ${c.inputBorder}`, borderRadius:12, padding:'12px 14px', fontSize:14, color:c.text, outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color .15s' };

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
    <>
      <div style={{ background:'linear-gradient(135deg,#1a1a2e,#3a3a6e)', padding:'20px 20px 28px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
          <div style={{ width:58, height:58, borderRadius:18, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, border:'2px solid rgba(255,255,255,0.2)' }}>👤</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:19, fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.55)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
          </div>
          <button onClick={openEdit} style={{ flexShrink:0, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', borderRadius:12, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>Bearbeiten</button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[{v:'12',l:'Buchungen'},{v:'4.9',l:'Bewertung'},{v:'4',l:'Favoriten'}].map((s,i)=>(
            <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:14, padding:'11px 8px', textAlign:'center', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:21, fontWeight:800, color:'#fff' }}>{s.v}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
        <div style={{ background:c.bgCard, borderRadius:20, overflow:'hidden', boxShadow:c.shadow }}>
          {menu.map((item,i)=>(
            <div key={i} onClick={'fn' in item?item.fn:undefined}
              style={{ display:'flex', alignItems:'center', padding:'14px 16px', borderBottom:i<menu.length-1?`1px solid ${c.borderLight}`:'none', cursor:'pointer' }}>
              <span style={{ fontSize:20, marginRight:13 }}>{item.icon}</span>
              <span style={{ flex:1, fontSize:14, fontWeight:500, color:'danger' in item&&item.danger?'#e53935':c.text }}>{item.label}</span>
              {'toggle' in item
                ? <div onClick={e=>{e.stopPropagation();item.tog();}} style={{ width:44, height:26, borderRadius:13, background:item.val?c.accent:'#ccc', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:item.val?21:3, transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                  </div>
                : <span style={{ color:c.border, fontSize:18 }}>›</span>
              }
            </div>
          ))}
        </div>
      </div>
      {editOpen && (
        <>
          <div onClick={()=>setEditOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', zIndex:9 }}/>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, background:c.bgCard, borderRadius:'28px 28px 0 0', zIndex:10, padding:'0 20px 32px', animation:'slideUp .25s cubic-bezier(.22,1,.36,1)' }}>
            <div style={{ width:36, height:4, background:c.border, borderRadius:4, margin:'14px auto 18px' }}/>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:c.text, marginBottom:16 }}>Profil bearbeiten</div>
            {([['Vorname','firstName'],['Nachname','lastName'],['E-Mail','email'],['Telefon','phone']] as [string,keyof typeof draft][]).map(([label,key])=>(
              <div key={key} style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:c.textSecondary, marginBottom:5, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</div>
                <input value={draft[key]} onChange={e=>setDraft(d=>({...d,[key]:e.target.value}))} style={inputStyle}/>
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:8 }}>
              <button onClick={()=>setEditOpen(false)} style={{ flex:1, padding:'13px', borderRadius:14, border:`1.5px solid ${c.border}`, background:c.bgCard, color:c.textSecondary, fontSize:14, fontWeight:600, cursor:'pointer' }}>Abbrechen</button>
              <button onClick={save} style={{ flex:2, padding:'15px', borderRadius:16, border:'none', background:'linear-gradient(135deg,#1a1a2e,#3a3a6e)', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>Speichern</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function MobileLayout() {
  const { c } = useTheme();
  const [nav, setNav] = useState<NavId>('explore');
  const { offers: allOffers } = useOffersStore('all');
  const bookStore = useBookingsStore();
  const favStore  = useFavoritesStore(allOffers);
  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', padding:20 }}>
      <div style={{ width:375, height:812, background:c.bg, borderRadius:50, boxShadow:'0 60px 120px rgba(0,0,0,0.5),0 0 0 10px #111,0 0 0 12px #2a2a2a', overflow:'hidden', position:'relative', display:'flex', flexDirection:'column' }}>
        <div style={{ background:c.navBg, padding:'14px 24px 0', display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, color:c.text, position:'relative', flexShrink:0, zIndex:1 }}>
          <span>9:41</span>
          <div style={{ width:110, height:30, background:'#111', borderRadius:20, position:'absolute', left:'50%', transform:'translateX(-50%)', top:10 }}/>
          <span>⚡100%</span>
        </div>
        {nav==='explore'   && <MobileExplorePage bookStore={bookStore} favStore={favStore}/>}
        {nav==='bookings'  && <MobileBookingsPage bookStore={bookStore}/>}
        {nav==='favorites' && <MobileFavoritesPage bookStore={bookStore} favStore={favStore}/>}
        {nav==='profile'   && <MobileProfilePage/>}
        <div style={{ background:c.navBg, borderTop:`1px solid ${c.navBorder}`, padding:'10px 0 20px', display:'flex', justifyContent:'space-around', flexShrink:0, zIndex:0 }}>
          {NAV_ITEMS.map(item=>{
            const a=nav===item.id;
            return (
              <div key={item.id} onClick={()=>setNav(item.id as NavId)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', color:a?c.accent:c.navMuted }}>
                <div style={{ fontSize:20 }}>{item.icon}</div>
                <div style={{ fontSize:10, fontWeight:a?700:400 }}>{item.label}</div>
                {a && <div style={{ width:4, height:4, borderRadius:'50%', background:c.accent }}/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
