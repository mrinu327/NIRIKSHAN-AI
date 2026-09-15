import { PMU, PMUTeam } from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class PmuService {
  /**
   * Retrieve all Project Monitoring Units
   */
  public async getPMUs(): Promise<PMU[]> {
    return [...masterDataRegistry.pmus];
  }

  /**
   * Retrieve PMU by ID
   */
  public async getPmuById(pmuId: string): Promise<PMU | undefined> {
    return masterLookup.getPmuById(pmuId);
  }

  /**
   * Retrieve all inspection/monitoring teams belonging to a PMU
   */
  public async getPmuTeams(pmuId: string): Promise<PMUTeam[]> {
    return masterLookup.getTeamsByPmu(pmuId);
  }

  /**
   * Retrieve all teams across all PMUs
   */
  public async getAllTeams(): Promise<PMUTeam[]> {
    return [...masterDataRegistry.pmuTeams];
  }

  /**
   * Retrieve a specific team by ID
   */
  public async getTeamById(teamId: string): Promise<PMUTeam | undefined> {
    return masterLookup.getTeamById(teamId);
  }
}

export const pmuService = new PmuService();
