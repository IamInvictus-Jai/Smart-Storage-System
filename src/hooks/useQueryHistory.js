import { useQuery } from '@tanstack/react-query';
import { queryService } from '../services/api/query.service';

export const useQueryHistory = (limit = 20) => {
    return useQuery({
        queryKey: ['query-history', limit],
        queryFn: () => queryService.getQueryHistory(limit),
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};
