// src/hooks/useHotelApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { hotelService } from '../services/hotelService';

// Query keys for cache management
export const hotelQueryKeys = {
  all: ['hotels'],
  establishments: (params) => ['hotels', 'establishments', params],
  establishment: (id) => ['hotels', 'establishment', id],
  clients: (params) => ['hotels', 'clients', params],
  client: (id) => ['hotels', 'client', id],
  stays: (params) => ['hotels', 'stays', params],
  stay: (id) => ['hotels', 'stay', id],
  stats: (id, params) => ['hotels', 'stats', id, params]
};

// ============= ESTABLISHMENTS HOOKS =============

// Get all establishments
export function useEstablishments(params = {}) {
  return useQuery({
    queryKey: hotelQueryKeys.establishments(params),
    queryFn: () => hotelService.getEstablishments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

// Get establishment by ID
export function useEstablishment(id, options = {}) {
  return useQuery({
    queryKey: hotelQueryKeys.establishment(id),
    queryFn: () => hotelService.getEstablishmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

// Create establishment mutation
export function useCreateEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.createEstablishment,
    onSuccess: (data) => {
      // Invalidate and refetch establishments list
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.establishments() });
      toast.success('Establishment created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create establishment: ${error.message}`);
    }
  });
}

// Update establishment mutation
export function useUpdateEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.updateEstablishment(id, data),
    onSuccess: (data, { id }) => {
      // Update the specific establishment in cache
      queryClient.setQueryData(hotelQueryKeys.establishment(id), data);
      // Invalidate the list to refresh
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.establishments() });
      toast.success('Establishment updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update establishment: ${error.message}`);
    }
  });
}

// Delete establishment mutation
export function useDeleteEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.deleteEstablishment,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: hotelQueryKeys.establishment(id) });
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.establishments() });
      toast.success('Establishment deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete establishment: ${error.message}`);
    }
  });
}

// Register DRC hotel mutation
export function useRegisterDRCHotel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.registerDRCHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.establishments() });
      toast.success('DRC Hotel registered successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to register DRC hotel: ${error.message}`);
    }
  });
}

// Verify establishment mutation
export function useVerifyEstablishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.verifyEstablishment(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.establishment(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.establishments() });
      toast.success('Establishment verified successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to verify establishment: ${error.message}`);
    }
  });
}

// Get establishment statistics
export function useEstablishmentStats(id, params = {}) {
  return useQuery({
    queryKey: hotelQueryKeys.stats(id, params),
    queryFn: () => hotelService.getEstablishmentStats(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000 // 2 minutes for stats
  });
}

// ============= CLIENTS HOOKS =============

// Get all clients
export function useClients(params = {}) {
  return useQuery({
    queryKey: hotelQueryKeys.clients(params),
    queryFn: () => hotelService.getClients(params),
    staleTime: 1 * 60 * 1000 // 1 minute
  });
}

// Get client by ID
export function useClient(id, params = {}) {
  return useQuery({
    queryKey: hotelQueryKeys.client(id),
    queryFn: () => hotelService.getClientById(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
}

// Create client mutation
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.clients() });
      toast.success('Client created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create client: ${error.message}`);
    }
  });
}

// Update client mutation
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.updateClient(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.client(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.clients() });
      toast.success('Client updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update client: ${error.message}`);
    }
  });
}

// Register hotel guest mutation
export function useRegisterHotelGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.registerHotelGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.clients() });
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.stays() });
      toast.success('Hotel guest registered successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to register hotel guest: ${error.message}`);
    }
  });
}

// Verify client mutation
export function useVerifyClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.verifyClient(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.client(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.clients() });
      toast.success('Client verified successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to verify client: ${error.message}`);
    }
  });
}

// Block client mutation
export function useBlockClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.blockClient(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.client(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.clients() });
      toast.success('Client blocked successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to block client: ${error.message}`);
    }
  });
}

// Unblock client mutation
export function useUnblockClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.unblockClient,
    onSuccess: (data, id) => {
      queryClient.setQueryData(hotelQueryKeys.client(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.clients() });
      toast.success('Client unblocked successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to unblock client: ${error.message}`);
    }
  });
}

// Get pending clients
export function usePendingClients(params = {}) {
  return useQuery({
    queryKey: ['hotels', 'clients', 'pending', params],
    queryFn: () => hotelService.getPendingClients(params),
    staleTime: 1 * 60 * 1000
  });
}

// Get verified clients
export function useVerifiedClients(params = {}) {
  return useQuery({
    queryKey: ['hotels', 'clients', 'verified', params],
    queryFn: () => hotelService.getVerifiedClients(params),
    staleTime: 5 * 60 * 1000
  });
}

// ============= STAYS HOOKS =============

// Get all stays
export function useStays(params = {}) {
  return useQuery({
    queryKey: hotelQueryKeys.stays(params),
    queryFn: () => hotelService.getStays(params),
    staleTime: 1 * 60 * 1000
  });
}

// Get stay by ID
export function useStay(id) {
  return useQuery({
    queryKey: hotelQueryKeys.stay(id),
    queryFn: () => hotelService.getStayById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });
}

// Create stay mutation
export function useCreateStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.createStay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.stays() });
      toast.success('Stay created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create stay: ${error.message}`);
    }
  });
}

// Update stay mutation
export function useUpdateStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.updateStay(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.stay(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.stays() });
      toast.success('Stay updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update stay: ${error.message}`);
    }
  });
}

// Close stay mutation
export function useCloseStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.closeStay(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.stay(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.stays() });
      toast.success('Stay closed successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to close stay: ${error.message}`);
    }
  });
}

// Cancel stay mutation
export function useCancelStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.cancelStay(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.stay(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.stays() });
      toast.success('Stay cancelled successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to cancel stay: ${error.message}`);
    }
  });
}

// Extend stay mutation
export function useExtendStay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => hotelService.extendStay(id, data),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(hotelQueryKeys.stay(id), data);
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.stays() });
      toast.success('Stay extended successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to extend stay: ${error.message}`);
    }
  });
}

// Get stays to close
export function useStaysToClose(params = {}) {
  return useQuery({
    queryKey: ['hotels', 'stays', 'to-close', params],
    queryFn: () => hotelService.getStaysToClose(params),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
}

// Bulk close stays mutation
export function useBulkCloseStays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hotelService.bulkCloseStays,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotelQueryKeys.stays() });
      queryClient.invalidateQueries({ queryKey: ['hotels', 'stays', 'to-close'] });
      toast.success('Stays closed successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to close stays: ${error.message}`);
    }
  });
}

// ============= UTILITY HOOKS =============

// Prefetch related data
export function usePrefetchHotelData() {
  const queryClient = useQueryClient();

  const prefetchEstablishments = () => {
    queryClient.prefetchQuery({
      queryKey: hotelQueryKeys.establishments(),
      queryFn: () => hotelService.getEstablishments(),
      staleTime: 5 * 60 * 1000
    });
  };

  const prefetchClients = (params = {}) => {
    queryClient.prefetchQuery({
      queryKey: hotelQueryKeys.clients(params),
      queryFn: () => hotelService.getClients(params),
      staleTime: 1 * 60 * 1000
    });
  };

  const prefetchStays = (params = {}) => {
    queryClient.prefetchQuery({
      queryKey: hotelQueryKeys.stays(params),
      queryFn: () => hotelService.getStays(params),
      staleTime: 1 * 60 * 1000
    });
  };

  return {
    prefetchEstablishments,
    prefetchClients,
    prefetchStays
  };
}

// Real-time data hook (using polling)
export function useRealTimeHotelData(interval = 30000) {
  const { data: stays } = useStays({}, {
    refetchInterval: interval,
    refetchIntervalInBackground: false
  });

  const { data: pendingClients } = usePendingClients({}, {
    refetchInterval: interval * 2, // Less frequent for pending clients
    refetchIntervalInBackground: false
  });

  return {
    activeStays: stays?.data?.filter(stay => stay.status === 'active') || [],
    pendingClients: pendingClients?.data || [],
    staysCount: stays?.total || 0,
    pendingClientsCount: pendingClients?.total || 0
  };
}