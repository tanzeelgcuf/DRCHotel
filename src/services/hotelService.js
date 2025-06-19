// services/hotelService.js
import { httpService } from './httpClient';
import { apiConfig } from '../config/api';

class HotelService {
  // Establishments/Hotels Management
  
  // Get all establishments
  async getEstablishments(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiConfig.ENDPOINTS.HOTELS.LIST}${queryString ? `?${queryString}` : ''}`;
      return await httpService.get(url);
    } catch (error) {
      console.error('Failed to fetch establishments:', error);
      throw error;
    }
  }

  // Get establishment by ID
  async getEstablishmentById(id) {
    try {
      const url = apiConfig.buildUrlWithParams(apiConfig.ENDPOINTS.HOTELS.GET_BY_ID, { id });
      return await httpService.get(`${url}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch establishment ${id}:`, error);
      throw error;
    }
  }

  // Create new establishment
  async createEstablishment(establishmentData) {
    try {
      return await httpService.post(apiConfig.ENDPOINTS.HOTELS.CREATE, establishmentData);
    } catch (error) {
      console.error('Failed to create establishment:', error);
      throw error;
    }
  }

  // Update establishment
  async updateEstablishment(id, establishmentData) {
    try {
      return await httpService.put(`${apiConfig.ENDPOINTS.HOTELS.UPDATE}/${id}`, establishmentData);
    } catch (error) {
      console.error(`Failed to update establishment ${id}:`, error);
      throw error;
    }
  }

  // Delete establishment
  async deleteEstablishment(id) {
    try {
      return await httpService.delete(`${apiConfig.ENDPOINTS.HOTELS.DELETE}/${id}`);
    } catch (error) {
      console.error(`Failed to delete establishment ${id}:`, error);
      throw error;
    }
  }

  // Register DRC Hotel (specific to DRC system)
  async registerDRCHotel(hotelData) {
    try {
      return await httpService.post(apiConfig.ENDPOINTS.HOTELS.REGISTER_DRC, hotelData);
    } catch (error) {
      console.error('Failed to register DRC hotel:', error);
      throw error;
    }
  }

  // Verify establishment
  async verifyEstablishment(id, verificationData) {
    try {
      const url = apiConfig.ENDPOINTS.HOTELS.VERIFY.replace('{id}', id);
      return await httpService.post(url, verificationData);
    } catch (error) {
      console.error(`Failed to verify establishment ${id}:`, error);
      throw error;
    }
  }

  // Get establishment statistics
  async getEstablishmentStats(id, params = {}) {
    try {
      const url = apiConfig.ENDPOINTS.HOTELS.STATS.replace('{id}', id);
      const queryString = new URLSearchParams(params).toString();
      return await httpService.get(`${url}${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error(`Failed to fetch establishment stats ${id}:`, error);
      throw error;
    }
  }

  // Client Management
  
  // Get all clients
  async getClients(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiConfig.ENDPOINTS.CLIENTS.LIST}${queryString ? `?${queryString}` : ''}`;
      return await httpService.get(url);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw error;
    }
  }

  // Get client by ID
  async getClientById(id, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiConfig.ENDPOINTS.CLIENTS.GET_BY_ID}/${id}${queryString ? `?${queryString}` : ''}`;
      return await httpService.get(url);
    } catch (error) {
      console.error(`Failed to fetch client ${id}:`, error);
      throw error;
    }
  }

  // Create new client
  async createClient(clientData) {
    try {
      return await httpService.post(apiConfig.ENDPOINTS.CLIENTS.CREATE, clientData);
    } catch (error) {
      console.error('Failed to create client:', error);
      throw error;
    }
  }

  // Update client
  async updateClient(id, clientData) {
    try {
      return await httpService.put(`${apiConfig.ENDPOINTS.CLIENTS.UPDATE}/${id}`, clientData);
    } catch (error) {
      console.error(`Failed to update client ${id}:`, error);
      throw error;
    }
  }

  // Register hotel guest (DRC specific)
  async registerHotelGuest(guestData) {
    try {
      return await httpService.post(apiConfig.ENDPOINTS.CLIENTS.REGISTER_GUEST, guestData);
    } catch (error) {
      console.error('Failed to register hotel guest:', error);
      throw error;
    }
  }

  // Verify client
  async verifyClient(id, verificationData) {
    try {
      const url = apiConfig.ENDPOINTS.CLIENTS.VERIFY.replace('{id}', id);
      return await httpService.post(url, verificationData);
    } catch (error) {
      console.error(`Failed to verify client ${id}:`, error);
      throw error;
    }
  }

  // Block client
  async blockClient(id, blockData) {
    try {
      const url = apiConfig.ENDPOINTS.CLIENTS.BLOCK.replace('{id}', id);
      return await httpService.post(url, blockData);
    } catch (error) {
      console.error(`Failed to block client ${id}:`, error);
      throw error;
    }
  }

  // Unblock client
  async unblockClient(id) {
    try {
      const url = apiConfig.ENDPOINTS.CLIENTS.UNBLOCK.replace('{id}', id);
      return await httpService.post(url);
    } catch (error) {
      console.error(`Failed to unblock client ${id}:`, error);
      throw error;
    }
  }

  // Get pending clients
  async getPendingClients(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiConfig.ENDPOINTS.CLIENTS.PENDING}${queryString ? `?${queryString}` : ''}`;
      return await httpService.get(url);
    } catch (error) {
      console.error('Failed to fetch pending clients:', error);
      throw error;
    }
  }

  // Get verified clients
  async getVerifiedClients(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiConfig.ENDPOINTS.CLIENTS.VERIFIED}${queryString ? `?${queryString}` : ''}`;
      return await httpService.get(url);
    } catch (error) {
      console.error('Failed to fetch verified clients:', error);
      throw error;
    }
  }

  // Stays Management
  
  // Get all stays
  async getStays(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiConfig.ENDPOINTS.STAYS.LIST}${queryString ? `?${queryString}` : ''}`;
      return await httpService.get(url);
    } catch (error) {
      console.error('Failed to fetch stays:', error);
      throw error;
    }
  }

  // Get stay by ID
  async getStayById(id) {
    try {
      return await httpService.get(`${apiConfig.ENDPOINTS.STAYS.GET_BY_ID}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch stay ${id}:`, error);
      throw error;
    }
  }

    //
  }
  
  export const hotelService = new HotelService();