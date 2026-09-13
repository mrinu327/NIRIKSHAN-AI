import { MasterState, MasterDistrict } from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class GeographyService {
  /**
   * Retrieve all master states
   */
  public async getStates(): Promise<MasterState[]> {
    return [...masterDataRegistry.states];
  }

  /**
   * Retrieve state by ID
   */
  public async getStateById(stateId: string): Promise<MasterState | undefined> {
    return masterLookup.getStateById(stateId);
  }

  /**
   * Retrieve all districts, optionally filtered by state ID
   */
  public async getDistricts(stateId?: string): Promise<MasterDistrict[]> {
    if (stateId) {
      return masterLookup.getDistrictsByState(stateId);
    }
    return [...masterDataRegistry.districts];
  }

  /**
   * Retrieve district by ID
   */
  public async getDistrictById(districtId: string): Promise<MasterDistrict | undefined> {
    return masterLookup.getDistrictById(districtId);
  }
}

export const geographyService = new GeographyService();
