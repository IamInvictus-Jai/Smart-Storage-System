import { useQuery } from '@tanstack/react-query';
import { dataService } from '../services/api/data.service';

export const useEntities = () => {
    return useQuery({
        queryKey: ['entities'],
        queryFn: () => dataService.getEntities(),
        staleTime: 5 * 60 * 1000,
    });
};
