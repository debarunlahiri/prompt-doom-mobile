import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, imageApi } from "./api";
import { PAGE_SIZE } from "./config";
import { GalleryImage } from "./types";

export function usePagedImages(
  filters: { q?: string; category?: string; tag?: string; model?: string } = {},
) {
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();
  const filterKey = JSON.stringify(filters);

  const load = useCallback(
    async (nextPage = 1, refresh = false) => {
      if (nextPage > 1) setLoadingMore(true);
      else if (refresh) setRefreshing(true);
      else setLoading(true);
      try {
        const result = await imageApi.list({
          ...filters,
          page: nextPage,
          limit: PAGE_SIZE,
        });
        setItems((current) =>
          nextPage === 1
            ? result.items
            : [
                ...current,
                ...result.items.filter(
                  (item) => !current.some((old) => old.id === item.id),
                ),
              ],
        );
        setPage(nextPage);
        setTotalPages(result.pagination.totalPages ?? nextPage);
        setError(undefined);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [filterKey],
  );

  useEffect(() => {
    void load();
  }, [load]);
  return {
    items,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh: () => load(1, true),
    retry: () => load(),
    loadMore: () => {
      if (!loadingMore && page < totalPages) void load(page + 1);
    },
  };
}
