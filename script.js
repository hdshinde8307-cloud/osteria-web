// ---- Nav ----
function initNav(){
  const nav = document.getElementById('nav');
  if(!nav) return;
  window.addEventListener('scroll', ()=>{
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}
function toggleNav(){ document.getElementById('nav-links').classList.toggle('open'); }
function closeNav(){ document.getElementById('nav-links')?.classList.remove('open'); }

// ---- helpers ----
function slugify(s){
  return s.toLowerCase().replace(/[·&,'’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function iconRow(item){
  let tags = '';
  if(item.v) tags += ' V';
  if(item.j) tags += ' J';
  return tags;
}
function itemHtml(it){
  return `
    <div class="menu-item">
      <div class="mi-top">
        <span class="mi-name">${it.n}${(it.v || it.j) ? `<span class="mi-tags">${iconRow(it)}</span>` : ''}</span>
        <span class="mi-fill"></span>
        ${it.p ? `<span class="mi-price">₹${it.p}</span>` : ''}
      </div>
      ${it.d ? `<div class="mi-desc">${it.d}</div>` : ''}
    </div>`;
}

// ---- Build one Food/Drinks panel: pills + all category sections rendered vertically ----
function buildMenuPanel(section){
  const data = MENU[section];               // e.g. MENU.food or MENU.drinks
  const cats = Object.keys(data);
  const tabPrefix = section;                 // "food" | "drinks"

  const pillsHtml = cats.map((c,i) => {
    const slug = `${tabPrefix}-${slugify(c)}`;
    return `<a href="#${slug}" class="pill${i===0 ? ' active' : ''}" data-target="${slug}">${c}</a>`;
  }).join('');

  const sectionsHtml = cats.map(c => {
    const slug = `${tabPrefix}-${slugify(c)}`;
    const val = data[c];
    let body;
    if(Array.isArray(val) && val.length && val[0].hasOwnProperty('items')){
      // grouped with sub-headings
      body = val.map(grp => `
        <div class="sub-group">
          <h4>${grp.sub}</h4>
          <div class="item-grid">${grp.items.map(itemHtml).join('')}</div>
        </div>`).join('');
    } else {
      body = `<div class="item-grid">${val.map(itemHtml).join('')}</div>`;
    }
    return `
      <section id="${slug}" class="cat-section">
        <h3 class="cat-heading">${c}</h3>
        ${body}
      </section>`;
  }).join('');

  return { pillsHtml, sectionsHtml };
}

function renderMenuPage(){
  const panelFood = document.getElementById('panel-food');
  const panelDrinks = document.getElementById('panel-drinks');
  if(!panelFood || !panelDrinks) return;

  const f = buildMenuPanel('food');
  const d = buildMenuPanel('drinks');

  panelFood.querySelector('.pill-row').innerHTML = f.pillsHtml;
  panelFood.querySelector('.cat-sections').innerHTML = f.sectionsHtml;
  panelDrinks.querySelector('.pill-row').innerHTML = d.pillsHtml;
  panelDrinks.querySelector('.cat-sections').innerHTML = d.sectionsHtml;

  // notes
  const foodNotes = document.getElementById('food-notes');
  if(foodNotes) foodNotes.innerHTML = MENU.food_notes.map(n=>`<p>${n}</p>`).join('');
  const drinksNotes = document.getElementById('drinks-notes');
  if(drinksNotes) drinksNotes.innerHTML = MENU.drinks_notes.map(n=>`<p>${n}</p>`).join('');

  initPillScroll();
  initScrollSpy();
}

// Smooth scroll accounting for the sticky tab-toggle + pill-row height
function scrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  const stickyHeight = (document.querySelector('.tab-toggle')?.offsetHeight || 0) +
                       (document.querySelector('.menu-panel.active .pill-row')?.offsetHeight || 0);
  const top = el.getBoundingClientRect().top + window.pageYOffset - stickyHeight - 8;
  window.scrollTo({top, behavior:'smooth'});
}

function initPillScroll(){
  document.querySelectorAll('.pill-row a.pill').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const id = a.dataset.target;
      history.replaceState(null,'','#'+id);
      scrollToSection(id);
    });
  });
}

function initScrollSpy(){
  const sections = document.querySelectorAll('.menu-panel.active .cat-section');
  if(!sections.length) return;
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id = entry.target.id;
        document.querySelectorAll('.pill-row a.pill').forEach(p=>{
          p.classList.toggle('active', p.dataset.target === id);
        });
      }
    });
  }, {rootMargin:'-40% 0px -50% 0px', threshold:0});
  sections.forEach(s=>observer.observe(s));
}

function setTab(section){
  document.getElementById('tab-food')?.classList.toggle('active', section==='food');
  document.getElementById('tab-drinks')?.classList.toggle('active', section==='drinks');
  document.getElementById('panel-food')?.classList.toggle('active', section==='food');
  document.getElementById('panel-drinks')?.classList.toggle('active', section==='drinks');
  history.replaceState(null, '', '#'+section);
  window.scrollTo({top: document.getElementById('menu-body').offsetTop - 70, behavior:'smooth'});
  setTimeout(initScrollSpy, 50);
}

function initMenuPage(){
  if(!document.getElementById('panel-food')) return;
  renderMenuPage();
  const hash = location.hash.replace('#','');
  if(hash.startsWith('drinks')) setTab('drinks'); else setTab('food');
  // if a specific category was linked (e.g. #drinks-wine), jump to it after render
  if(hash.includes('-')){
    setTimeout(()=>scrollToSection(hash), 150);
  }
}

// ---- What's On (homepage): render brunch food list + era takeover items from MENU data ----
function initWhatsOn(){
  const brunchList = document.getElementById('brunch-food-list');
  if(brunchList && window.MENU?.brunch){
    brunchList.innerHTML = MENU.brunch.food_included.map(i=>`<li>${i}</li>`).join('');
  }
  const eraList = document.getElementById('era-item-list');
  if(eraList && window.MENU?.era_takeover){
    eraList.innerHTML = MENU.era_takeover.items.map(itemHtml).join('');
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  initNav();
  initMenuPage();
  initWhatsOn();
});
