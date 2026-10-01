import { bloodBankAPI } from '../api/bloodBankAPI';

export const bloodBankService = {
  // ---- Units ----

  async createUnit(payload) {
    const { data } = await bloodBankAPI.createUnit(payload);
    return data;
  },

  /**
   * params: { blood_group, component_type, status, expiring_within_days, skip, limit }
   */
  async getUnits(hospitalId, params = {}) {
    const { data } = await bloodBankAPI.getUnits({ hospital_id: hospitalId, ...params });
    return data;
  },

  async getUnitById(id) {
    const { data } = await bloodBankAPI.getUnitById(id);
    return data;
  },

  async getUnitByCode(code) {
    const { data } = await bloodBankAPI.getUnitByCode(code);
    return data;
  },

  async getUnitLogs(id) {
    const { data } = await bloodBankAPI.getUnitLogs(id);
    return data;
  },

  async reserveUnit(id, requestId) {
    const { data } = await bloodBankAPI.reserveUnit(id, requestId);
    return data;
  },

  async unreserveUnit(id) {
    const { data } = await bloodBankAPI.unreserveUnit(id);
    return data;
  },

  async issueUnit(id, issuedTo) {
    const { data } = await bloodBankAPI.issueUnit(id, issuedTo);
    return data;
  },

  async discardUnit(id, reason) {
    const { data } = await bloodBankAPI.discardUnit(id, reason);
    return data;
  },

  async moveUnit(id, storageLocationId) {
    const { data } = await bloodBankAPI.moveUnit(id, storageLocationId);
    return data;
  },

  async scanExpiredUnits(hospitalId) {
    const { data } = await bloodBankAPI.scanExpiredUnits(hospitalId);
    return data;
  },

  // ---- Storage locations ----

  async createLocation(payload) {
    const { data } = await bloodBankAPI.createLocation(payload);
    return data;
  },

  async getLocations(hospitalId) {
    const { data } = await bloodBankAPI.getLocations(hospitalId);
    return data;
  },

  // ---- Summary ----

  async getSummary(hospitalId) {
    const { data } = await bloodBankAPI.getSummary(hospitalId);
    return data;
  },

  // ---- Analytics (Module 2) ----

  async getAnalyticsOverview(hospitalId) {
    const { data } = await bloodBankAPI.getAnalyticsOverview(hospitalId);
    return data;
  },

  async getBloodGroupDistribution(hospitalId) {
    const { data } = await bloodBankAPI.getBloodGroupDistribution(hospitalId);
    return data;
  },

  async getUsageTrend(hospitalId, months = 6) {
    const { data } = await bloodBankAPI.getUsageTrend(hospitalId, months);
    return data;
  },

  async getStatusHeatmap(hospitalId) {
    const { data } = await bloodBankAPI.getStatusHeatmap(hospitalId);
    return data;
  },
};
