import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { mediaService } from '../services/api/media.service';

export const useMediaCategories = () => {
    const isInitialMount = useRef(true);

    const result = useQuery({
        queryKey: ['media-categories'],
        queryFn: () => {
            const shouldRefresh = isInitialMount.current;
            return mediaService.getCategories(shouldRefresh);
        },
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        isInitialMount.current = false;
    }, []);

    return result;
};
