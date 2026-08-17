The project list item — one open at a time, also reachable with keys 1–3.

```jsx
<ProjectRow index={1} name="projekt-eins" tags="typescript · 2025" open={open === 1} onToggle={() => setOpen(1)} description="…" href="/p/eins" />
```

Names are lowercase-hyphenated, like directories. Keep descriptions to two or three lines.
