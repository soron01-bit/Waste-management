/**
 * Smart Waste Exchange - Frontend API Service
 */
const API = {
  baseUrl: window.location.origin,

  async get(endpoint) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Network error occurred');
      return data;
    } catch (err) {
      console.error(`GET ${endpoint} failed:`, err);
      throw err;
    }
  },

  async post(endpoint, body, isFormData = false) {
    try {
      const options = {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? body : JSON.stringify(body)
      };
      const res = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      console.error(`POST ${endpoint} failed:`, err);
      throw err;
    }
  },

  async patch(endpoint, body) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      console.error(`PATCH ${endpoint} failed:`, err);
      throw err;
    }
  },

  async delete(endpoint) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      console.error(`DELETE ${endpoint} failed:`, err);
      throw err;
    }
  },

  // Listings API
  getListings(category = 'All', status = 'All', search = '') {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    return this.get(`/api/listings?${params.toString()}`);
  },

  createListing(formData) {
    return this.post('/api/listings', formData, true);
  },

  claimListing(id, claimantName) {
    return this.post(`/api/listings/${id}/claim`, { claimantName });
  },

  deleteListing(id) {
    return this.delete(`/api/listings/${id}`);
  },

  // Centers API
  getCenters(category = 'All', search = '') {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    return this.get(`/api/centers?${params.toString()}`);
  },

  // Pickups API
  getPickups() {
    return this.get('/api/pickups');
  },

  createPickup(pickupData) {
    return this.post('/api/pickups', pickupData);
  },

  updatePickupStatus(id, status) {
    return this.patch(`/api/pickups/${id}/status`, { status });
  },

  // Rewards API
  getRewards() {
    return this.get('/api/rewards');
  },

  redeemReward(rewardId) {
    return this.post('/api/rewards/redeem', { rewardId });
  },

  // Dashboard API
  getStats() {
    return this.get('/api/dashboard/stats');
  }
};

window.API = API;
