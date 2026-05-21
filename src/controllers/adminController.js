

import api from '../services/api';


export const fetchAllUsers = async () => {
  const response = await api.get('/admin/users');
  const rawUsers = response.data.data || response.data.data.users || [];
  return rawUsers.map(u => ({
    ...u,
    _id: u._id || u.id
  }));
};


export const verifyMC = async (id, isVerified, isActive = true) => {
  const response = await api.put(`/admin/users/${id}/status`, { isActive, isVerified });
  const user = response.data.data || response.data.data.user;
  return {
    ...user,
    _id: user._id || user.id
  };
};


export const suspendUser = async (id, isActive, isVerified = false) => {
  const response = await api.put(`/admin/users/${id}/status`, { isActive, isVerified });
  const user = response.data.data || response.data.data.user;
  return {
    ...user,
    _id: user._id || user.id
  };
};


export const fetchAllBookings = async () => {
  return [
    {
      _id: "bk_98b50e2ddc9943efb387052637738f61",
      client: { name: "Elena Rostova" },
      mc: { name: "Alex Mercer" },
      eventDate: "2026-02-15T18:00:00.000Z",
      price: 15000000,
      status: "COMPLETED"
    },
    {
      _id: "bk_98b50e2ddc9943efb387052637738f62",
      client: { name: "Marcus Aurelius" },
      mc: { name: "David Beckham" },
      eventDate: "2026-03-18T20:00:00.000Z",
      price: 25000000,
      status: "ACCEPTED"
    },
    {
      _id: "bk_98b50e2ddc9943efb387052637738f63",
      client: { name: "Sophia Loren" },
      mc: { name: "G-Dragon" },
      eventDate: "2026-04-20T19:00:00.000Z",
      price: 18000000,
      status: "PENDING"
    },
    {
      _id: "bk_98b50e2ddc9943efb387052637738f64",
      client: { name: "Tony Stark" },
      mc: { name: "Steve Rogers" },
      eventDate: "2026-05-22T14:00:00.000Z",
      price: 45000000,
      status: "CANCELLED"
    },
    {
      _id: "bk_98b50e2ddc9943efb387052637738f65",
      client: { name: "Bruce Wayne" },
      mc: { name: "Clark Kent" },
      eventDate: "2026-06-25T21:00:00.000Z",
      price: 50000000,
      status: "COMPLETED"
    }
  ];
};


export const fetchAllTransactions = async () => {
  return [
    {
      _id: "tx_98b50e2ddc9943efb387052637738t01",
      type: "payment",
      client: { name: "Elena Rostova" },
      mc: { name: "Alex Mercer" },
      amount: 15000000,
      status: "COMPLETED",
      platformFee: 3000000
    },
    {
      _id: "tx_98b50e2ddc9943efb387052637738t02",
      type: "payment",
      client: { name: "Bruce Wayne" },
      mc: { name: "Clark Kent" },
      amount: 50000000,
      status: "COMPLETED",
      platformFee: 10000000
    },
    {
      _id: "tx_98b50e2ddc9943efb387052637738t03",
      type: "refund",
      client: { name: "Tony Stark" },
      mc: { name: "Steve Rogers" },
      amount: 45000000,
      status: "COMPLETED",
      platformFee: 9000000
    },
    {
      _id: "tx_98b50e2ddc9943efb387052637738t04",
      type: "payment",
      client: { name: "Sophia Loren" },
      mc: { name: "G-Dragon" },
      amount: 18000000,
      status: "PENDING",
      platformFee: 3600000
    }
  ];
};
