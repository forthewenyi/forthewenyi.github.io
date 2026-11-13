(() => {
  const stage = document.querySelector('.pi-stage');
  const title = document.getElementById('pi-stage-title');
  const intro = document.getElementById('pi-stage-intro');
  const count = document.getElementById('pi-count');
  const gallery = document.getElementById('pi-gallery');
  const comparison = document.getElementById('pi-comparison');
  const cards = Array.from(gallery.querySelectorAll('.pi-model'));
  const stepButtons = document.querySelectorAll('[data-pi-step]');
  const nextButtons = document.querySelectorAll('[data-pi-next]');
  const example = document.querySelector('[data-pi-example]');
  let step = 0;

  function selected() {
    return cards.filter(card => card.querySelector('input').checked);
  }

  function modelName(card) {
    return card.querySelector('.pi-model-source').textContent;
  }

  function element(tag, text, name) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (name) el.className = name;
    return el;
  }

  function showComparison(pair) {
    const heads = element('div', '', 'pi-compare');
    for (const card of pair) {
      const head = element('div', '', 'pi-compare-head');
      const well = element('div', '', 'pi-well');
      const photo = card.querySelector('img').cloneNode();
      photo.classList.add('pi-compare-photo');
      well.append(photo);
      head.append(well, element('h4', modelName(card)));
      heads.append(head);
    }

    const table = element('table', '', 'pi-table');
    const gaggiaBambino = pair.some(card => card.dataset.model === 'gaggia-classic-pro-e24') &&
      pair.some(card => card.dataset.model === 'breville-bambino-plus');
    table.createCaption().textContent = gaggiaBambino
      ? 'For a morning latte, the Gaggia gives you manual control over milk texture. The Bambino Plus automates that step for $50.95 more at the saved prices.'
      : 'For a morning latte, compare how each machine heats water and textures milk.';
    const thead = table.createTHead().insertRow();
    for (const [index, card] of pair.entries()) {
      const header = element('th', modelName(card), 'pi-sr');
      header.id = 'pi-machine-' + index;
      header.scope = 'col';
      thead.append(header);
    }
    const body = table.createTBody();
    const fields = [
      ['Saved price', card => card.querySelector('.pi-price').textContent],
      ['Milk workflow', card => card.dataset.milk],
      ['Heating', card => card.dataset.heat],
      ['Portafilter', card => card.dataset.basket],
      ['Patina Index', card => card.querySelector('.pi-score').textContent],
      ['Source', card => {
        const source = card.querySelector('.pi-model-source').cloneNode();
        source.className = 'pi-source';
        source.textContent = 'Manufacturer reference ↗';
        return source;
      }],
    ];
    for (const [index, [label, value]] of fields.entries()) {
      const labelRow = body.insertRow();
      labelRow.className = 'pi-row-label';
      const field = element('th', label);
      field.colSpan = 2;
      field.id = 'pi-field-' + index;
      labelRow.append(field);
      const values = body.insertRow();
      for (const [column, card] of pair.entries()) {
        const td = values.insertCell();
        td.headers = 'pi-machine-' + column + ' ' + field.id;
        td.append(value(card));
      }
    }
    comparison.replaceChildren(heads, table);
  }

  function update() {
    const pair = selected();
    const ready = pair.length === 2;
    const choosing = step === 1;
    const comparing = step === 2;
    stage.dataset.step = String(step);
    title.textContent = ['Espresso machines', 'Select two machines', 'Compare your machines'][step];
    intro.textContent = [
      'Browse nine machines in three tiers. Their names link to the manufacturer references.',
      'Select any two photos, or try the Gaggia Classic Pro E24 and Breville Bambino Plus.',
      'Read the same details side by side for your two choices.',
    ][step];
    gallery.hidden = comparing;
    comparison.hidden = !comparing;
    example.hidden = !choosing;
    count.hidden = !choosing;
    count.textContent = pair.length + ' of 2 selected' + (pair.length ? ' · ' + pair.map(modelName).join(' and ') : '');
    for (const card of cards) {
      const input = card.querySelector('input');
      input.hidden = !choosing;
      input.disabled = !choosing || (ready && !input.checked);
    }
    for (const button of stepButtons) {
      const index = Number(button.dataset.piStep);
      if (step === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.disabled = index === 2 && !ready;
    }
    for (const button of nextButtons) {
      button.textContent = ['Choose two machines →', 'Compare selected →', 'Change selections'][step];
      button.disabled = choosing && !ready;
      button.hidden = comparing && button.classList.contains('pi-bottom');
    }
    if (comparing) showComparison(pair);
  }

  function go(next) {
    if (next === 2 && selected().length !== 2) return;
    step = next;
    update();
    title.focus({ preventScroll: true });
    const top = stage.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * .6) stage.scrollIntoView({ block: 'start' });
  }

  for (const button of stepButtons) {
    button.addEventListener('click', () => go(Number(button.dataset.piStep)));
  }
  for (const button of nextButtons) {
    button.addEventListener('click', () => go(step === 2 ? 1 : step + 1));
  }
  gallery.addEventListener('change', update);
  example.addEventListener('click', () => {
    for (const card of cards) {
      card.querySelector('input').checked = ['gaggia-classic-pro-e24', 'breville-bambino-plus'].includes(card.dataset.model);
    }
    update();
    nextButtons[0].focus();
  });
  update();
})();
