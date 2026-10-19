import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { motion } from "framer-motion"

/**
 * FolderTabs — onglets façon classeur, avec une page libre par onglet.
 *
 * Chaque page est un Frame que vous dessinez sur le canvas Framer puis
 * que vous reliez dans le panneau « Pages » : vous y mettez ce que vous voulez.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1000
 * @framerIntrinsicHeight 700
 */
export default function FolderTabs(props) {
    const {
        tabs,
        pages,
        defaultTab,
        font,
        textColor,
        activeTextColor,
        highlightStyle,
        highlightColor,
        tabColor,
        activeTabColor,
        hoverTabColor,
        borderColor,
        borderWidth,
        tabWidth,
        tabHeight,
        tabGap,
        chamfer,
        tabPadding,
        rowOffset,
        contentBackground,
        contentPadding,
        contentRadius,
        fillPage,
        scroll,
        transition,
        style,
    } = props

    const count = tabs.length
    const clamp = (i) => Math.max(0, Math.min(count - 1, i))
    const [active, setActive] = React.useState(clamp(defaultTab - 1))
    const [hovered, setHovered] = React.useState(-1)

    // Si le nombre d'onglets ou l'onglet par défaut change dans Framer
    React.useEffect(() => {
        setActive(clamp(defaultTab - 1))
    }, [defaultTab, count])

    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const bw = borderWidth
    // Coin biseauté intérieur, légèrement réduit pour garder un trait régulier sur la diagonale
    const innerChamfer = Math.max(0, chamfer - bw * 0.41)
    const shape = (c) =>
        `polygon(0 100%, 0 ${c}px, ${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% 100%)`

    const page = pages[active]
    const pageElement =
        page && fillPage
            ? React.cloneElement(page, {
                  style: { ...page.props.style, width: "100%", height: "100%" },
              })
            : page

    return (
        <div
            style={{
                ...style,
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
            }}
        >
            {/* Rangée d'onglets */}
            <div
                role="tablist"
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: tabGap,
                    paddingLeft: rowOffset,
                    marginBottom: -bw,
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                }}
            >
                {tabs.map((label, i) => {
                    const isActive = i === active
                    const fill = isActive
                        ? activeTabColor
                        : i === hovered
                          ? hoverTabColor
                          : tabColor
                    const isMarker = highlightStyle === "marker" && isActive
                    const isUnderline =
                        highlightStyle === "underline" && isActive

                    return (
                        <button
                            key={i}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActive(i)}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(-1)}
                            style={{
                                position: "relative",
                                width: tabWidth === 0 ? "auto" : tabWidth,
                                flex: tabWidth === 0 ? "1 1 0" : "0 0 auto",
                                height: tabHeight,
                                padding: `0 ${tabPadding}px`,
                                border: "none",
                                background: borderColor,
                                clipPath: shape(chamfer),
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                outline: "none",
                            }}
                        >
                            {/* Fond de l'onglet (le contour vient du bouton derrière) */}
                            <span
                                style={{
                                    position: "absolute",
                                    top: bw,
                                    left: bw,
                                    right: bw,
                                    // L'onglet actif « s'ouvre » sur la page : pas de trait en bas
                                    bottom: isActive ? 0 : bw,
                                    background: fill,
                                    clipPath: shape(innerChamfer),
                                    transition: "background 0.2s",
                                }}
                            />
                            <span
                                style={{
                                    position: "relative",
                                    ...font,
                                    color: isActive ? activeTextColor : textColor,
                                    whiteSpace: "nowrap",
                                    padding: isMarker ? "0.1em 0.35em" : 0,
                                    background: isMarker
                                        ? highlightColor
                                        : "transparent",
                                    textDecoration: isUnderline
                                        ? "underline"
                                        : "none",
                                    textDecorationColor: highlightColor,
                                    textDecorationThickness: "0.15em",
                                    textUnderlineOffset: "0.25em",
                                    transition:
                                        "background 0.2s, color 0.2s",
                                }}
                            >
                                {label}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Page de l'onglet actif */}
            <div
                role="tabpanel"
                style={{
                    position: "relative",
                    flex: 1,
                    minHeight: 0,
                    background: contentBackground,
                    border: `${bw}px solid ${borderColor}`,
                    borderRadius: `0 ${contentRadius}px ${contentRadius}px ${contentRadius}px`,
                    padding: contentPadding,
                    overflow: scroll ? "auto" : "hidden",
                    boxSizing: "border-box",
                }}
            >
                {page ? (
                    <motion.div
                        key={active}
                        initial={{ opacity: transition ? 0 : 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        style={{ width: "100%", height: "100%" }}
                    >
                        {pageElement}
                    </motion.div>
                ) : (
                    isCanvas && (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                color: "#999",
                                fontSize: 14,
                                fontFamily: "Inter, sans-serif",
                                lineHeight: 1.5,
                            }}
                        >
                            Page vide pour « {tabs[active]} ».
                            <br />
                            Dessinez un Frame sur le canvas puis reliez-le
                            dans « Pages » (position {active + 1}).
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

FolderTabs.defaultProps = {
    tabs: ["Graphic Design", "Motion", "Photography", "Always more"],
    pages: [],
    defaultTab: 1,
    textColor: "#222222",
    activeTextColor: "#000000",
    highlightStyle: "marker",
    highlightColor: "#FFF27A",
    tabColor: "#FFFFFF",
    activeTabColor: "#FFFFFF",
    hoverTabColor: "#F4F4F4",
    borderColor: "#444444",
    borderWidth: 1,
    tabWidth: 235,
    tabHeight: 64,
    tabGap: 8,
    chamfer: 14,
    tabPadding: 16,
    rowOffset: 0,
    contentBackground: "#FFFFFF",
    contentPadding: 0,
    contentRadius: 0,
    fillPage: true,
    scroll: false,
    transition: true,
}

addPropertyControls(FolderTabs, {
    // — Contenu —
    tabs: {
        type: ControlType.Array,
        title: "Onglets",
        control: { type: ControlType.String, placeholder: "Nom de l'onglet" },
        defaultValue: FolderTabs.defaultProps.tabs,
        maxCount: 20,
    },
    pages: {
        type: ControlType.Array,
        title: "Pages",
        control: { type: ControlType.ComponentInstance },
        description:
            "Une page par onglet, dans le même ordre. Reliez un Frame du canvas.",
    },
    defaultTab: {
        type: ControlType.Number,
        title: "Onglet ouvert",
        defaultValue: 1,
        min: 1,
        max: 20,
        step: 1,
        displayStepper: true,
    },

    // — Typographie —
    font: {
        type: ControlType.Font,
        title: "Police",
        controls: "extended",
        defaultFontType: "monospace",
        defaultValue: { fontSize: 18, lineHeight: "1.2em" },
    },
    textColor: { type: ControlType.Color, title: "Texte" },
    activeTextColor: { type: ControlType.Color, title: "Texte actif" },

    // — Surlignage de l'onglet actif —
    highlightStyle: {
        type: ControlType.Enum,
        title: "Surlignage",
        options: ["marker", "underline", "none"],
        optionTitles: ["Fluo", "Souligné", "Aucun"],
        displaySegmentedControl: true,
    },
    highlightColor: {
        type: ControlType.Color,
        title: "Couleur surlign.",
        hidden: (p) => p.highlightStyle === "none",
    },

    // — Couleurs des onglets —
    tabColor: { type: ControlType.Color, title: "Onglet" },
    activeTabColor: { type: ControlType.Color, title: "Onglet actif" },
    hoverTabColor: { type: ControlType.Color, title: "Onglet survol" },
    borderColor: { type: ControlType.Color, title: "Contour" },
    borderWidth: {
        type: ControlType.Number,
        title: "Épaisseur",
        min: 0,
        max: 10,
        step: 1,
        unit: "px",
    },

    // — Forme des onglets —
    tabWidth: {
        type: ControlType.Number,
        title: "Largeur onglet",
        min: 0,
        max: 600,
        step: 1,
        unit: "px",
        description: "0 = les onglets se partagent toute la largeur.",
    },
    tabHeight: {
        type: ControlType.Number,
        title: "Hauteur onglet",
        min: 20,
        max: 200,
        unit: "px",
    },
    tabGap: {
        type: ControlType.Number,
        title: "Espacement",
        min: 0,
        max: 100,
        unit: "px",
    },
    chamfer: {
        type: ControlType.Number,
        title: "Biseau",
        min: 0,
        max: 60,
        unit: "px",
    },
    tabPadding: {
        type: ControlType.Number,
        title: "Marge texte",
        min: 0,
        max: 100,
        unit: "px",
    },
    rowOffset: {
        type: ControlType.Number,
        title: "Décalage gauche",
        min: 0,
        max: 400,
        unit: "px",
    },

    // — Page —
    contentBackground: { type: ControlType.Color, title: "Fond page" },
    contentPadding: {
        type: ControlType.Padding,
        title: "Marge page",
        defaultValue: "0px",
    },
    contentRadius: {
        type: ControlType.Number,
        title: "Arrondi page",
        min: 0,
        max: 60,
        unit: "px",
    },
    fillPage: {
        type: ControlType.Boolean,
        title: "Page pleine taille",
        enabledTitle: "Oui",
        disabledTitle: "Non",
    },
    scroll: {
        type: ControlType.Boolean,
        title: "Défilement",
        enabledTitle: "Oui",
        disabledTitle: "Non",
    },
    transition: {
        type: ControlType.Boolean,
        title: "Fondu",
        enabledTitle: "Oui",
        disabledTitle: "Non",
    },
})
