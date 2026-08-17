Bracket button for any action; labels always include the literal brackets.

```jsx
<Button variant="solid" onClick={send}>[ senden ]</Button>
<Button variant="quiet" onClick={close}>[ abbrechen ]</Button>
```

Variants: `action` (outlined pink, primary CTA), `solid` (filled, inside dialogs), `quiet` (dismiss). Hover inverts fill and text. Never round the corners, never drop the brackets.
