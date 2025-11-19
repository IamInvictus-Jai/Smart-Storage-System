import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/api/admin.service';

export const useSystemStats = () => {
    return useQuery({
        queryKey: ['system-stats'],
        queryFn: () => adminService.getSystemStats(),
        staleTime: 5 * 60 * 1000,
    });
};
