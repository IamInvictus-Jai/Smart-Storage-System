import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { mediaService } from '../services/api/media.service';

export const useFilesByCategory = (categories) => {
    const isInitialMount = useRef(true);

    const result = useQuery({
        queryKey: ['files-by-category', categories],
        queryFn: () => {
            const shouldRefresh = isInitialMount.current;
            return mediaService.getFilesByCategory(categories, shouldRefresh);
        },
        enabled: categories.length > 0,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        isInitialMount.current = false;
    }, []);

    return result;
};
