import { useState, useEffect, useCallback } from "react";
import {
  fetchAllUsers, fetchAllTransactions, fetchRevenueStats,
  fetchDashboardStats, fetchAnalytics, fetchGrowthAnalytics,
  fetchAllBookings,
} from "../controllers/adminController";
import { cacheGet, cacheSet } from "../utils/adminCache";

const FETCHERS = [
  { key: "users",          fn: fetchAllUsers },
  { key: "transactions",   fn: fetchAllTransactions },
  { key: "revenueStats",   fn: fetchRevenueStats },
  { key: "dashStats",      fn: fetchDashboardStats },
  { key: "analytics",      fn: fetchAnalytics },
  { key: "growthAnalytics",fn: fetchGrowthAnalytics },
  { key: "bookings",       fn: fetchAllBookings },
];

const DEFAULTS = {
  users: null,
  transactions: null,
  revenueStats: null,
  dashStats: null,
  analytics: null,
  growthAnalytics: null,
  bookings: null,
};

export const useAdminData = () => {
  const [data, setData]       = useState(() => {
    // Seed from cache synchronously so UI renders with data immediately
    const seeded = {};
    FETCHERS.forEach(({ key }) => { seeded[key] = cacheGet(key); });
    return { ...DEFAULTS, ...seeded };
  });
  const [loading, setLoading] = useState(true);
  const [errors,  setErrors]  = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled(
      FETCHERS.map(async ({ key, fn }) => {
        try {
          const result = await fn();
          cacheSet(key, result);
          return { key, result };
        } catch (err) {
          const cached = cacheGet(key);
          if (cached !== null) return { key, result: cached };
          throw err;
        }
      })
    );

    const newData = { ...DEFAULTS };
    const newErrors = {};
    results.forEach((settled, i) => {
      const { key } = FETCHERS[i];
      if (settled.status === "fulfilled") {
        newData[key] = settled.value.result;
      } else {
        newErrors[key] = settled.reason?.message || "Error";
      }
    });

    setData(newData);
    setErrors(newErrors);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { ...data, loading, errors, refetch: fetchAll };
};
