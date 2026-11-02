// Copy-to-clipboard (SPEC D9b), shared by CommandBlock and blog code blocks: progressive
// enhancement, one handler per button. A button names its source with data-copy-target and starts
// `hidden`, so without JS (or without the Clipboard API) there is no dead control.
for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-copy-target]')) {
  const target = document.getElementById(btn.dataset.copyTarget ?? '');
  const status = btn.nextElementSibling;
  if (!target || !navigator.clipboard) continue;
  btn.hidden = false;
  let timer = 0;
  btn.addEventListener('click', async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText((target.textContent ?? '').replace(/\n$/, ''));
    } catch {
      ok = false;
    }
    btn.textContent = ok ? 'copied' : 'failed';
    if (status) status.textContent = ok ? 'Copied' : 'Copy failed';
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      btn.textContent = 'copy';
      if (status) status.textContent = '';
    }, 2000);
  });
}
