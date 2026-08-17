The background texture. One per page, inside a `position:relative` parent, always under a `--veil` gradient so content stays readable.

```jsx
<div style={{position:"relative"}}>
  <AsciiField />
  <div style={{position:"absolute",inset:0,background:"var(--veil)",pointerEvents:"none"}} />
  …content…
</div>
```

Respects `prefers-reduced-motion` by not animating. Never put it above content, never make it interactive.
