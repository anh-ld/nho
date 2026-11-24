/* shared by every component through Nho.style */
export default `
  :host {
    display: block;
    --bg: #fafaf9;
    --surface: #ffffff;
    --ink: #1c1917;
    --muted: #78716c;
    --line: #e7e5e4;
    --soft: #f5f5f4;
    --radius: 12px;
    color: var(--ink);
    font-size: 15px;
    line-height: 1.5;
  }

  h1, h2, p, ul { margin: 0; padding: 0; }
  ul { list-style: none; }

  h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
  h2 { font-size: 17px; font-weight: 600; letter-spacing: -0.01em; }

  .muted { color: var(--muted); font-size: 13px; }

  button {
    font: inherit;
    color: inherit;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    cursor: pointer;
    transition: background-color 120ms, border-color 120ms, color 120ms;
  }

  button:hover:not(:disabled) { border-color: var(--muted); }
  button:disabled { opacity: 0.35; cursor: default; }
  :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

  .page { max-width: 768px; margin: 0 auto; padding: 48px 24px 64px; }

  .header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 32px; }

  .cart-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 18px;
    background: var(--ink);
    border-color: var(--ink);
    color: #fff;
    font-size: 14px;
    font-weight: 500;
  }

  .cart-button:hover:not(:disabled) { background: #44403c; border-color: #44403c; }

  .badge {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background: #fff;
    color: var(--ink);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .footnote { margin-top: 32px; text-align: center; line-height: 1.6; }
  .footnote a { color: var(--ink); text-underline-offset: 3px; }

  .search {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 16px;
    padding: 12px 16px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
    font: inherit;
    color: inherit;
  }

  .search:focus { outline: none; border-color: var(--muted); }

  .list { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); overflow: hidden; }
  .list li + li { border-top: 1px solid var(--line); }

  .row, .line { display: flex; align-items: center; gap: 16px; }
  .row { padding: 14px 16px; }

  .swatch { width: 36px; height: 36px; border-radius: 10px; flex: none; }

  .name { flex: 1; font-weight: 500; }

  .price { color: var(--muted); font-variant-numeric: tabular-nums; }

  .add { min-width: 96px; padding: 6px 14px; font-size: 13px; font-weight: 500; }
  .add.added { background: var(--soft); border-color: var(--soft); }

  .empty { padding: 32px 0; text-align: center; }

  .backdrop { position: fixed; inset: 0; z-index: 2; background: rgba(28, 25, 23, 0.25); }

  .drawer {
    position: fixed;
    z-index: 3;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(400px, 100vw);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: 24px;
    background: var(--surface);
    box-shadow: -8px 0 32px rgba(28, 25, 23, 0.08);
  }

  .drawer-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

  .close { width: 32px; height: 32px; padding: 0; font-size: 18px; line-height: 1; }

  .message { margin-bottom: 16px; padding: 12px 16px; border-radius: var(--radius); background: var(--soft); font-size: 14px; }

  .lines { flex: 1; overflow: auto; }
  .line { padding: 12px 0; }
  .line + .line { border-top: 1px solid var(--line); }
  .line .swatch { width: 28px; height: 28px; border-radius: 8px; }

  .stepper { display: inline-flex; align-items: center; gap: 8px; font-variant-numeric: tabular-nums; }
  .stepper button { width: 26px; height: 26px; padding: 0; line-height: 1; }

  .line-total { min-width: 64px; text-align: right; }

  .drawer-foot { padding-top: 16px; border-top: 1px solid var(--line); }

  .total { display: flex; justify-content: space-between; margin-bottom: 16px; font-weight: 600; }

  .checkout { width: 100%; padding: 12px; background: var(--ink); border-color: var(--ink); color: #fff; font-weight: 500; }
  .checkout:hover:not(:disabled) { background: #44403c; }
`;
