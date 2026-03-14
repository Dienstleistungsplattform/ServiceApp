import { useState } from 'react';
import type { Offer, Booking, OfferStatus, CategoryId, BookingDraft } from '@/types';
import { STATUS_CONFIG, catMap } from '@/config';
import { useTheme } from '@/context/ThemeContext';
import { BookingModal } from './BookingModal';

interface ServiceImageProps { category:CategoryId; height?:number; iconSize?:number; children?:React.ReactNode; }
export function ServiceImage({ category, height=180, iconSize=28, children }: ServiceImageProps) {
  const cat = catMap[category] ?? catMap['health'];
  return (
    <div style={{ height, width:'100%', position:'relative', overflow:'hidden', background:cat.grad, flexShrink:0 }}>
      {[{s:280,t:'-10%',l:'-10%',o:0.12},{s:200,t:'5%',l:'55%',o:0.10},{s:140,t:'55%',l:'5%',o:0.08},{s:320,t:'15%',l:'35%',o:0.06}].map((c,i) => (
        <div key={i} style={{ position:'absolute', width:c.s, height:c.s, borderRadius:'50%', top:c.t, left:c.l, background:'rgba(255,255,255,0.9)', opacity:c.o, transform:'translate(-50%,-50%)' }}/>
      ))}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:iconSize+28, height:iconSize+28, borderRadius:16, background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:iconSize }}>
        {cat.icon}
      </div>
      {children}
    </div>
  );
}

export function Stars({ rating, size=12 }: { rating:number; size?:number }) {
  return <span style={{ color:'#f59e0b', fontSize:size }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>;
}

export function Badge({ status }: { status:OfferStatus }) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  return <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{s.label}</span>;
}

export function Tag({ text }: { text:string }) {
  const d = text.startsWith('-'); const u = text==='Letzter Platz';
  return <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, background:d?'#c05300':u?'#9b2335':'rgba(255,255,255,0.92)', color:d||u?'#fff':'#222' }}>{text}</span>;
}

interface DetailContentProps {
  offer: Offer|Booking; onClose:()=>void; isMobile?:boolean;
  onBook?:(draft:BookingDraft)=>Promise<void>; isFav?:boolean; onToggleFav?:()=>void;
}
export function DetailContent({ offer, onClose, isMobile=false, onBook, isFav=false, onToggleFav }: DetailContentProps) {
  const { c } = useTheme();
  const [showBooking, setShowBooking] = useState(false);
  const st = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.available;
  const originalPrice = 'originalPrice' in offer ? offer.originalPrice : null;
  const tags = 'tags' in offer ? offer.tags : [];
  const isBooked = offer.status==='booked'||offer.status==='confirmed';

  return (
    <>
      <div style={{ position:'relative', height:isMobile?200:220, flexShrink:0 }}>
        <ServiceImage category={offer.category} height={isMobile?200:220} iconSize={34}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%)' }}/>
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:32, height:32, borderRadius:'50%', background:'rgba(0,0,0,0.45)', border:'none', color:'#fff', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          <div style={{ position:'absolute', bottom:14, left:16 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:28, fontWeight:800, color:'#fff' }}>€{offer.price}</span>
              {originalPrice && <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textDecoration:'line-through' }}>€{originalPrice}</span>}
            </div>
            <div style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>{offer.duration}</div>
          </div>
          <span style={{ position:'absolute', bottom:14, right:16, background:st.bg, color:st.color, fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:20 }}>{st.label}</span>
        </ServiceImage>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px' }}>
        {isMobile && <div style={{ width:36, height:4, background:c.border, borderRadius:4, margin:'14px auto 16px' }}/>}
        {!isMobile && <div style={{ height:20 }}/>}
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:c.text, lineHeight:1.2, marginBottom:4 }}>{offer.title}</div>
        <div style={{ fontSize:13, color:c.textSecondary, marginBottom:8 }}>{offer.provider}</div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
          <Stars rating={offer.rating} size={13}/><span style={{ fontSize:13, fontWeight:700, color:c.text }}>{offer.rating}</span>
          <span style={{ fontSize:12, color:c.textMuted }}>· {offer.reviews} Bewertungen</span>
        </div>
        {tags.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>{tags.map(t=><Tag key={t} text={t}/>)}</div>}
        <div style={{ background:c.bgSecondary, borderRadius:14, padding:'13px 14px', marginBottom:14, fontSize:13, color:c.textSecondary, lineHeight:1.7 }}>{offer.description}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
          {[{icon:'📅',l:'Datum',v:offer.date},{icon:'🕐',l:'Uhrzeit',v:offer.time},{icon:'⏱',l:'Dauer',v:offer.duration},{icon:'💳',l:'Preis',v:`€${offer.price}`}].map(x => (
            <div key={x.l} style={{ background:c.bgSecondary, borderRadius:12, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:c.textSecondary, marginBottom:2 }}>{x.l}</div>
              <div style={{ fontSize:13, fontWeight:600, color:c.text }}>{x.icon} {x.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'12px 20px 24px', borderTop:`1px solid ${c.borderLight}`, flexShrink:0 }}>
        {isBooked ? (
          <div style={{ width:'100%', padding:'14px', borderRadius:14, background:'#e8f5e9', color:'#2d6a4f', fontSize:15, fontWeight:700, textAlign:'center' }}>✓ Bereits gebucht</div>
        ) : (
          <button onClick={() => setShowBooking(true)}
            style={{ width:'100%', padding:'14px', borderRadius:14, border:'none', background:c.accentGrad, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:8 }}>
            Termin buchen · €{offer.price}
          </button>
        )}
        {onToggleFav && (
          <button onClick={onToggleFav}
            style={{ width:'100%', padding:'10px', borderRadius:14, border:`1.5px solid ${c.border}`, background:'transparent', color:isFav?'#e53935':c.textSecondary, fontSize:13, fontWeight:500, cursor:'pointer', marginTop:isBooked?8:0 }}>
            {isFav ? '♥ Aus Favoriten entfernen' : '♡ Zu Favoriten hinzufügen'}
          </button>
        )}
      </div>

      {showBooking && onBook && (
        <BookingModal offer={offer as Offer} onClose={() => setShowBooking(false)}
          onConfirm={async (d) => { await onBook(d); setShowBooking(false); onClose(); }}
          isMobile={isMobile}/>
      )}
    </>
  );
}
