import type { Offer } from '@/types';
import { STATUS_CONFIG, catMap } from '@/config';
import { useTheme } from '@/context/ThemeContext';
import { ServiceImage, Stars, Tag } from './Shared';

interface OfferCardProps { offer:Offer; onPress:(o:Offer)=>void; selected?:boolean; cardHeight?:number; }
export function OfferCard({ offer, onPress, selected=false, cardHeight=148 }: OfferCardProps) {
  const { c } = useTheme();
  const st  = STATUS_CONFIG[offer.status] ?? STATUS_CONFIG.available;
  const cat = catMap[offer.category];
  return (
    <div onClick={() => onPress(offer)} style={{ background:c.bgCard, borderRadius:20, overflow:'hidden', cursor:'pointer', boxShadow:selected?`0 0 0 2.5px ${c.accent}, 0 8px 32px ${c.accent}22`:c.shadow, transform:selected?'translateY(-2px)':'none', transition:'box-shadow .15s, transform .15s', marginBottom:12 }}>
      <ServiceImage category={offer.category} height={cardHeight}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 55%)' }}/>
        <div style={{ position:'absolute', top:9, left:10, display:'flex', gap:5 }}>{offer.tags.map(t=><Tag key={t} text={t}/>)}</div>
        <span style={{ position:'absolute', top:9, right:10, background:st.bg, color:st.color, fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20 }}>{st.label}</span>
        <div style={{ position:'absolute', bottom:10, left:12, display:'flex', alignItems:'baseline', gap:5 }}>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:'#fff' }}>€{offer.price}</span>
          {offer.originalPrice && <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', textDecoration:'line-through' }}>€{offer.originalPrice}</span>}
        </div>
        <span style={{ position:'absolute', bottom:10, right:12, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:20 }}>{cat?.icon} {cat?.label}</span>
      </ServiceImage>
      <div style={{ padding:'12px 14px 14px' }}>
        <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:c.text, marginBottom:3 }}>{offer.title}</div>
        <div style={{ fontSize:12, color:c.textSecondary, marginBottom:9 }}>{offer.provider}</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <Stars rating={offer.rating} size={11}/>
            <span style={{ fontSize:12, fontWeight:700, color:c.text }}>{offer.rating}</span>
            <span style={{ fontSize:11, color:c.textMuted }}>({offer.reviews})</span>
          </div>
          <span style={{ fontSize:11, color:c.textMuted }}>⏱ {offer.duration}</span>
        </div>
        <div style={{ marginTop:7, fontSize:11, color:c.textMuted }}>📅 {offer.date} · {offer.time}</div>
      </div>
    </div>
  );
}
