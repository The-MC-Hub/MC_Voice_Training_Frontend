import api from "./api";







export const addCertificate = async (certData) => {
  const response = await api.post("/certificates", certData);
  return response.data.data;
};


export const getCertificatesByMC = async (mcProfileId) => {
  const response = await api.get(`/certificates/mc/${mcProfileId}`);
  return response.data.data;
};


export const verifyCertificate = async (id) => {
  const response = await api.put(`/certificates/${id}/verify`);
  return response.data.data;
};


export const deleteCertificate = async (id) => {
  const response = await api.delete(`/certificates/${id}`);
  return response.data;
};
