// API client helpers
export const apiRequest = async <T = any>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

// Stories API
export const fetchStories = () => apiRequest('/api/stories');
export const fetchStory = (id: string) => apiRequest(`/api/stories/${id}`);

// Items API
export const fetchItems = () => apiRequest('/api/items');
export const fetchItem = (sku: string) => apiRequest(`/api/items/${sku}`);

// Profile API
export const fetchProfile = (userId: string) => apiRequest(`/api/profile/${userId}`);
export const updateProfile = (profile: any) => 
  apiRequest('/api/profile', { method: 'POST', body: JSON.stringify(profile) });

// Assistant API
export const chatWithAssistant = (message: string, context?: string) =>
  apiRequest('/api/assistant/chat', { 
    method: 'POST', 
    body: JSON.stringify({ message, context }) 
  });

export const getSuggestions = (context: string) =>
  apiRequest('/api/assistant/suggestions', {
    method: 'POST',
    body: JSON.stringify({ context })
  });

// Inventory API
export const checkStock = (sku: string) => apiRequest(`/api/inventory/${sku}/stock`);
export const findSimilarItems = (sku: string, limit = 3) => 
  apiRequest(`/api/inventory/${sku}/similar?limit=${limit}`);
export const reserveStock = (sku: string, quantity = 1) =>
  apiRequest(`/api/inventory/${sku}/reserve`, {
    method: 'POST',
    body: JSON.stringify({ quantity })
  });
