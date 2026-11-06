import { createContext, useContext } from 'react'

/* Shared editing layer for decks. Slides wrap their editable text in <T p="...">
   default text</T>. In view mode T shows the saved override (or the default);
   in edit mode it becomes an inline editable field that saves on blur.
   Text supports **bold** and newlines. */

export const DeckContentCtx = createContext({ overrides: {}, editing: false, setField: () => {} })
export const useDeckContent = () => useContext(DeckContentCtx)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function renderRich(text, boldColor) {
  if (text == null) return null
  return String(text).split('\n').flatMap((line, li) => {
    const segs = line.split('**').map((seg, si) =>
      si % 2 === 1
        ? <b key={`${li}-${si}`} style={boldColor ? { color: boldColor } : undefined}>{seg}</b>
        : <span key={`${li}-${si}`}>{seg}</span>
    )
    return li > 0 ? [<br key={`br${li}`} />, ...segs] : segs
  })
}

export function T({ p, b, children }) {
  const { overrides, editing, setField } = useDeckContent()
  const fallback = typeof children === 'string' ? children : ''
  const raw = overrides && overrides[p] != null ? overrides[p] : fallback

  if (editing) {
    return (
      <span
        className="deck-ed"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        data-path={p}
        title={`Editing: ${p}`}
        onBlur={(e) => setField(p, e.currentTarget.innerText)}
        dangerouslySetInnerHTML={{ __html: esc(raw).replace(/\n/g, '<br>') }}
      />
    )
  }
  return <>{renderRich(raw, b)}</>
}
