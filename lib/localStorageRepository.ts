
import { Simulation } from '../types';

const STORAGE_KEY = 'financialReserveAdvisor:simulations';

export const localStorageRepository = {
  async saveSimulation(simulation: Simulation): Promise<void> {
    const data = await localStorageRepository.listSimulations();
    data.unshift(simulation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  async getSimulationById(id: string): Promise<Simulation | null> {
    const data = await localStorageRepository.listSimulations();
    return data.find(s => s.id === id) || null;
  },

  async listSimulations(): Promise<Simulation[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async deleteSimulation(id: string): Promise<void> {
    const data = await localStorageRepository.listSimulations();
    const filtered = data.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
