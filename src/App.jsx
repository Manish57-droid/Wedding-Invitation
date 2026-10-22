import { useEffect, useState } from 'react'
import { clearData, initialData, loadData, saveData } from './state.js'
import TemplateStep from './components/TemplateStep.jsx'
import CoupleStep from './components/CoupleStep.jsx'
import DetailsStep from './components/DetailsStep.jsx'
import PreviewStep from './components/PreviewStep.jsx'

const STEPS = [
  { id: 'template', label: 'Template' },
  { id: 'couple', label: 'Couple' },
  { id: 'details', label: 'Details' },
  { id: 'preview', label: 'Preview & Download' },
]

export default function App() {
  const [data, setData] = useState(loadData)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => saveData(data), 400)
    return () => clearTimeout(id)
  }, [data])

  const update = (patch) => setData((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }))

  const go = (i) => {
    setStep(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reset = () => {
    if (!confirm('Start over? This clears all names, photos and details.')) return
    clearData()
    setData(initialData())
    go(0)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">❦</span>
          <span>
            Shubh<b>Invites</b>
          </span>
        </div>
        <button className="link-btn" onClick={reset}>
          Start over
        </button>
      </header>

      <nav className="stepper" aria-label="Steps">
        {STEPS.map((s, i) => (
          <button key={s.id} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => go(i)}>
            <span className="step-num">{i < step ? '✓' : i + 1}</span>
            <span className="step-label">{s.label}</span>
          </button>
        ))}
      </nav>

      <main className="content">
        {step === 0 && <TemplateStep data={data} update={update} />}
        {step === 1 && <CoupleStep data={data} update={update} />}
        {step === 2 && <DetailsStep data={data} update={update} />}
        {step === 3 && <PreviewStep data={data} update={update} />}
      </main>

      <footer className="navbar">
        <button className="btn ghost" disabled={step === 0} onClick={() => go(step - 1)}>
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn primary" onClick={() => go(step + 1)}>
            Next: {STEPS[step + 1].label} →
          </button>
        ) : (
          <span className="privacy">🔒 Photos never leave your device</span>
        )}
      </footer>
    </div>
  )
}
