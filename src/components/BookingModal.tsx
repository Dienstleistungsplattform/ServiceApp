import { useState, useCallback, useRef, useEffect } from 'react';
import type { Offer, BookingDraft, PaymentMethod } from '@/types';
import { PAYMENT_METHODS, generateTimeSlots, type DaySlots } from '@/store';
import { useTheme } from '@/context/ThemeContext';
import { ServiceImage, Stars } from './Shared';

type Step = 1 | 2 | 3 | 4;

interface Props {
  offer: Offer;
  onClose: () => void;
  onConfirm: (draft: BookingDraft) => Promise<void>;
  isMobile?: boolean;
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const { c } = useTheme();
  const steps = ['Termin', 'Zahlung', 'Übersicht'];
  if (step === 4) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:24 }}>
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const done = step > n; const cur = step === n;
        return (
          <div key={n} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:done?'#2d6a4f':cur?c.accent:c.bgInput, color:done||cur?'#fff':c.textSecondary, fontSize:13, fontWeight:700, transition:'all .2s' }}>
                {done ? '✓' : n}
              </div>
              <div style={{ fontSize:10, color:cur?c.text:c.textSecondary, fontWeight:cur?700:400, whiteSpace:'nowrap' }}>{label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width:48, height:2, background:step>n?'#2d6a4f':c.border, margin:'0 6px', marginBottom:18, transition:'background .3s' }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Datum & Uhrzeit mit Rabatt ────────────────────────────────────────
function StepDateTime({ offer, selectedDate, selectedTime, onSelectDate, onSelectTime, onNext }: {
  offer: Offer; selectedDate: string; selectedTime: string;
  onSelectDate:(d:string)=>void; onSelectTime:(t:string)=>void; onNext:()=>void;
}) {
  const { c } = useTheme();
  const days: DaySlots[] = generateTimeSlots(offer.date);
  const selectedDay = days.find(d => d.date === selectedDate);

  // Mouse drag scroll for date strip
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    const onDown  = (e: MouseEvent) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; el.style.cursor = 'grabbing'; e.preventDefault(); };
    const onUp    = () => { isDown = false; el.style.cursor = 'grab'; };
    const onMove  = (e: MouseEvent) => { if (!isDown) return; e.preventDefault(); el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX); };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    el.style.cursor = 'grab';
    return () => { el.removeEventListener('mousedown', onDown); window.removeEventListener('mouseup', onUp); window.removeEventListener('mousemove', onMove); };
  }, []);

  return (
    <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800, color:c.text, marginBottom:4 }}>Wähle deinen Termin</div>
      <div style={{ fontSize:13, color:c.textSecondary, marginBottom:18 }}>Verfügbare Termine für {offer.title}</div>

      {/* Date strip */}
      <div ref={stripRef} style={{ display:'flex', gap:8, overflowX:'auto', flexWrap:'nowrap', paddingBottom:8, scrollbarWidth:'none', userSelect:'none' } as React.CSSProperties}>
        {days.map(day => {
          const sel = selectedDate === day.date;
          const parts = day.label.split('\u00a0').join(' ').split(' ');
          return (
            <button key={day.date} onClick={() => { onSelectDate(day.date); onSelectTime(''); }}
              style={{ flexShrink:0, padding:'10px 10px 8px', borderRadius:16, border:sel?'none':`1.5px solid ${c.border}`, background:sel?c.accent:c.bgCard, color:sel?'#fff':c.text, cursor:'pointer', minWidth:74, textAlign:'center', transition:'all .15s', boxShadow:sel?`0 4px 14px ${c.accent}44`:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
              <div style={{ fontSize:10, opacity:sel?0.65:0.5, marginBottom:1 }}>{parts[0]}</div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, margin:'2px 0' }}>{parts[1]}</div>
              <div style={{ fontSize:10, opacity:sel?0.65:0.5, marginBottom: day.maxDiscount>0?6:0 }}>{parts[2]}</div>
              {/* Max discount badge on date button */}
              {day.maxDiscount > 0 && (
                <div style={{ background:'#c05300', color:'#fff', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:8, whiteSpace:'nowrap', marginTop:2 }}>
                  bis -{day.maxDiscount}%
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      {selectedDay && (
        <>
          <div style={{ fontSize:13, fontWeight:600, color:c.textSecondary, margin:'18px 0 10px' }}>Uhrzeit</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(80px,1fr))', gap:8, padding:'8px 8px 4px', margin:'0 -8px', overflow:'visible' }}>
            {selectedDay.slots.map(slot => {
              const sel = selectedTime === slot.time;
              return (
                <button key={slot.time} onClick={() => onSelectTime(slot.time)}
                  style={{ padding:'10px 4px', borderRadius:12, border:sel?'none':`1.5px solid ${c.border}`, background:sel?c.accent:c.bgCard, color:sel?'#fff':c.text, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s', boxShadow:sel?`0 4px 14px ${c.accent}44`:'none', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {slot.time}
                  {slot.discount > 0 && (
                    <div style={{ position:'absolute', top:-7, right:-7, width:28, height:28, borderRadius:'50%', background:'#c05300', color:'#fff', fontSize:8, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, boxShadow:'0 2px 6px rgba(192,83,0,0.5)', border:`2px solid ${c.bgCard}`, flexDirection:'column' }}>
                      <span>-{slot.discount}</span>
                      <span>%</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <button onClick={onNext} disabled={!selectedDate || !selectedTime}
        style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background:selectedDate&&selectedTime?c.accentGrad:'#e0e0e0', color:selectedDate&&selectedTime?'#fff':'#aaa', fontSize:15, fontWeight:700, cursor:selectedDate&&selectedTime?'pointer':'not-allowed', marginTop:24, marginBottom:24, transition:'all .2s' }}>
        Weiter zur Zahlung →
      </button>
    </div>
  );
}

// ── Step 2: Zahlungsmethode ───────────────────────────────────────────────────
function StepPayment({ selected, onSelect, onNext, onBack }: {
  selected:PaymentMethod|''; onSelect:(m:PaymentMethod)=>void; onNext:()=>void; onBack:()=>void;
}) {
  const { c } = useTheme();
  // Editable card fields
  const [cardHolder, setCardHolder] = useState('Lena Müller');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp,    setCardExp]    = useState('12/27');
  const [cardCvv,    setCardCvv]    = useState('');

  const inputStyle: React.CSSProperties = {
    width:'100%', background:c.bgInput, border:`1.5px solid ${c.inputBorder}`,
    borderRadius:10, padding:'10px 13px', fontSize:14, color:c.text,
    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
    transition:'border-color .15s',
  };

  return (
    <div style={{ flex:1, overflowY:'auto' }}>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800, color:c.text, marginBottom:4 }}>Zahlungsmethode</div>
      <div style={{ fontSize:13, color:c.textSecondary, marginBottom:18 }}>Wie möchtest du bezahlen?</div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {PAYMENT_METHODS.map(pm => {
          const sel = selected === pm.id;
          return (
            <div key={pm.id} onClick={() => onSelect(pm.id)}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:16, border:sel?`2px solid ${c.accent}`:`1.5px solid ${c.border}`, background:sel?c.bgInput:c.bgCard, cursor:'pointer', transition:'all .15s' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:sel?c.accent:c.bgSecondary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, transition:'background .15s' }}>{pm.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:c.text }}>{pm.label}</div>
                <div style={{ fontSize:12, color:c.textSecondary, marginTop:1 }}>{pm.desc}</div>
              </div>
              <div style={{ width:20, height:20, borderRadius:'50%', border:sel?`6px solid ${c.accent}`:`2px solid ${c.border}`, flexShrink:0, transition:'all .15s' }}/>
            </div>
          );
        })}
      </div>

      {selected === 'card' && (
        <div style={{ marginTop:16, padding:'16px', background:c.bgSecondary, borderRadius:16 }}>
          <div style={{ fontSize:12, fontWeight:600, color:c.textSecondary, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Kartendaten</div>
          {[
            { label:'Karteninhaber', val:cardHolder, set:setCardHolder, type:'text', placeholder:'Vor- und Nachname' },
            { label:'Kartennummer',  val:cardNumber, set:setCardNumber, type:'text', placeholder:'0000 0000 0000 0000' },
            { label:'Ablaufdatum',   val:cardExp,    set:setCardExp,    type:'text', placeholder:'MM/JJ' },
            { label:'CVV',           val:cardCvv,    set:setCardCvv,    type:'password', placeholder:'•••' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:c.textSecondary, marginBottom:5, fontWeight:600 }}>{f.label}</div>
              <input
                type={f.type} value={f.val} placeholder={f.placeholder}
                onChange={e => f.set(e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginTop:24, marginBottom:24 }}>
        <button onClick={onBack} style={{ flex:1, padding:'14px', borderRadius:14, border:`1.5px solid ${c.border}`, background:c.bgCard, color:c.textSecondary, fontSize:15, fontWeight:600, cursor:'pointer' }}>← Zurück</button>
        <button onClick={onNext} disabled={!selected}
          style={{ flex:2, padding:'14px', borderRadius:14, border:'none', background:selected?c.accentGrad:'#e0e0e0', color:selected?'#fff':'#aaa', fontSize:15, fontWeight:700, cursor:selected?'pointer':'not-allowed', transition:'all .2s' }}>
          Zur Übersicht →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Zusammenfassung + AGB ─────────────────────────────────────────────
function StepSummary({ offer, date, time, paymentMethod, agbAccepted, onToggleAgb, onConfirm, onBack, submitting }: {
  offer:Offer; date:string; time:string; paymentMethod:PaymentMethod;
  agbAccepted:boolean; onToggleAgb:()=>void;
  onConfirm:()=>void; onBack:()=>void; submitting:boolean;
}) {
  const { c } = useTheme();
  const pm = PAYMENT_METHODS.find(p => p.id === paymentMethod);
  const formattedDate = new Date(date).toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div style={{ flex:1, overflowY:'auto' }}>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800, color:c.text, marginBottom:4 }}>Buchungsübersicht</div>
      <div style={{ fontSize:13, color:c.textSecondary, marginBottom:18 }}>Bitte überprüfe deine Angaben</div>

      <div style={{ background:c.bgSecondary, borderRadius:16, overflow:'hidden', marginBottom:14 }}>
        <div style={{ height:80, position:'relative' }}>
          <ServiceImage category={offer.category} height={80} iconSize={20}>
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)' }}/>
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding:'0 16px', gap:12 }}>
              <div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:800, color:'#fff' }}>{offer.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>{offer.provider}</div>
              </div>
              <div style={{ marginLeft:'auto', fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:'#fff' }}>€{offer.price}</div>
            </div>
          </ServiceImage>
        </div>
        <div style={{ padding:'14px 16px' }}>
          {[
            { icon:'📅', label:'Datum',   value:formattedDate },
            { icon:'🕐', label:'Uhrzeit', value:`${time} Uhr` },
            { icon:'⏱',  label:'Dauer',   value:offer.duration },
            { icon:pm?.icon??'💳', label:'Zahlung', value:pm?.label??'' },
          ].map(row => (
            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${c.borderLight}` }}>
              <span style={{ fontSize:13, color:c.textSecondary }}>{row.icon} {row.label}</span>
              <span style={{ fontSize:13, fontWeight:600, color:c.text }}>{row.value}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0 0' }}>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:c.text }}>Gesamtbetrag</span>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, fontWeight:800, color:c.accent }}>€{offer.price}</span>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
        <Stars rating={offer.rating} size={13}/>
        <span style={{ fontSize:13, fontWeight:700, color:c.text }}>{offer.rating}</span>
        <span style={{ fontSize:12, color:c.textMuted }}>· {offer.reviews} Bewertungen</span>
      </div>

      {/* AGB */}
      <div onClick={onToggleAgb}
        style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px', background:agbAccepted?'#e8f5ec':c.bgSecondary, borderRadius:14, border:agbAccepted?'1.5px solid #2d6a4f':`1.5px solid ${c.border}`, cursor:'pointer', marginBottom:agbAccepted?20:8, transition:'all .2s' }}>
        <div style={{ width:22, height:22, borderRadius:6, border:agbAccepted?'none':`2px solid ${c.border}`, background:agbAccepted?'#2d6a4f':c.bgCard, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13, color:'#fff', marginTop:1, transition:'all .2s' }}>
          {agbAccepted && '✓'}
        </div>
        <div style={{ fontSize:13, color:c.textSecondary, lineHeight:1.6 }}>
          Ich habe die{' '}
          <span onClick={e=>e.stopPropagation()} style={{ color:c.accent, fontWeight:600, textDecoration:'underline', cursor:'pointer' }}>Allgemeinen Geschäftsbedingungen</span>
          {' '}und die{' '}
          <span onClick={e=>e.stopPropagation()} style={{ color:c.accent, fontWeight:600, textDecoration:'underline', cursor:'pointer' }}>Datenschutzerklärung</span>
          {' '}gelesen und stimme zu.
        </div>
      </div>
      {!agbAccepted && (
        <div style={{ fontSize:12, color:'#c05300', marginBottom:16, paddingLeft:2 }}>⚠️ Bitte akzeptiere die AGBs, um fortzufahren.</div>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:24 }}>
        <button onClick={onBack} style={{ flex:1, padding:'14px', borderRadius:14, border:`1.5px solid ${c.border}`, background:c.bgCard, color:c.textSecondary, fontSize:15, fontWeight:600, cursor:'pointer' }}>← Zurück</button>
        <button onClick={onConfirm} disabled={!agbAccepted||submitting}
          style={{ flex:2, padding:'14px', borderRadius:14, border:'none', background:agbAccepted&&!submitting?c.accentGrad:'#e0e0e0', color:agbAccepted&&!submitting?'#fff':'#aaa', fontSize:15, fontWeight:700, cursor:agbAccepted&&!submitting?'pointer':'not-allowed', transition:'all .2s' }}>
          {submitting ? 'Wird gebucht...' : `Jetzt buchen · €${offer.price}`}
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Erfolg ────────────────────────────────────────────────────────────
function StepSuccess({ offer, date, time, onClose }: { offer:Offer; date:string; time:string; onClose:()=>void }) {
  const { c } = useTheme();
  const formattedDate = new Date(date).toLocaleDateString('de-DE', { weekday:'long', day:'numeric', month:'long' });
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 8px' }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#2d6a4f,#40a070)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:20, boxShadow:'0 8px 32px rgba(45,106,79,0.35)' }}>✓</div>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:c.text, marginBottom:8 }}>Termin gebucht!</div>
      <div style={{ fontSize:14, color:c.textSecondary, lineHeight:1.7, marginBottom:24 }}>
        Dein Termin für <strong>{offer.title}</strong><br/>
        bei <strong>{offer.provider}</strong><br/>
        am <strong>{formattedDate}</strong> um <strong>{time} Uhr</strong><br/>
        wurde erfolgreich gebucht.
      </div>
      <div style={{ background:c.bgSecondary, borderRadius:16, padding:'14px 20px', width:'100%', marginBottom:24, fontSize:13, color:c.textSecondary }}>
        📧 Eine Bestätigungs-E-Mail wurde an deine Adresse gesendet.
      </div>
      <button onClick={onClose} style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background:c.accentGrad, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>
        Zu meinen Buchungen
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function BookingModal({ offer, onClose, onConfirm, isMobile=false }: Props) {
  const { c } = useTheme();
  const [step, setStep]             = useState<Step>(1);
  const [selectedDate, setDate]     = useState('');
  const [selectedTime, setTime]     = useState('');
  const [paymentMethod, setPayment] = useState<PaymentMethod|''>('');
  const [agbAccepted, setAgb]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!selectedDate || !selectedTime || !paymentMethod || !agbAccepted) return;
    setSubmitting(true);
    try {
      await onConfirm({ offerId:offer.id, date:selectedDate, time:selectedTime, paymentMethod:paymentMethod as PaymentMethod, agbAccepted:true });
      setStep(4);
    } finally { setSubmitting(false); }
  }, [selectedDate, selectedTime, paymentMethod, agbAccepted, offer.id, onConfirm]);

  const containerStyle: React.CSSProperties = isMobile ? {
    position:'absolute', bottom:0, left:0, right:0,
    background:c.bgCard, borderRadius:'28px 28px 0 0', zIndex:20,
    padding:'0 20px 0', animation:'slideUp .3s cubic-bezier(.22,1,.36,1)',
    maxHeight:'94%', display:'flex', flexDirection:'column', overflow:'hidden',
  } : {
    position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
    background:c.bgCard, borderRadius:24, zIndex:51, padding:'32px', width:480,
    maxHeight:'90vh', display:'flex', flexDirection:'column',
    boxShadow:'0 24px 64px rgba(0,0,0,0.25)', animation:'fadeSlide .25s ease',
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:isMobile?19:50, backdropFilter:'blur(3px)' }}/>
      <div style={containerStyle}>
        {isMobile && <div style={{ width:36, height:4, background:c.border, borderRadius:4, margin:'14px auto 20px' }}/>}
        {step < 4 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:19, fontWeight:800, color:c.text }}>Termin buchen</div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:'none', background:c.bgInput, color:c.textSecondary, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
          </div>
        )}
        <StepIndicator step={step}/>
        {step===1 && <StepDateTime offer={offer} selectedDate={selectedDate} selectedTime={selectedTime} onSelectDate={setDate} onSelectTime={setTime} onNext={()=>setStep(2)}/>}
        {step===2 && <StepPayment  selected={paymentMethod} onSelect={m=>setPayment(m)} onNext={()=>setStep(3)} onBack={()=>setStep(1)}/>}
        {step===3 && <StepSummary  offer={offer} date={selectedDate} time={selectedTime} paymentMethod={paymentMethod as PaymentMethod} agbAccepted={agbAccepted} onToggleAgb={()=>setAgb(v=>!v)} onConfirm={handleConfirm} onBack={()=>setStep(2)} submitting={submitting}/>}
        {step===4 && <StepSuccess  offer={offer} date={selectedDate} time={selectedTime} onClose={onClose}/>}
      </div>
    </>
  );
}
