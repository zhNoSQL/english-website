import { useEffect, useRef, useState } from 'react'
import {
  audioSrc,
  characters,
  countries,
  dialogueTimeline,
  keyNumbers,
  percentageCues,
  sourcesNote,
  tourTimeline,
} from './data/energy'
import './App.css'
import reactLogo from './assets/react.svg'

/* ---------- helpers ---------- */
function useInViewCount(value, duration = 1300) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        const t0 = performance.now()
        const tick = (t) => {
          const p = Math.min((t - t0) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(value * eased)
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return [ref, display]
}

function activeAt(list, t, key = 'time') {
  let current = null
  for (const item of list) {
    if (t >= item[key]) current = item
    else break
  }
  return current
}

/* ---------- small pieces ---------- */
function Topbar() {
  return (
    <header className="topbar">
      <a className="brand" href="#top">
        WATTS<span>?</span>
      </a>
      <nav className="nav">
        <a href="#numbers">Numbers</a>
        <a href="#compare">Compare</a>
        <a href="#sources">Sources</a>
      </nav>
      <span className="stamp">English · Term project</span>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <p className="kicker">English class project — Energy &amp; electricity</p>
      <h1 className="title">
        Watts the <em>difference?</em>
      </h1>
      <p className="lede">
        A short dialogue between two friends comparing how{' '}
        <b>Australia</b> and the <b>United States</b> generate their energy —
        from coal, gas and oil to wind, solar and uranium.
      </p>
      <div className="chips">
        <span className="chip">2 speakers</span>
        <span className="chip">1 audio guide</span>
        <span className="chip">2 countries</span>
        <span className="chip">Chart follows the audio</span>
      </div>
    </section>
  )
}

function Marquee() {
  const words = ['COAL', 'GAS', 'NUCLEAR', 'WIND', 'SOLAR', 'HYDRO', 'BIOMASS']
  const row = [...words, ...words]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((w, i) => (
          <span key={i} className={i % 2 ? 'outline' : ''}>
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- live captions: the audio, made visible ---------- */
function Captions({ line }) {
  if (!line) return null
  const speaker = characters[line.who]
  return (
    <div className="captions" key={line.id}>
      <div className="captions-avatar" style={{ background: speaker.color }}>
        {speaker.name[0]}
      </div>
      <div className="captions-body">
        <span className="captions-name">{speaker.name}</span>
        <p className="captions-text">{line.text}</p>
      </div>
    </div>
  )
}

function Stat({ value, suffix = '', label }) {
  const [ref, display] = useInViewCount(value)
  return (
    <div className="stat" ref={ref}>
      <span className="stat-num">
        {Math.round(display)}
        {suffix && <sup>{suffix}</sup>}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function Stats({ live }) {
  return (
    <section className="numbers" id="numbers">
      <div className="section-head">
        <span className="section-no">02</span>
        <div>
          <h2>The numbers that matter</h2>
          <p>Four figures worth remembering.</p>
        </div>
        {live && <span className="live-badge">● LIVE</span>}
      </div>
      <div className="stats">
        {keyNumbers.map((k) => (
          <Stat key={k.label} {...k} />
        ))}
      </div>
    </section>
  )
}

/* ---------- donut chart ---------- */
function Donut({ country, activeIds, centerLabel, centerValue, hoveredId, onHover, onSelect }) {
  const R = 70
  const C = 2 * Math.PI * R
  const STROKE = 26

  const segs = country.sources.reduce((list, s) => {
    const prevOffset = list.length ? list[list.length - 1].offset + list[list.length - 1].sweep : 0
    const frac = s.pct / 100
    const sweep = frac * C
    list.push({ ...s, dash: Math.max(sweep - 2.5, 1), offset: prevOffset, sweep })
    return list
  }, [])

  const highlightIds = hoveredId ? [hoveredId] : activeIds
  const hasHighlight = highlightIds && highlightIds.length > 0
  const hoveredSeg = hoveredId ? segs.find((s) => s.id === hoveredId) : null

  let mid = centerLabel ?? `${country.short} · MIX`
  let big = centerValue != null ? `${centerValue}%` : '100%'
  if (hoveredSeg) {
    mid = hoveredSeg.short
    big = `${hoveredSeg.pct}%`
  }

  return (
    <div className={`donut-panel${hasHighlight ? ' is-live' : ''}`}>
      <div className="donut-title">
        <span className="country-short">{country.short}</span>
        <div>
          <h3>{country.name}</h3>
          <p>{country.tag}</p>
        </div>
      </div>

      <div className="donut-stage">
        <svg
          viewBox="0 0 200 200"
          className="donut"
          role="img"
          aria-label={`${country.name} electricity mix chart`}
        >
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            className="donut-track"
            strokeWidth={STROKE}
          />
          {segs.map((seg) => {
            const on = hasHighlight ? highlightIds.includes(seg.id) : true
            return (
              <circle
                key={seg.id}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${seg.dash} ${C - seg.dash}`}
                strokeDashoffset={-seg.offset}
                className={on ? 'seg on' : 'seg dim'}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                }}
                onMouseEnter={() => onHover(seg.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(country.id, seg.id)}
              >
                <title>
                  {seg.label}: {seg.pct}%
                </title>
              </circle>
            )
          })}
          <text x="100" y="98" textAnchor="middle" className="donut-num">
            {big}
          </text>
          <text x="100" y="118" textAnchor="middle" className="donut-label">
            {mid}
          </text>
        </svg>
      </div>

      <ul className="legend">
        {segs.map((seg) => (
          <li key={seg.id}>
            <button
              type="button"
              className={hasHighlight && highlightIds.includes(seg.id) ? 'active' : ''}
              onMouseEnter={() => onHover(seg.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(country.id, seg.id)}
            >
              <i style={{ background: seg.color }} />
              <span>{seg.label}</span>
              <b>{seg.pct}%</b>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Compare({ live, cue, onSeekTo }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [hoveredCountry, setHoveredCountry] = useState(null)

  const lookup = {}
  countries.forEach((c) =>
    c.sources.forEach((s) => {
      if (!lookup[`${c.id}:${s.id}`]) lookup[`${c.id}:${s.id}`] = { ...s, countryId: c.id }
    }),
  )

  const hovered = hoveredId ? lookup[`${hoveredCountry}:${hoveredId}`] : null
  const active = hovered
    ? hovered
    : cue
      ? { ...lookup[`${cue.country}:${cue.ids[0]}`], countryId: cue.country, isCue: true }
      : null

  const handleHover = (countryId, id) => {
    setHoveredCountry(countryId)
    setHoveredId(id)
  }

  const handleSelect = (countryId, id) => {
    onSeekTo(countryId, id)
  }

  return (
    <section className="compare" id="compare">
      <div className="section-head">
        <span className="section-no">03</span>
        <div>
          <h2>Two grids, side by side</h2>
          <p>Play the audio — the right slice lights up as each number is said. Click any slice to jump the audio there.</p>
        </div>
        {live && <span className="live-badge">● LIVE</span>}
      </div>

      <div className="compare-grid">
        {countries.map((c) => {
          const isCueCountry = cue && cue.country === c.id
          return (
            <Donut
              key={c.id}
              country={c}
              activeIds={isCueCountry ? cue.ids : []}
              centerLabel={isCueCountry ? (cue.kind === 'category' ? cue.label : lookup[`${c.id}:${cue.ids[0]}`]?.short) : undefined}
              centerValue={isCueCountry ? cue.pct : undefined}
              hoveredId={hoveredCountry === c.id ? hoveredId : null}
              onHover={(id) => handleHover(c.id, id)}
              onSelect={handleSelect}
            />
          )
        })}
      </div>

      <div className="fact-strip">
        {active ? (
          <>
            <i className="fact-dot" style={{ background: active.color }} />
            <div className="fact-body">
              <b>
                {active.label} <span className="fact-country">· {active.countryId === 'usa' ? 'US' : 'AU'}</span>
              </b>
              <span>{active.fact}</span>
            </div>
          </>
        ) : (
          <p className="hint">Press play — or click a slice to hear that source mentioned.</p>
        )}
      </div>
      <p className="sources-note">{sourcesNote}</p>
    </section>
  )
}

/* ---------- field guide ---------- */
function buildSourceGuide() {
  const order = ['coal', 'gas', 'oil', 'uranium', 'wind', 'hydro', 'solar', 'biomass', 'geothermal']
  const map = {}
  countries.forEach((c) =>
    c.sources.forEach((s) => {
      if (!map[s.id]) map[s.id] = { ...s, perCountry: {} }
      map[s.id].perCountry[c.id] = s.pct
    }),
  )
  return order.filter((id) => map[id]).map((id) => map[id])
}

function Sources({ live }) {
  const guide = buildSourceGuide()
  return (
    <section className="sources" id="sources">
      <div className="section-head">
        <span className="section-no">04</span>
        <div>
          <h2>Field guide to energy sources</h2>
          <p>What each fuel does — and who uses it most.</p>
        </div>
        {live && <span className="live-badge">● LIVE</span>}
      </div>
      <div className="guide-grid">
        {guide.map((s) => (
          <article className="guide-card" key={s.id}>
            <div className="guide-top">
              <span className="guide-swatch" style={{ background: s.color }} />
              <h3>{s.label}</h3>
            </div>
            <p className="guide-fact">{s.fact}</p>
            <div className="guide-pcts">
              <span>
                <b>US</b>{' '}
                {s.perCountry.usa != null ? `${s.perCountry.usa}%` : '0%'}
              </span>
              <span>
                <b>AU</b>{' '}
                {s.perCountry.australia != null ? `${s.perCountry.australia}%` : '0%'}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-line">
        <img src={reactLogo} alt="React logo" className="react-logo" />
        Made with ReactJS for English class by Damien Frappa &amp; Enzo Beaufils
        <span className="dot">·</span>
        Australia: NEM 2020/21 (AEMO) &amp; United States: EIA 2013.
      </p>
    </footer>
  )
}

function scrollToSection(section) {
  if (section === 'end') {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  } else if (section === 'hero') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

function StartOverlay({ onStart, audioError }) {
  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="kicker">English class project — Energy &amp; electricity</p>
        <h2 className="overlay-title">
          Watts the <em>difference?</em>
        </h2>
        {audioError ? (
          <p className="overlay-warn">
            Audio file not found. Add your recording at{' '}
            <code>public/dialogue.mp3</code> and refresh the page.
          </p>
        ) : (
          <p className="overlay-note">
            This page runs entirely on the audio: press play and everything —
            the captions, the scroll, the charts — follows the dialogue.
          </p>
        )}
        {!audioError && (
          <button type="button" className="btn btn-main btn-big" onClick={onStart}>
            ▶ Start the presentation
          </button>
        )}
      </div>
    </div>
  )
}

function TourBar({ paused, progress, line, onToggle, onRestart }) {
  const speaker = line ? characters[line.who] : null
  return (
    <div className="tourbar">
      <button
        type="button"
        className="tour-play"
        onClick={onToggle}
        aria-label="Play or pause"
      >
        {paused ? '▶' : '❚❚'}
      </button>
      <div className="tour-info">
        <span className="tour-now" style={speaker ? { color: speaker.color } : undefined}>
          {speaker ? speaker.name : 'Now playing'}
        </span>
        <span className="tour-label">{line ? line.text : 'Starting…'}</span>
      </div>
      <div className="tour-progress">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <button
        type="button"
        className="tour-restart"
        onClick={onRestart}
        aria-label="Restart"
      >
        ↺
      </button>
    </div>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [live, setLive] = useState(null)
  const [currentLine, setCurrentLine] = useState(null)
  const [currentCue, setCurrentCue] = useState(null)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(true)
  const audioRef = useRef(null)

  const play = () => {
    const a = audioRef.current
    if (!a) return
    a.play().then(() => setPaused(false)).catch(() => setPaused(true))
  }

  const start = () => {
    setStarted(true)
    const a = audioRef.current
    if (a) {
      a.currentTime = 0
      play()
    }
    setLive('hero')
    scrollToSection('hero')
  }

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) play()
    else {
      a.pause()
      setPaused(true)
    }
  }

  const restart = () => {
    const a = audioRef.current
    if (a) {
      a.currentTime = 0
      play()
    }
    setProgress(0)
    setLive('hero')
    scrollToSection('hero')
  }

  const handleTimeUpdate = () => {
    const a = audioRef.current
    if (!a || !a.duration) return
    setProgress(a.currentTime / a.duration)
    const t = a.currentTime

    const line = activeAt(dialogueTimeline, t, 'start')
    setCurrentLine(line)

    const cue = activeAt(percentageCues, t, 'time')
    setCurrentCue(cue)

    const stage = activeAt(tourTimeline, t, 'time')
    if (stage && stage.section !== live) {
      setLive(stage.section)
      scrollToSection(stage.section)
    }
  }

  const handleEnded = () => {
    setPaused(true)
    setProgress(1)
    setLive('end')
  }

  const seekToSource = (countryId, sourceId) => {
    const cue = percentageCues.find(
      (c) => c.country === countryId && c.kind === 'source' && c.ids.includes(sourceId),
    )
    const a = audioRef.current
    if (!cue || !a) return
    a.currentTime = cue.time
    setCurrentCue(cue)
    setStarted(true)
    play()
  }

  return (
    <div className="site">
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setAudioError(true)}
      />

      <Topbar />
      <Hero />
      <Marquee />
      {started && <Captions line={currentLine} />}
      <Stats live={live === 'numbers'} />
      <Compare live={live === 'compare'} cue={currentCue} onSeekTo={seekToSource} />
      <Sources live={live === 'sources'} />
      <Footer />

      {!started && <StartOverlay onStart={start} audioError={audioError} />}
      {started && !audioError && (
        <TourBar
          paused={paused}
          progress={progress}
          line={currentLine}
          onToggle={togglePlay}
          onRestart={restart}
        />
      )}
    </div>
  )
}
