// ═══════════════════════════════════════════════
// KULINARIA — Client JavaScript
// ═══════════════════════════════════════════════

let searchMode = 'name';

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      searchMode = tab.dataset.mode;
      const input = document.getElementById('searchInput');
      input.placeholder = searchMode === 'name'
        ? 'Напишіть назву страви…'
        : 'Напишіть інгредієнт (напр. chicken)…';
      input.focus();
    });
  });
  // Enter key
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
});

// ─── Categories ───
async function loadCategories() {
  const grid = document.getElementById('categoriesGrid');
  try {
    const res = await fetch('/api/categories');
    const cats = await res.json();
    grid.innerHTML = cats.map(c => `
      <div class="cat-card" onclick="loadCategory('${escapeStr(c.strCategory)}')">
        <img src="${c.strCategoryThumb}" alt="${escapeStr(c.strCategory)}" loading="lazy" />
        <div class="cat-name">${escapeStr(c.strCategory)}</div>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<p style="color:var(--text-dim)">Не вдалося завантажити категорії</p>';
  }
}

// ─── Search ───
async function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q || q.length < 2) return;
  show('resultsSection');
  showLoader();
  try {
    const endpoint = searchMode === 'name'
      ? `/api/search?s=${encodeURIComponent(q)}`
      : `/api/search/ingredient?i=${encodeURIComponent(q)}`;
    const res = await fetch(endpoint);
    const meals = await res.json();
    document.getElementById('resultsTitle').textContent =
      `🔍 Результати пошуку: «${q}»`;
    renderRecipes(meals);
  } catch {
    renderRecipes([]);
  }
  hideLoader();
}

// ─── Category ───
async function loadCategory(name) {
  show('resultsSection');
  showLoader();
  try {
    const res = await fetch(`/api/category?c=${encodeURIComponent(name)}`);
    const meals = await res.json();
    document.getElementById('resultsTitle').textContent =
      `📂 ${name}`;
    renderRecipes(meals, true);
  } catch {
    renderRecipes([]);
  }
  hideLoader();
}

// ─── Random ───
async function showRandom() {
  showLoader();
  try {
    const res = await fetch('/api/random');
    if (!res.ok) throw new Error();
    const meal = await res.json();
    openRecipeDetail(meal);
  } catch {
    alert('Не вдалося отримати рецепт');
  }
  hideLoader();
}

// ─── Recipe Detail ───
async function showRecipeDetail(id) {
  showLoader();
  try {
    const res = await fetch(`/api/meal?i=${id}`);
    if (!res.ok) throw new Error();
    const meal = await res.json();
    openRecipeDetail(meal);
  } catch {
    alert('Не вдалося завантажити рецепт');
  }
  hideLoader();
}

function openRecipeDetail(meal) {
  const ingredients = [];
  const measures = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(ing.trim());
      measures.push((meas || '').trim());
    }
  }

  const html = `
    <div class="detail-hero">
      <img class="detail-img" src="${meal.strMealThumb}" alt="${escapeStr(meal.strMeal)}" />
      <div class="detail-info">
        <h1>${escapeStr(meal.strMeal)}</h1>
        <div class="detail-tags">
          ${meal.strCategory ? `<span class="tag">${escapeStr(meal.strCategory)}</span>` : ''}
          ${meal.strArea ? `<span class="tag area">${escapeStr(meal.strArea)}</span>` : ''}
          ${(meal.strTags || '').split(',').filter(Boolean).map(t =>
            `<span class="tag">${escapeStr(t.trim())}</span>`
          ).join('')}
        </div>
      </div>
    </div>
    <div class="detail-body">
      <div class="ingredients-section">
        <h2>🥬 Інгредієнти</h2>
        <table class="ingredients-table">
          ${ingredients.map((ing, i) => `
            <tr>
              <td>${escapeStr(ing)}</td>
              <td style="color:var(--text-dim)">${escapeStr(measures[i])}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      <div class="instructions-section">
        <h2>📝 Інструкція приготування</h2>
        <p>${escapeStr(meal.strInstructions)}</p>
      </div>
      ${meal.strYoutube ? `
        <a class="youtube-link" href="${meal.strYoutube}" target="_blank" rel="noopener">
          ▶ YouTube відео-рецепт
        </a>
      ` : ''}
    </div>
  `;
  document.getElementById('recipeDetail').innerHTML = html;
  document.getElementById('recipeModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('recipeModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ─── Render recipe cards ───
function renderRecipes(meals, filterMode = false) {
  const grid = document.getElementById('resultsGrid');
  const noRes = document.getElementById('noResults');

  if (!meals.length) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
    return;
  }
  noRes.classList.add('hidden');

  if (filterMode) {
    // filter.php only has idMeal, strMeal, strMealThumb
    grid.innerHTML = meals.map(m => `
      <div class="recipe-card" onclick="showRecipeDetail('${m.idMeal}')">
        <img src="${m.strMealThumb}/preview" alt="${escapeStr(m.strMeal)}" loading="lazy" />
        <div class="recipe-card-body">
          <h3>${escapeStr(m.strMeal)}</h3>
        </div>
      </div>
    `).join('');
  } else {
    grid.innerHTML = meals.map(m => `
      <div class="recipe-card" onclick="showRecipeDetail('${m.idMeal}')">
        <img src="${m.strMealThumb}/preview" alt="${escapeStr(m.strMeal)}" loading="lazy" />
        <div class="recipe-card-body">
          <h3>${escapeStr(m.strMeal)}</h3>
          <div class="recipe-card-meta">
            ${m.strCategory ? `<span>${escapeStr(m.strCategory)}</span>` : ''}
            ${m.strArea ? `<span>${escapeStr(m.strArea)}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
}

// ─── Helpers ───
function show(id) {
  document.getElementById('hero').classList.add('hidden');
  document.getElementById('categoriesSection').classList.add('hidden');
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
}

function goHome() {
  document.getElementById('hero').classList.remove('hidden');
  document.getElementById('categoriesSection').classList.remove('hidden');
  document.getElementById('resultsSection').classList.add('hidden');
  document.getElementById('recipeModal').classList.add('hidden');
  document.body.style.overflow = '';
  closeModal();
}

function showLoader() { document.getElementById('loader').classList.remove('hidden'); }
function hideLoader() { document.getElementById('loader').classList.add('hidden'); }

function escapeStr(s) {
  if (!s) return '';
  const el = document.createElement('span');
  el.textContent = s;
  return el.innerHTML;
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
