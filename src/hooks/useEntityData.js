import { useQuery } from '@tanstack/react-query';
import { dataService } from '../services/api/data.service';

export const useEntityData = (entityName, page = 1, limit = 50) => {
    return useQuery({
        queryKey: ['entity-data', entityName, page, limit],
        queryFn: () => dataService.getEntityData(entityName, page, limit),
        enabled: !!entityName,
        staleTime: 2 * 60 * 1000,
    });
};
