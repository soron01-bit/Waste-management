/**
 * Smart Waste Exchange - Application Controller
 */

// Application State
const state = {
  currentTab: 'marketplace',
  listings: [],
  centers: [],
  pickups: [],
  rewards: [],
  redemptions: [],
  user: null,
  map: null,
  mapMarkers: [],
  categoryChart: null,
  trendChart: null,
  selectedClaimListingId: null,
  selectedUploadFile: null
};

// Points Multiplier lookup
const POINT_RATES = {
  Plastic: 15,
  Paper: 10,
  Metal: 35,
  Electronics: 60
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Set default pickup date to tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dateInput = document.getElementById('pck-date');
  if (dateInput) {
    dateInput.value = tomorrow;
    dateInput.min = tomorrow;
  }

  // Initial Data Load
  loadDashboardStats();
  loadListings();
  loadCenters();
  loadPickups();
  loadRewards();

  // Initial Points calculation previews
  calculateUploadPointsEstimate();
  calculatePickupPointsEstimate();
});

/* ==========================================================================
   Tab Navigation
   ========================================================================== */
function switchTab(tabId) {
  state.currentTab = tabId;

  // Update desktop nav buttons
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.remove('text-emerald-700', 'bg-emerald-50', 'font-semibold');
    btn.classList.add('hover:text-slate-900', 'hover:bg-slate-100');
  });
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) {
    activeNav.classList.add('text-emerald-700', 'bg-emerald-50', 'font-semibold');
    activeNav.classList.remove('hover:text-slate-900', 'hover:bg-slate-100');
  }

  // Update mobile nav pills
  document.querySelectorAll('.mobile-nav-tab').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('bg-emerald-100', 'text-emerald-800');
      btn.classList.remove('bg-slate-100', 'text-slate-700');
    } else {
      btn.classList.remove('bg-emerald-100', 'text-emerald-800');
      btn.classList.add('bg-slate-100', 'text-slate-700');
    }
  });

  // Toggle tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.add('hidden');
  });
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) {
    targetPane.classList.remove('hidden');
  }

  // Special hooks when entering specific tabs
  if (tabId === 'centers') {
    setTimeout(() => {
      initOrInvalidateMap();
    }, 200);
  } else if (tabId === 'dashboard') {
    loadDashboardStats();
  }

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterMarketplaceFromCategory(category) {
  switchTab('marketplace');
  setMarketplaceCategory(category);
}

/* ==========================================================================
   Tab 1: Recyclable Material Marketplace
   ========================================================================== */
async function loadListings() {
  try {
    const category = document.getElementById('marketplace-category')?.value || 'All';
    const status = document.getElementById('marketplace-status')?.value || 'All';
    const search = document.getElementById('marketplace-search')?.value || '';

    const res = await API.getListings(category, status, search);
    state.listings = res.data || [];
    renderListings();
  } catch (err) {
    console.error('Failed to load listings:', err);
    showToast('Failed to load recyclable materials', 'error');
  }
}

function handleMarketplaceFilter() {
  loadListings();
}

function setMarketplaceCategory(category) {
  const select = document.getElementById('marketplace-category');
  if (select) select.value = category;

  document.querySelectorAll('.cat-pill').forEach(pill => {
    if (pill.textContent.includes(category) || (category === 'All' && pill.textContent.includes('All'))) {
      pill.className = 'cat-pill active px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white transition-all';
    } else {
      pill.className = 'cat-pill px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all';
    }
  });

  loadListings();
}

function renderListings() {
  const grid = document.getElementById('listings-grid');
  const empty = document.getElementById('listings-empty-state');
  const badge = document.getElementById('listings-count-badge');

  if (badge) badge.textContent = `${state.listings.length} item${state.listings.length === 1 ? '' : 's'}`;

  if (!state.listings || state.listings.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = state.listings.map(item => {
    const catBadges = {
      Plastic: 'badge-plastic',
      Paper: 'badge-paper',
      Metal: 'badge-metal',
      Electronics: 'badge-electronics'
    };
    const badgeClass = catBadges[item.category] || 'bg-slate-100 text-slate-800';

    const statusBadges = {
      Available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Claimed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Scheduled For Pickup': 'bg-amber-100 text-amber-800 border-amber-200'
    };
    const statusClass = statusBadges[item.status] || 'bg-slate-100 text-slate-800';

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
        <div>
          <!-- Thumbnail with Category & Status Overlay -->
          <div class="relative h-48 w-full overflow-hidden bg-slate-100">
            <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80'">
            <div class="absolute top-3 left-3 flex gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}">
                ${item.category}
              </span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass}">
                ${item.status}
              </span>
            </div>
            <div class="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur text-amber-300 font-bold text-xs px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center space-x-1 shadow">
              <span>🪙 +${item.estimatedPoints} pts</span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 space-y-3">
            <div>
              <h3 class="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors" title="${item.title}">
                ${item.title}
              </h3>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                ${item.description || 'Clean, sorted recyclable material ready for reuse, pickup, or drop-off.'}
              </p>
            </div>

            <!-- Material Details Spec List -->
            <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Weight / Vol</span>
                <span class="font-bold text-slate-800">${item.weightKg} kg</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Condition</span>
                <span class="font-semibold text-slate-700">${item.condition || 'Clean'}</span>
              </div>
              <div class="col-span-2 flex items-center space-x-1 text-slate-500 pt-1 border-t border-slate-200/50">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
                <span class="truncate text-[11px]">${item.location}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-5 pb-5 pt-0 flex items-center gap-2">
          ${item.status === 'Available' ? `
            <button onclick="openClaimModal('${item.id}', '${item.title.replace(/'/g, "\\'")}')" class="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center space-x-1">
              <i data-lucide="handshake" class="w-3.5 h-3.5"></i>
              <span>Claim Material</span>
            </button>
            <button onclick="preparePickupForListing('${item.id}', '${item.category}', ${item.weightKg}, '${item.title.replace(/'/g, "\\'")}')" class="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition flex items-center space-x-1" title="Schedule doorstep pickup">
              <i data-lucide="truck" class="w-3.5 h-3.5"></i>
              <span>Pickup</span>
            </button>
          ` : `
            <div class="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-500 font-medium text-xs text-center">
              ${item.claimedBy ? `Reserved by ${item.claimedBy}` : 'Collection in Progress'}
            </div>
          `}
          <button onclick="deleteListing('${item.id}')" class="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition" title="Delete listing">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function preparePickupForListing(id, category, weight, title) {
  switchTab('pickups');
  const catSelect = document.getElementById('pck-category');
  const weightInput = document.getElementById('pck-weight');
  const summaryInput = document.getElementById('pck-summary');

  if (catSelect) catSelect.value = category;
  if (weightInput) weightInput.value = weight;
  if (summaryInput) summaryInput.value = `${title} (${weight} kg)`;

  calculatePickupPointsEstimate();
  showToast(`Pre-filled pickup form with "${title}"`, 'info');
}

async function deleteListing(id) {
  if (!confirm('Are you sure you want to remove this recyclable material listing?')) return;
  try {
    await API.deleteListing(id);
    showToast('Listing removed successfully', 'success');
    loadListings();
  } catch (err) {
    showToast('Failed to delete listing', 'error');
  }
}

/* ==========================================================================
   Upload Recyclable Material Modal
   ========================================================================== */
function openUploadModal() {
  document.getElementById('modal-upload').classList.remove('hidden');
  calculateUploadPointsEstimate();
  lucide.createIcons();
}

function closeUploadModal() {
  document.getElementById('modal-upload').classList.add('hidden');
  document.getElementById('upload-material-form').reset();
  clearSelectedImage();
}

function calculateUploadPointsEstimate() {
  const cat = document.getElementById('up-category')?.value || 'Plastic';
  const weight = parseFloat(document.getElementById('up-weight')?.value) || 1;
  const rate = POINT_RATES[cat] || 15;
  const points = Math.round(weight * rate);
  const display = document.getElementById('up-est-points-display');
  if (display) display.textContent = `+${points} Points`;
}

function handleImageFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  state.selectedUploadFile = file;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const preview = document.getElementById('image-upload-preview');
    const prompt = document.getElementById('image-upload-prompt');
    const img = document.getElementById('preview-img-tag');

    img.src = evt.target.result;
    preview.classList.remove('hidden');
    prompt.classList.add('hidden');
    lucide.createIcons();
  };
  reader.readAsDataURL(file);
}

function clearSelectedImage(e) {
  if (e) e.stopPropagation();
  state.selectedUploadFile = null;
  const fileInput = document.getElementById('up-image-file');
  if (fileInput) fileInput.value = '';
  document.getElementById('image-upload-preview')?.classList.add('hidden');
  document.getElementById('image-upload-prompt')?.classList.remove('hidden');
}

async function handleUploadMaterial(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-upload');
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-spin mr-1">⌛</span> Publishing...`;

  try {
    const formData = new FormData();
    formData.append('title', document.getElementById('up-title').value);
    formData.append('category', document.getElementById('up-category').value);
    formData.append('weightKg', document.getElementById('up-weight').value);
    formData.append('quantityDesc', document.getElementById('up-quantity-desc').value);
    formData.append('condition', document.getElementById('up-condition').value);
    formData.append('location', document.getElementById('up-location').value);
    formData.append('description', document.getElementById('up-description').value);

    if (state.selectedUploadFile) {
      formData.append('image', state.selectedUploadFile);
    }

    await API.createListing(formData);
    showToast('Recyclable material published to the exchange!', 'success');
    closeUploadModal();
    loadListings();
    loadDashboardStats();
  } catch (err) {
    console.error('Error uploading:', err);
    showToast(err.message || 'Failed to publish material', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>Publish Material Listing</span>`;
    lucide.createIcons();
  }
}

/* ==========================================================================
   Claim Material Modal
   ========================================================================== */
function openClaimModal(id, title) {
  state.selectedClaimListingId = id;
  document.getElementById('claim-material-title').textContent = title;
  document.getElementById('modal-claim').classList.remove('hidden');
  lucide.createIcons();
}

function closeClaimModal() {
  document.getElementById('modal-claim').classList.add('hidden');
  state.selectedClaimListingId = null;
}

async function confirmClaimMaterial() {
  if (!state.selectedClaimListingId) return;
  const name = document.getElementById('claim-name').value || 'Community Upcycler';

  try {
    await API.claimListing(state.selectedClaimListingId, name);
    showToast(`Successfully claimed! Reserved for ${name}`, 'success');
    closeClaimModal();
    loadListings();
    loadDashboardStats();
  } catch (err) {
    showToast('Failed to claim material', 'error');
  }
}

/* ==========================================================================
   Tab 3: Collection Centers & Interactive Map
   ========================================================================== */
async function loadCenters() {
  try {
    const category = document.getElementById('centers-category')?.value || 'All';
    const search = document.getElementById('centers-search')?.value || '';
    const res = await API.getCenters(category, search);
    state.centers = res.data || [];
    renderCentersList();
    updateMapMarkers();
  } catch (err) {
    console.error('Failed to load centers:', err);
  }
}

function handleCentersFilter() {
  loadCenters();
}

function renderCentersList() {
  const container = document.getElementById('centers-list-container');
  if (!container) return;

  if (state.centers.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <p class="text-sm text-slate-500">No collection centers found matching your query.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.centers.map((c, idx) => `
    <div class="glass-card p-4 rounded-2xl border border-slate-200 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2.5" onclick="focusCenterOnMap(${c.lat}, ${c.lng}, '${c.name.replace(/'/g, "\\'")}')">
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center space-x-1.5">
            <h4 class="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors">${c.name}</h4>
            ${c.verified ? '<span class="text-emerald-600 text-xs" title="Certified Facility">✓</span>' : ''}
          </div>
          <p class="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
            <i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i>
            <span>${c.address}</span>
          </p>
        </div>
        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap">
          ${c.distanceKm}
        </span>
      </div>

      <div class="flex flex-wrap gap-1">
        ${c.categories.map(cat => `
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
            ${cat}
          </span>
        `).join('')}
      </div>

      <div class="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
        <span class="flex items-center space-x-1">
          <i data-lucide="clock" class="w-3 h-3 text-slate-400"></i>
          <span>${c.hours}</span>
        </span>
        <button onclick="event.stopPropagation(); preparePickupWithCenter('${c.name.replace(/'/g, "\\'")}')" class="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1">
          <span>Book Pickup Here</span>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function initOrInvalidateMap() {
  const mapElement = document.getElementById('centersMap');
  if (!mapElement) return;

  if (!state.map) {
    // Center around NYC default
    state.map = L.map('centersMap').setView([40.730610, -73.935242], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(state.map);
  } else {
    state.map.invalidateSize();
  }

  updateMapMarkers();
}

function updateMapMarkers() {
  if (!state.map) return;

  // Clear existing markers
  state.mapMarkers.forEach(m => state.map.removeLayer(m));
  state.mapMarkers = [];

  state.centers.forEach(c => {
    const marker = L.marker([c.lat, c.lng]).addTo(state.map);
    
    const popupContent = `
      <div style="font-size: 12px; max-width: 200px;">
        <strong style="color: #064e3b; font-size: 13px;">${c.name}</strong>
        <p style="margin: 4px 0; color: #475569;">${c.address}</p>
        <p style="margin: 2px 0; color: #059669; font-weight: bold;">Hours: ${c.hours}</p>
        <p style="margin: 4px 0 0; color: #64748b;">Accepts: ${c.categories.join(', ')}</p>
      </div>
    `;
    marker.bindPopup(popupContent);
    state.mapMarkers.push(marker);
  });
}

function focusCenterOnMap(lat, lng, name) {
  if (!state.map) return;
  state.map.setView([lat, lng], 14, { animate: true });
  
  // Find marker and open popup
  state.mapMarkers.forEach(m => {
    const pos = m.getLatLng();
    if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
      m.openPopup();
    }
  });
}

function preparePickupWithCenter(centerName) {
  switchTab('pickups');
  const centerSelect = document.getElementById('pck-center');
  if (centerSelect) {
    centerSelect.value = centerName;
  }
  showToast(`Selected ${centerName} for collection.`, 'info');
}

/* ==========================================================================
   Tab 4: Schedule Pickups
   ========================================================================== */
async function loadPickups() {
  try {
    const res = await API.getPickups();
    state.pickups = res.data || [];
    renderPickupsList();
  } catch (err) {
    console.error('Failed to load pickups:', err);
  }
}

function calculatePickupPointsEstimate() {
  const cat = document.getElementById('pck-category')?.value || 'Plastic';
  const weight = parseFloat(document.getElementById('pck-weight')?.value) || 1;
  const rate = POINT_RATES[cat] || 15;
  const points = Math.round(weight * rate);
  const display = document.getElementById('pck-est-points-display');
  if (display) display.textContent = `+${points} Points`;
}

async function handleSchedulePickup(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-pickup');
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-spin mr-1">⌛</span> Scheduling...`;

  try {
    const pickupData = {
      materialSummary: document.getElementById('pck-summary').value,
      category: document.getElementById('pck-category').value,
      weightEstKg: parseFloat(document.getElementById('pck-weight').value),
      pickupDate: document.getElementById('pck-date').value,
      timeSlot: document.getElementById('pck-slot').value,
      centerAssigned: document.getElementById('pck-center').value,
      pickupAddress: document.getElementById('pck-address').value,
      contactName: document.getElementById('pck-contact-name').value,
      contactPhone: document.getElementById('pck-contact-phone').value,
      notes: document.getElementById('pck-notes').value
    };

    await API.createPickup(pickupData);
    showToast('Pickup successfully scheduled! Eco-driver assigned.', 'success');
    
    // Clear notes and reset summary
    document.getElementById('pck-summary').value = '';
    document.getElementById('pck-notes').value = '';

    loadPickups();
    loadDashboardStats();
  } catch (err) {
    showToast(err.message || 'Failed to schedule pickup', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>Confirm & Schedule Pickup</span>`;
    lucide.createIcons();
  }
}

function renderPickupsList() {
  const container = document.getElementById('pickups-list-container');
  if (!container) return;

  if (state.pickups.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <p class="text-sm text-slate-500">No pickups scheduled yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.pickups.map(p => {
    const isCompleted = p.status === 'Completed';
    const statusColors = {
      Scheduled: 'bg-amber-100 text-amber-800 border-amber-200',
      'Driver En Route': 'bg-blue-100 text-blue-800 border-blue-200',
      Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    const badge = statusColors[p.status] || 'bg-slate-100 text-slate-700';

    return `
      <div class="glass-card p-4 rounded-2xl border border-slate-200 space-y-3">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge}">
                ${p.status}
              </span>
              <span class="text-xs font-bold text-slate-900">${p.category}</span>
            </div>
            <h4 class="font-bold text-slate-900 text-sm mt-1">${p.materialSummary}</h4>
          </div>
          <span class="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/50">
            ${isCompleted ? '✓ +' : 'Pending: +'}${p.pointsAwarded} pts
          </span>
        </div>

        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
          <div class="flex justify-between">
            <span class="text-slate-400">Date & Slot:</span>
            <span class="font-medium text-slate-800">${p.pickupDate} • ${p.timeSlot}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Location:</span>
            <span class="font-medium text-slate-800 truncate max-w-[200px]">${p.pickupAddress}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Assigned Hub:</span>
            <span class="font-medium text-emerald-700 truncate max-w-[200px]">${p.centerAssigned}</span>
          </div>
        </div>

        ${!isCompleted ? `
          <div class="flex justify-end space-x-2 pt-1">
            <button onclick="updatePickupStatus('${p.id}', 'Completed')" class="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-1 shadow-sm">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
              <span>Simulate Verified & Credit Points</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

async function updatePickupStatus(id, newStatus) {
  try {
    const res = await API.updatePickupStatus(id, newStatus);
    showToast(res.message, 'success');
    loadPickups();
    loadDashboardStats();
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}

/* ==========================================================================
   Tab 5: Rewards & Redemption Store
   ========================================================================== */
async function loadRewards() {
  try {
    const res = await API.getRewards();
    state.rewards = res.rewards || [];
    state.redemptions = res.redemptions || [];
    
    // Update wallet values
    if (res.user) {
      updateUserWalletDisplays(res.user);
    }

    renderRewardsCatalog();
    renderRedemptions();
  } catch (err) {
    console.error('Failed to load rewards:', err);
  }
}

function updateUserWalletDisplays(user) {
  state.user = user;
  
  // Header badges
  const pBadge = document.getElementById('user-points-badge');
  const rBadge = document.getElementById('user-rank-badge');
  if (pBadge) pBadge.textContent = user.pointsBalance;
  if (rBadge) rBadge.textContent = user.rank;

  // Hero displays
  const heroPts = document.getElementById('hero-points-balance');
  if (heroPts) heroPts.textContent = `${user.pointsBalance} pts`;

  // Rewards tab displays
  const rewBalance = document.getElementById('rewards-balance-display');
  const rewLifetime = document.getElementById('rewards-lifetime-display');
  const rewRank = document.getElementById('rewards-rank-text');
  const rewProgress = document.getElementById('rewards-tier-progress');

  if (rewBalance) rewBalance.textContent = user.pointsBalance;
  if (rewLifetime) rewLifetime.textContent = `${user.lifetimePoints} pts`;
  if (rewRank) rewRank.textContent = user.rank;
  
  if (rewProgress) {
    const pct = Math.min(100, Math.round((user.lifetimePoints / 2000) * 100));
    rewProgress.style.width = `${pct}%`;
  }
}

function renderRewardsCatalog() {
  const grid = document.getElementById('rewards-catalog-grid');
  if (!grid) return;

  const currentPoints = state.user?.pointsBalance || 0;

  grid.innerHTML = state.rewards.map(r => {
    const canAfford = currentPoints >= r.pointsCost && r.availableStock > 0;

    return `
      <div class="glass-card p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              ${r.category}
            </span>
            <span class="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              🪙 ${r.pointsCost} Points
            </span>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 text-base">${r.title}</h4>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">${r.description}</p>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span class="text-[11px] text-slate-400 font-medium">Stock: ${r.availableStock} available</span>
          <button onclick="redeemReward('${r.id}')" ${!canAfford ? 'disabled' : ''} class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${canAfford ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}">
            <span>${canAfford ? 'Redeem Voucher' : (r.availableStock === 0 ? 'Out of Stock' : 'Need More Points')}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function renderRedemptions() {
  const container = document.getElementById('redemptions-container');
  if (!container) return;

  if (state.redemptions.length === 0) {
    container.innerHTML = `
      <p class="text-xs text-slate-400 text-center py-4">No vouchers redeemed yet. Earn points by scheduling pickups!</p>
    `;
    return;
  }

  container.innerHTML = state.redemptions.map(r => `
    <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
      <div>
        <div class="font-bold text-slate-900">${r.rewardTitle}</div>
        <div class="text-[11px] text-slate-400">Redeemed on ${r.redeemedAt.split('T')[0]} • Spent ${r.pointsSpent} pts</div>
      </div>
      <div class="text-right">
        <span class="font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 select-all">
          ${r.voucherCode}
        </span>
      </div>
    </div>
  `).join('');
}

async function redeemReward(rewardId) {
  try {
    const res = await API.redeemReward(rewardId);
    showToast('Reward redeemed successfully!', 'success');
    
    // Show voucher popup modal
    const voucher = res.data.voucher;
    document.getElementById('voucher-modal-subtitle').textContent = `You redeemed: ${voucher.rewardTitle}`;
    document.getElementById('voucher-modal-code').textContent = voucher.voucherCode;
    document.getElementById('modal-voucher').classList.remove('hidden');

    // Refresh wallet
    loadRewards();
    loadDashboardStats();
  } catch (err) {
    showToast(err.message || 'Redemption failed', 'error');
  }
}

function copyVoucherCode() {
  const code = document.getElementById('voucher-modal-code').textContent;
  navigator.clipboard.writeText(code);
  const ind = document.getElementById('copy-text-indicator');
  ind.textContent = 'Copied to clipboard!';
  setTimeout(() => {
    ind.textContent = 'Copy Voucher Code';
  }, 2000);
}

function closeVoucherModal() {
  document.getElementById('modal-voucher').classList.add('hidden');
}

/* ==========================================================================
   Tab 6: Recycling History Dashboard & Charts
   ========================================================================== */
async function loadDashboardStats() {
  try {
    const res = await API.getStats();
    const stats = res.stats;
    if (!stats) return;

    // Update user wallet displays
    if (stats.user) {
      updateUserWalletDisplays(stats.user);
    }

    // Hero metrics
    document.getElementById('hero-total-kg').textContent = `${stats.totalWeightRecycled} kg`;
    document.getElementById('hero-co2-saved').textContent = `${stats.co2SavedKg} kg`;

    // Dashboard metric cards
    document.getElementById('dash-total-weight').textContent = `${stats.totalWeightRecycled} kg`;
    document.getElementById('dash-co2-saved').textContent = `${stats.co2SavedKg} kg`;
    document.getElementById('dash-trees-saved').textContent = `${stats.treesSaved}`;
    document.getElementById('dash-lifetime-points').textContent = `${stats.user?.lifetimePoints || 0}`;

    // Render Charts
    renderCategoryDoughnutChart(stats.categoryBreakdown);
    renderTrendBarChart(stats.monthlyTrends);

    // Render Activity stream table
    renderActivityTable(stats.recentActivities);
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

function renderCategoryDoughnutChart(breakdown) {
  const ctx = document.getElementById('categoryChart')?.getContext('2d');
  if (!ctx) return;

  const dataValues = [
    breakdown.Plastic || 0,
    breakdown.Paper || 0,
    breakdown.Metal || 0,
    breakdown.Electronics || 0
  ];

  if (state.categoryChart) {
    state.categoryChart.destroy();
  }

  state.categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Plastic', 'Paper', 'Metal', 'Electronics'],
      datasets: [{
        data: dataValues,
        backgroundColor: [
          '#3b82f6', // Blue for Plastic
          '#f59e0b', // Amber for Paper
          '#64748b', // Slate for Metal
          '#8b5cf6'  // Purple for Electronics
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        }
      },
      cutout: '70%'
    }
  });

  // Render bottom legend stats
  const legendStats = document.getElementById('category-legend-stats');
  if (legendStats) {
    legendStats.innerHTML = `
      <div class="p-2 rounded-lg bg-blue-50 text-blue-800">
        <span class="block text-[10px] font-bold uppercase">Plastic</span>
        <span class="font-extrabold text-sm">${breakdown.Plastic} kg</span>
      </div>
      <div class="p-2 rounded-lg bg-amber-50 text-amber-800">
        <span class="block text-[10px] font-bold uppercase">Paper</span>
        <span class="font-extrabold text-sm">${breakdown.Paper} kg</span>
      </div>
      <div class="p-2 rounded-lg bg-slate-100 text-slate-800">
        <span class="block text-[10px] font-bold uppercase">Metal</span>
        <span class="font-extrabold text-sm">${breakdown.Metal} kg</span>
      </div>
      <div class="p-2 rounded-lg bg-purple-50 text-purple-800">
        <span class="block text-[10px] font-bold uppercase">Electronics</span>
        <span class="font-extrabold text-sm">${breakdown.Electronics} kg</span>
      </div>
    `;
  }
}

function renderTrendBarChart(monthlyTrends) {
  const ctx = document.getElementById('trendChart')?.getContext('2d');
  if (!ctx || !monthlyTrends) return;

  if (state.trendChart) {
    state.trendChart.destroy();
  }

  state.trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthlyTrends.labels,
      datasets: [{
        label: 'Waste Diverted (kg)',
        data: monthlyTrends.wasteKg,
        backgroundColor: '#10b981',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
        }
      }
    }
  });
}

function renderActivityTable(activities) {
  const tbody = document.getElementById('activity-table-body');
  if (!tbody) return;

  if (!activities || activities.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">No recent activity recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = activities.map(item => `
    <tr class="hover:bg-slate-50/80 transition-colors">
      <td class="py-3 px-4 font-medium text-slate-900">${item.title}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
          ${item.category}
        </span>
      </td>
      <td class="py-3 px-4 text-xs text-slate-500">${item.date}</td>
      <td class="py-3 px-4 font-bold ${item.points.startsWith('+') ? 'text-emerald-600' : (item.points.startsWith('-') ? 'text-rose-600' : 'text-slate-600')}">
        ${item.points}
      </td>
      <td class="py-3 px-4">
        <span class="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          ${item.status}
        </span>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    error: 'bg-rose-900 text-rose-100 border-rose-700',
    info: 'bg-slate-900 text-slate-100 border-slate-700'
  };

  toast.className = `px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center space-x-2 pointer-events-auto toast-enter ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ')}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
