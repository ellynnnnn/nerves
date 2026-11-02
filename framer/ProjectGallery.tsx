// ProjectGallery — composant de code Framer
// Galerie horizontale de cartes fines (texte vertical). La carte au centre
// s'ouvre (image complète + titre + tags + description). Survol = image
// flottante. Filtres par tag. Glisser / molette pour balayer.
//
// Coller ce fichier dans Framer : Assets > Code > "+" > New component,
// puis remplacer tout le contenu par ce fichier.

import * as React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { animate, motion, useMotionValue, useSpring } from "framer-motion"

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Img = { src?: string; srcSet?: string; alt?: string } | string | undefined

interface Project {
    title?: string
    description?: string
    tags?: string[]
    image?: Img
    hoverImage?: Img
    link?: string
    newTab?: boolean
    cardColor?: string
}

interface Props {
    projects: Project[]
    filters: string[]
    allLabel: string

    openCardMode: "builtin" | "custom"
    openCardSlots: React.ReactNode[]

    layout: {
        collapsedWidth: number
        expandedWidth: number
        gap: number
        radius: number
        startIndex: number
        paddingTop: number
    }
    motionCfg: {
        dragSpeed: number
        momentum: number
        wheelMode: "all" | "horizontal" | "off"
        wheelSpeed: number
        stiffness: number
        damping: number
        thinClick: "center" | "link"
    }
    thinCard: {
        background: string
        textColor: string
        borderColor: string
        borderWidth: number
        textAlign: "bottom" | "center" | "top"
        font: React.CSSProperties
    }
    openCard: {
        position: "bottom-left" | "bottom-center" | "top-left" | "center"
        padding: number
        showDescription: boolean
        titleFont: React.CSSProperties
        titleColor: string
        titleBackground: string
        descFont: React.CSSProperties
        descColor: string
        tagFont: React.CSSProperties
        tagColor: string
        tagBackground: string
        overlay: string
    }
    hover: {
        enabled: boolean
        width: number
        height: number
        radius: number
        offsetX: number
        offsetY: number
        smoothness: number
        shadow: boolean
    }
    filterBar: {
        show: boolean
        showRuler: boolean
        align: "flex-start" | "center" | "flex-end"
        font: React.CSSProperties
        color: string
        activeColor: string
        activeBackground: string
        rulerColor: string
        gap: number
    }
    cursor: {
        type: "grab" | "pointer" | "default" | "label" | "image" | "none"
        image?: Img
        size: number
        background: string
        textColor: string
        dragLabel: string
        openLabel: string
        font: React.CSSProperties
    }
    style?: React.CSSProperties
}

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

const ALL = "__all__"
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const smooth = (t: number) => t * t * (3 - 2 * t)
const norm = (s?: string) => (s || "").trim().toLowerCase()
const srcOf = (i: Img) => (!i ? "" : typeof i === "string" ? i : i.src || "")
const srcSetOf = (i: Img) => (i && typeof i !== "string" ? i.srcSet : undefined)

const PLACEHOLDERS = ["#d9d4cc", "#c9d3d8", "#d8cfd9", "#d2d9c9", "#d9cbc4"]

function goTo(link?: string, newTab?: boolean) {
    if (!link || typeof window === "undefined") return
    if (newTab) window.open(link, "_blank", "noopener")
    else window.location.href = link
}

/* ------------------------------------------------------------------ */
/* Composant                                                          */
/* ------------------------------------------------------------------ */

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1000
 * @framerIntrinsicHeight 560
 */
export default function ProjectGallery(props: Props) {
    const {
        projects = [],
        filters = [],
        allLabel = "All",
        openCardMode,
        openCardSlots = [],
        layout,
        motionCfg,
        thinCard,
        openCard,
        hover,
        filterBar,
        cursor,
        style,
    } = props

    const cw = Math.max(8, layout.collapsedWidth)
    const ew = Math.max(cw, layout.expandedWidth)
    const gap = layout.gap
    const step = cw + gap

    /* --------- filtre --------- */
    const [filter, setFilter] = useState<string>(ALL)
    const items = useMemo(
        () =>
            projects
                .map((p, idx) => ({ ...p, _idx: idx }))
                .filter(
                    (p) =>
                        filter === ALL ||
                        (p.tags || []).some((t) => norm(t) === norm(filter))
                ),
        [projects, filter]
    )
    const n = items.length
    const maxPos = Math.max(0, n - 1)

    /* --------- position (float, index de la carte centrée) --------- */
    const startPos = clamp(layout.startIndex, 0, maxPos)
    const [pos, setPos] = useState(startPos)
    const posRef = useRef(pos)
    const animRef = useRef<{ stop: () => void } | null>(null)

    const cfg = useRef({ n, step, motionCfg })
    cfg.current = { n, step, motionCfg }

    const setP = useCallback((v: number) => {
        posRef.current = v
        setPos(v)
    }, [])

    const stopAnim = () => {
        animRef.current?.stop()
        animRef.current = null
    }

    const animateTo = useCallback(
        (target: number) => {
            const c = cfg.current
            stopAnim()
            const t = clamp(Math.round(target), 0, Math.max(0, c.n - 1))
            animRef.current = animate(posRef.current, t, {
                type: "spring",
                stiffness: c.motionCfg.stiffness,
                damping: c.motionCfg.damping,
                onUpdate: setP,
            })
        },
        [setP]
    )

    // changement de filtre ou de nombre de cartes → on recentre
    useEffect(() => {
        stopAnim()
        setP(clamp(layout.startIndex, 0, Math.max(0, n - 1)))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, n, layout.startIndex])

    /* --------- taille de la piste --------- */
    const trackRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const [trackW, setTrackW] = useState(1000)
    useEffect(() => {
        const el = trackRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver((entries) => {
            setTrackW(entries[0].contentRect.width)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    /* --------- drag --------- */
    const drag = useRef({
        active: false,
        moved: false,
        startX: 0,
        startPos: 0,
        lastX: 0,
        lastT: 0,
        v: 0,
    })
    const justDragged = useRef(false)
    const [dragging, setDragging] = useState(false)

    const rubber = (v: number) => {
        const max = Math.max(0, cfg.current.n - 1)
        if (v < 0) return v * 0.3
        if (v > max) return max + (v - max) * 0.3
        return v
    }

    const onPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return
        stopAnim()
        drag.current = {
            active: true,
            moved: false,
            startX: e.clientX,
            startPos: posRef.current,
            lastX: e.clientX,
            lastT: performance.now(),
            v: 0,
        }
    }

    const onPointerMoveTrack = (e: React.PointerEvent) => {
        const d = drag.current
        if (!d.active) return
        const dx = e.clientX - d.startX
        if (!d.moved && Math.abs(dx) > 5) {
            d.moved = true
            setDragging(true)
            setHovered(null)
            try {
                ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
            } catch {}
        }
        if (!d.moved) return
        setP(rubber(d.startPos - (dx * motionCfg.dragSpeed) / step))
        const now = performance.now()
        const dt = now - d.lastT
        if (dt > 0) d.v = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.v
        d.lastX = e.clientX
        d.lastT = now
    }

    const endDrag = () => {
        const d = drag.current
        if (!d.active) return
        d.active = false
        if (!d.moved) return
        setDragging(false)
        justDragged.current = true
        setTimeout(() => (justDragged.current = false), 0)
        const fling = (d.v * motionCfg.momentum * motionCfg.dragSpeed * 120) / step
        animateTo(posRef.current - fling)
    }

    /* --------- molette --------- */
    const wheelTimer = useRef<any>(null)
    useEffect(() => {
        const el = trackRef.current
        if (!el) return
        const onWheel = (e: WheelEvent) => {
            const c = cfg.current
            const mode = c.motionCfg.wheelMode
            if (mode === "off") return
            const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            if (mode === "horizontal" && !horiz) return
            const delta = horiz ? e.deltaX : e.deltaY
            const max = Math.max(0, c.n - 1)
            const cur = posRef.current
            // aux extrémités, on laisse la page défiler
            if (!horiz && ((delta < 0 && cur <= 0) || (delta > 0 && cur >= max)))
                return
            e.preventDefault()
            animRef.current?.stop()
            setP(clamp(cur + (delta * c.motionCfg.wheelSpeed) / c.step, 0, max))
            clearTimeout(wheelTimer.current)
            wheelTimer.current = setTimeout(
                () => animateTo(posRef.current),
                140
            )
        }
        el.addEventListener("wheel", onWheel, { passive: false })
        return () => el.removeEventListener("wheel", onWheel)
    }, [animateTo, setP])

    /* --------- souris : survol + curseur --------- */
    const mx = useMotionValue(0)
    const my = useMotionValue(0)
    const springCfg = {
        stiffness: 600 / Math.max(0.2, hover.smoothness),
        damping: 40,
        mass: 0.6,
    }
    const hx = useSpring(mx, springCfg)
    const hy = useSpring(my, springCfg)
    const [hovered, setHovered] = useState<number | null>(null)
    const [inside, setInside] = useState(false)

    const onRootMove = (e: React.PointerEvent) => {
        const r = rootRef.current?.getBoundingClientRect()
        if (!r) return
        mx.set(e.clientX - r.left)
        my.set(e.clientY - r.top)
    }

    /* --------- mise en page des cartes --------- */
    const fp = clamp(pos, 0, maxPos)
    const ts = items.map((_, i) => smooth(1 - Math.min(1, Math.abs(i - fp))))
    const widths = ts.map((t) => cw + (ew - cw) * t)
    const lefts: number[] = []
    let acc = 0
    for (let i = 0; i < n; i++) {
        lefts.push(acc)
        acc += widths[i] + gap
    }
    const centers = lefts.map((l, i) => l + widths[i] / 2)
    const i0 = Math.floor(fp)
    const f = fp - i0
    const focusCenter =
        n === 0
            ? 0
            : i0 + 1 < n
              ? centers[i0] * (1 - f) + centers[i0 + 1] * f
              : centers[i0]
    const offset = trackW / 2 - focusCenter - (pos - fp) * step
    const activeIndex = Math.round(fp)

    /* --------- clic carte --------- */
    const onCardClick = (i: number, p: Project) => {
        if (justDragged.current) return
        if (i === activeIndex) goTo(p.link, p.newTab)
        else if (motionCfg.thinClick === "link" && p.link) goTo(p.link, p.newTab)
        else animateTo(i)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") animateTo(activeIndex + 1)
        else if (e.key === "ArrowLeft") animateTo(activeIndex - 1)
        else if (e.key === "Enter" && items[activeIndex])
            goTo(items[activeIndex].link, items[activeIndex].newTab)
    }

    /* --------- curseur --------- */
    const followerCursor = cursor.type === "label" || cursor.type === "image"
    let nativeCursor: string = "default"
    if (cursor.type === "grab") nativeCursor = dragging ? "grabbing" : "grab"
    else if (cursor.type === "pointer") nativeCursor = "pointer"
    else if (followerCursor || cursor.type === "none") nativeCursor = "none"
    const overActive = hovered === activeIndex

    const hoverItem =
        hover.enabled && hovered !== null && hovered !== activeIndex && !dragging
            ? items[hovered]
            : null
    const hoverSrc = hoverItem ? srcOf(hoverItem.hoverImage) || srcOf(hoverItem.image) : ""

    /* --------- rendu --------- */
    return (
        <div
            ref={rootRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerMove={onRootMove}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: filterBar.gap,
                outline: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
            }}
        >
            {/* ---------- Règle + filtres ---------- */}
            {(filterBar.showRuler || filterBar.show) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filterBar.showRuler && (
                        <Ruler
                            color={filterBar.rulerColor}
                            progress={maxPos === 0 ? 0.5 : fp / maxPos}
                        />
                    )}
                    {filterBar.show && (
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: filterBar.align,
                                gap: 6,
                            }}
                        >
                            {[ALL, ...filters].map((fl) => {
                                const active = fl === filter
                                return (
                                    <button
                                        key={fl}
                                        onClick={() => setFilter(fl)}
                                        style={{
                                            ...filterBar.font,
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            background: active
                                                ? filterBar.activeBackground
                                                : "transparent",
                                            color: active
                                                ? filterBar.activeColor
                                                : filterBar.color,
                                            transition: "background .2s, color .2s",
                                        }}
                                    >
                                        {fl === ALL ? allLabel : fl}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ---------- Piste ---------- */}
            <div
                ref={trackRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMoveTrack}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerEnter={() => setInside(true)}
                onPointerLeave={() => {
                    setInside(false)
                    setHovered(null)
                }}
                style={{
                    position: "relative",
                    flex: 1,
                    minHeight: 0,
                    marginTop: layout.paddingTop,
                    overflow: "hidden",
                    cursor: nativeCursor,
                    touchAction: "pan-y",
                }}
            >
                {n === 0 && (
                    <div
                        style={{
                            ...thinCard.font,
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: thinCard.textColor,
                            opacity: 0.5,
                        }}
                    >
                        Aucun projet
                    </div>
                )}

                <motion.div
                    key={filter}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    style={{ position: "absolute", inset: 0 }}
                >
                    {items.map((p, i) => {
                        const t = ts[i]
                        const left = lefts[i] + offset
                        if (left > trackW + 50 || left + widths[i] < -50) return null
                        const img = srcOf(p.image)
                        const slot = openCardSlots[p._idx] as React.ReactElement | undefined
                        const useSlot =
                            openCardMode === "custom" && React.isValidElement(slot)
                        const openOpacity = clamp((t - 0.5) * 2, 0, 1)
                        return (
                            <div
                                key={p._idx}
                                onClick={() => onCardClick(i, p)}
                                onPointerEnter={() => !drag.current.moved && setHovered(i)}
                                onPointerLeave={() =>
                                    setHovered((h) => (h === i ? null : h))
                                }
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    bottom: 0,
                                    left,
                                    width: widths[i],
                                    overflow: "hidden",
                                    borderRadius: layout.radius,
                                    background: thinCard.background,
                                    boxShadow: `inset 0 0 0 ${thinCard.borderWidth}px ${thinCard.borderColor}`,
                                }}
                            >
                                {/* image (révélée depuis le centre quand la carte s'ouvre) */}
                                {t > 0.001 && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            bottom: 0,
                                            left: "50%",
                                            width: ew,
                                            transform: "translateX(-50%)",
                                            opacity: Math.min(1, t * 1.6),
                                            background:
                                                p.cardColor ||
                                                PLACEHOLDERS[p._idx % PLACEHOLDERS.length],
                                        }}
                                    >
                                        {img && (
                                            <img
                                                src={img}
                                                srcSet={srcSetOf(p.image)}
                                                alt={p.title || ""}
                                                draggable={false}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    pointerEvents: "none",
                                                    display: "block",
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* titre vertical (carte fermée) */}
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems:
                                            thinCard.textAlign === "bottom"
                                                ? "flex-end"
                                                : thinCard.textAlign === "top"
                                                  ? "flex-start"
                                                  : "center",
                                        padding: "16px 0",
                                        opacity: 1 - Math.min(1, t * 2),
                                        pointerEvents: "none",
                                    }}
                                >
                                    <span
                                        style={{
                                            ...thinCard.font,
                                            color: thinCard.textColor,
                                            writingMode: "vertical-rl",
                                            transform: "rotate(180deg)",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {p.title}
                                    </span>
                                </div>

                                {/* contenu carte ouverte */}
                                {openOpacity > 0 &&
                                    (useSlot ? (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                bottom: 0,
                                                left: "50%",
                                                width: ew,
                                                transform: "translateX(-50%)",
                                                opacity: openOpacity,
                                            }}
                                        >
                                            {React.cloneElement(slot!, {
                                                style: {
                                                    ...(slot!.props as any).style,
                                                    width: "100%",
                                                    height: "100%",
                                                },
                                            } as any)}
                                        </div>
                                    ) : (
                                        <OpenContent
                                            p={p}
                                            cfg={openCard}
                                            opacity={openOpacity}
                                            width={ew}
                                        />
                                    ))}
                            </div>
                        )
                    })}
                </motion.div>
            </div>

            {/* ---------- Image au survol ---------- */}
            {hoverItem && hoverSrc && (
                <motion.div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        x: hx,
                        y: hy,
                        pointerEvents: "none",
                        zIndex: 10,
                    }}
                >
                    <motion.img
                        key={hoverItem._idx}
                        src={hoverSrc}
                        alt=""
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            position: "absolute",
                            left: -hover.width / 2 + hover.offsetX,
                            top: -hover.height / 2 + hover.offsetY,
                            width: hover.width,
                            height: hover.height,
                            objectFit: "cover",
                            borderRadius: hover.radius,
                            boxShadow: hover.shadow
                                ? "0 12px 40px rgba(0,0,0,.25)"
                                : "none",
                        }}
                    />
                </motion.div>
            )}

            {/* ---------- Curseur personnalisé ---------- */}
            {followerCursor && inside && (
                <motion.div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        x: mx,
                        y: my,
                        pointerEvents: "none",
                        zIndex: 20,
                    }}
                >
                    {cursor.type === "image" && srcOf(cursor.image) ? (
                        <img
                            src={srcOf(cursor.image)}
                            alt=""
                            style={{
                                position: "absolute",
                                width: cursor.size,
                                height: cursor.size,
                                left: -cursor.size / 2,
                                top: -cursor.size / 2,
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <motion.div
                            animate={{ scale: dragging ? 0.85 : 1 }}
                            style={{
                                ...cursor.font,
                                position: "absolute",
                                width: cursor.size,
                                height: cursor.size,
                                left: -cursor.size / 2,
                                top: -cursor.size / 2,
                                borderRadius: "50%",
                                background: cursor.background,
                                color: cursor.textColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                            }}
                        >
                            {overActive && !dragging ? cursor.openLabel : cursor.dragLabel}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Sous-composants                                                    */
/* ------------------------------------------------------------------ */

function OpenContent({
    p,
    cfg,
    opacity,
    width,
}: {
    p: Project
    cfg: Props["openCard"]
    opacity: number
    width: number
}) {
    const pos = cfg.position
    const place: React.CSSProperties =
        pos === "bottom-left"
            ? { left: cfg.padding, bottom: cfg.padding, alignItems: "flex-start" }
            : pos === "bottom-center"
              ? { left: 0, right: 0, bottom: cfg.padding, alignItems: "center", textAlign: "center" }
              : pos === "top-left"
                ? { left: cfg.padding, top: cfg.padding, alignItems: "flex-start" }
                : { left: 0, right: 0, top: "50%", transform: "translateY(-50%)", alignItems: "center", textAlign: "center" }

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width,
                transform: "translateX(-50%)",
                opacity,
                pointerEvents: "none",
                background: cfg.overlay,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    maxWidth: width - cfg.padding * 2,
                    margin: pos.includes("center") ? "0 auto" : undefined,
                    ...place,
                    transform: `${place.transform || ""} translateY(${(1 - opacity) * 10}px)`,
                }}
            >
                <span
                    style={{
                        ...cfg.titleFont,
                        color: cfg.titleColor,
                        background: cfg.titleBackground,
                        padding: "2px 6px",
                        display: "inline-block",
                    }}
                >
                    {p.title}
                </span>
                {p.tags && p.tags.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap",
                            justifyContent: pos.includes("center") ? "center" : "flex-start",
                        }}
                    >
                        {p.tags.slice(0, 4).map((t, k) => (
                            <span
                                key={k}
                                style={{
                                    ...cfg.tagFont,
                                    color: cfg.tagColor,
                                    background: cfg.tagBackground,
                                    padding: "1px 5px",
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
                {cfg.showDescription && p.description && (
                    <p style={{ ...cfg.descFont, color: cfg.descColor, margin: 0, maxWidth: 340 }}>
                        {p.description}
                    </p>
                )}
            </div>
        </div>
    )
}

function Ruler({ color, progress }: { color: string; progress: number }) {
    return (
        <div style={{ position: "relative", height: 14 }}>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 4,
                    height: 6,
                    opacity: 0.45,
                    backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 1px, transparent 1px 8px)`,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    height: 14,
                    width: 1.5,
                    background: color,
                    left: `${clamp(progress, 0, 1) * 100}%`,
                }}
            />
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Contrôles Framer (panneau de droite)                               */
/* ------------------------------------------------------------------ */

const DEFAULT_PROJECTS: Project[] = [
    { title: "Fritz Kola", tags: ["Brand", "Motion"], description: "Campagne estivale." },
    { title: "BNF Richelieu", tags: ["Design", "Digital", "UI/UX"], description: "Refonte du site de la BnF Richelieu." },
    { title: "Flop", tags: ["Motion"], description: "Court métrage d'animation." },
    { title: "Salomon", tags: ["Product", "Web"], description: "Lancement produit." },
    { title: "Melon Love Affair", tags: ["Brand"], description: "Identité visuelle." },
]

addPropertyControls(ProjectGallery, {
    projects: {
        type: ControlType.Array,
        title: "Projets",
        maxCount: 15,
        defaultValue: DEFAULT_PROJECTS,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Titre", defaultValue: "Projet" },
                description: {
                    type: ControlType.String,
                    title: "Description",
                    displayTextArea: true,
                    defaultValue: "",
                },
                tags: {
                    type: ControlType.Array,
                    title: "Tags",
                    maxCount: 4,
                    control: { type: ControlType.String },
                    defaultValue: [],
                },
                image: { type: ControlType.ResponsiveImage, title: "Image" },
                hoverImage: { type: ControlType.ResponsiveImage, title: "Image survol" },
                cardColor: { type: ControlType.Color, title: "Couleur fond", optional: true },
                link: { type: ControlType.Link, title: "Lien" },
                newTab: { type: ControlType.Boolean, title: "Nouvel onglet", defaultValue: false },
            },
        },
    },

    filters: {
        type: ControlType.Array,
        title: "Filtres",
        maxCount: 12,
        control: { type: ControlType.String },
        defaultValue: ["Brand", "Motion", "Product", "Web", "UI/UX"],
    },
    allLabel: { type: ControlType.String, title: "Label « All »", defaultValue: "All" },

    openCardMode: {
        type: ControlType.Enum,
        title: "Carte ouverte",
        options: ["builtin", "custom"],
        optionTitles: ["Intégrée", "Mon composant"],
        defaultValue: "builtin",
        displaySegmentedControl: true,
    },
    openCardSlots: {
        type: ControlType.Array,
        title: "Templates",
        maxCount: 15,
        control: { type: ControlType.ComponentInstance },
        hidden: (p: any) => p.openCardMode !== "custom",
    },

    layout: {
        type: ControlType.Object,
        title: "Mise en page",
        controls: {
            collapsedWidth: { type: ControlType.Number, title: "Largeur fine", min: 20, max: 200, defaultValue: 66, unit: "px" },
            expandedWidth: { type: ControlType.Number, title: "Largeur ouverte", min: 100, max: 1600, defaultValue: 440, unit: "px" },
            gap: { type: ControlType.Number, title: "Espacement", min: 0, max: 60, defaultValue: 6, unit: "px" },
            radius: { type: ControlType.Number, title: "Arrondi", min: 0, max: 60, defaultValue: 0, unit: "px" },
            startIndex: { type: ControlType.Number, title: "Carte de départ", min: 0, max: 14, step: 1, defaultValue: 2, displayStepper: true },
            paddingTop: { type: ControlType.Number, title: "Marge haut", min: 0, max: 200, defaultValue: 16, unit: "px" },
        },
    },

    motionCfg: {
        type: ControlType.Object,
        title: "Drag & scroll",
        controls: {
            dragSpeed: { type: ControlType.Number, title: "Vitesse drag", min: 0.2, max: 4, step: 0.1, defaultValue: 1 },
            momentum: { type: ControlType.Number, title: "Élan", min: 0, max: 3, step: 0.1, defaultValue: 1 },
            wheelMode: {
                type: ControlType.Enum,
                title: "Molette",
                options: ["all", "horizontal", "off"],
                optionTitles: ["Toutes", "Horizontale", "Off"],
                defaultValue: "all",
            },
            wheelSpeed: { type: ControlType.Number, title: "Vitesse molette", min: 0.1, max: 4, step: 0.1, defaultValue: 1 },
            stiffness: { type: ControlType.Number, title: "Ressort raideur", min: 50, max: 800, defaultValue: 260 },
            damping: { type: ControlType.Number, title: "Ressort amorti", min: 5, max: 80, defaultValue: 32 },
            thinClick: {
                type: ControlType.Enum,
                title: "Clic carte fine",
                options: ["center", "link"],
                optionTitles: ["Centrer", "Ouvrir le lien"],
                defaultValue: "center",
            },
        },
    },

    thinCard: {
        type: ControlType.Object,
        title: "Carte fine",
        controls: {
            background: { type: ControlType.Color, title: "Fond", defaultValue: "#FFFFFF" },
            textColor: { type: ControlType.Color, title: "Texte", defaultValue: "#000000" },
            borderColor: { type: ControlType.Color, title: "Bordure", defaultValue: "#000000" },
            borderWidth: { type: ControlType.Number, title: "Épaisseur", min: 0, max: 6, step: 0.5, defaultValue: 1 },
            textAlign: {
                type: ControlType.Enum,
                title: "Position titre",
                options: ["bottom", "center", "top"],
                optionTitles: ["Bas", "Centre", "Haut"],
                defaultValue: "bottom",
            },
            font: {
                type: ControlType.Font,
                title: "Typo",
                controls: "extended",
                defaultFontType: "monospace",
                defaultValue: { fontSize: 24, letterSpacing: "0.02em" },
            },
        },
    },

    openCard: {
        type: ControlType.Object,
        title: "Carte ouverte (intégrée)",
        controls: {
            position: {
                type: ControlType.Enum,
                title: "Position",
                options: ["bottom-left", "bottom-center", "top-left", "center"],
                optionTitles: ["Bas gauche", "Bas centre", "Haut gauche", "Centre"],
                defaultValue: "bottom-left",
            },
            padding: { type: ControlType.Number, title: "Marge", min: 0, max: 80, defaultValue: 18 },
            overlay: { type: ControlType.Color, title: "Voile", defaultValue: "rgba(0,0,0,0)" },
            showDescription: { type: ControlType.Boolean, title: "Description", defaultValue: true },
            titleFont: {
                type: ControlType.Font,
                title: "Typo titre",
                controls: "extended",
                defaultFontType: "monospace",
                defaultValue: { fontSize: 24 },
            },
            titleColor: { type: ControlType.Color, title: "Titre", defaultValue: "#000000" },
            titleBackground: { type: ControlType.Color, title: "Fond titre", defaultValue: "#FFFFFF" },
            tagFont: {
                type: ControlType.Font,
                title: "Typo tags",
                controls: "extended",
                defaultFontType: "monospace",
                defaultValue: { fontSize: 10 },
            },
            tagColor: { type: ControlType.Color, title: "Tags", defaultValue: "#FFFFFF" },
            tagBackground: { type: ControlType.Color, title: "Fond tags", defaultValue: "#000000" },
            descFont: {
                type: ControlType.Font,
                title: "Typo desc.",
                controls: "extended",
                defaultFontType: "sans-serif",
                defaultValue: { fontSize: 13 },
            },
            descColor: { type: ControlType.Color, title: "Description", defaultValue: "#FFFFFF" },
        },
    },

    hover: {
        type: ControlType.Object,
        title: "Image au survol",
        controls: {
            enabled: { type: ControlType.Boolean, title: "Activer", defaultValue: true },
            width: { type: ControlType.Number, title: "Largeur", min: 40, max: 800, defaultValue: 150, unit: "px" },
            height: { type: ControlType.Number, title: "Hauteur", min: 40, max: 800, defaultValue: 92, unit: "px" },
            radius: { type: ControlType.Number, title: "Arrondi", min: 0, max: 60, defaultValue: 0, unit: "px" },
            offsetX: { type: ControlType.Number, title: "Décalage X", min: -400, max: 400, defaultValue: 0 },
            offsetY: { type: ControlType.Number, title: "Décalage Y", min: -400, max: 400, defaultValue: 0 },
            smoothness: { type: ControlType.Number, title: "Douceur suivi", min: 0.2, max: 5, step: 0.1, defaultValue: 1 },
            shadow: { type: ControlType.Boolean, title: "Ombre", defaultValue: false },
        },
    },

    filterBar: {
        type: ControlType.Object,
        title: "Barre de filtres",
        controls: {
            show: { type: ControlType.Boolean, title: "Filtres", defaultValue: true },
            showRuler: { type: ControlType.Boolean, title: "Règle", defaultValue: true },
            align: {
                type: ControlType.Enum,
                title: "Alignement",
                options: ["flex-start", "center", "flex-end"],
                optionTitles: ["Gauche", "Centre", "Droite"],
                defaultValue: "center",
            },
            font: {
                type: ControlType.Font,
                title: "Typo",
                controls: "extended",
                defaultFontType: "sans-serif",
                defaultValue: { fontSize: 12 },
            },
            color: { type: ControlType.Color, title: "Texte", defaultValue: "#777777" },
            activeColor: { type: ControlType.Color, title: "Texte actif", defaultValue: "#000000" },
            activeBackground: { type: ControlType.Color, title: "Fond actif", defaultValue: "#EDEDED" },
            rulerColor: { type: ControlType.Color, title: "Règle", defaultValue: "#000000" },
            gap: { type: ControlType.Number, title: "Espace / cartes", min: 0, max: 120, defaultValue: 24 },
        },
    },

    cursor: {
        type: ControlType.Object,
        title: "Curseur",
        controls: {
            type: {
                type: ControlType.Enum,
                title: "Type",
                options: ["grab", "pointer", "default", "label", "image", "none"],
                optionTitles: ["Main (grab)", "Pointeur", "Flèche", "Rond + texte", "Mon image", "Masqué"],
                defaultValue: "label",
            },
            image: { type: ControlType.ResponsiveImage, title: "Image" },
            size: { type: ControlType.Number, title: "Taille", min: 8, max: 200, defaultValue: 64, unit: "px" },
            background: { type: ControlType.Color, title: "Fond", defaultValue: "#000000" },
            textColor: { type: ControlType.Color, title: "Texte", defaultValue: "#FFFFFF" },
            dragLabel: { type: ControlType.String, title: "Texte drag", defaultValue: "Drag" },
            openLabel: { type: ControlType.String, title: "Texte ouvrir", defaultValue: "Voir" },
            font: {
                type: ControlType.Font,
                title: "Typo",
                controls: "extended",
                defaultFontType: "monospace",
                defaultValue: { fontSize: 11 },
            },
        },
    },
})
