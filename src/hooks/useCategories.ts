import { useCallback, useEffect, useState } from "react";
import { getErrorMessage, imageApi } from "../api";

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const first = await imageApi.list({ page: 1, limit: 100 });
      const totalPages = first.pagination.totalPages ?? 1;
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
          imageApi.list({ page: index + 2, limit: 100 }),
        ),
      );
      const names = [first, ...remainingPages]
        .flatMap((page) => page.items)
        .map((item) => item.category?.name)
        .filter((name): name is string => Boolean(name));

      setCategories(
        Array.from(new Set(names)).sort((left, right) =>
          left.localeCompare(right),
        ),
      );
      setError("");
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { categories, loading, error, retry: load };
}
