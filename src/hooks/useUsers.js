import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/api/admin.service';

export const useUsers = () => {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminService.getAllUsers(),
        staleTime: 2 * 60 * 1000,
    });
};
