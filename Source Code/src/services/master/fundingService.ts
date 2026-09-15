import { MasterFunding } from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class FundingService {
  /**
   * Retrieve all master funding records
   */
  public async getAllFunding(): Promise<MasterFunding[]> {
    return [...masterDataRegistry.funding];
  }

  /**
   * Retrieve funding record for a specific project
   */
  public async getFundingByProject(projectId: string): Promise<MasterFunding | undefined> {
    return masterLookup.getFundingByProject(projectId);
  }

  /**
   * Retrieve all funding records for an organization
   */
  public async getFundingByOrganization(orgId: string): Promise<MasterFunding[]> {
    return masterLookup.getFundingByOrganization(orgId);
  }

  /**
   * Compute aggregated national funding metrics across all projects
   */
  public async getOverallFundingSummary(): Promise<{
    totalSanctionedAmount: number;
    totalReleasedAmount: number;
    totalUtilizedAmount: number;
    totalUnspentAmount: number;
    overallUtilizationPercentage: number;
    tranchesPendingCount: number;
  }> {
    const records = masterDataRegistry.funding;

    const totalSanctionedAmount = records.reduce((acc, f) => acc + f.sanctionedAmount, 0);
    const totalReleasedAmount = records.reduce((acc, f) => acc + f.releasedAmount, 0);
    const totalUtilizedAmount = records.reduce((acc, f) => acc + f.utilizedAmount, 0);
    const totalUnspentAmount = totalReleasedAmount - totalUtilizedAmount;
    const overallUtilizationPercentage =
      totalReleasedAmount > 0 ? (totalUtilizedAmount / totalReleasedAmount) * 100 : 0;

    let tranchesPendingCount = 0;
    records.forEach(f => {
      if (f.tranches) {
        f.tranches.forEach(t => {
          if (t.status === 'PENDING') tranchesPendingCount++;
        });
      }
    });

    return {
      totalSanctionedAmount,
      totalReleasedAmount,
      totalUtilizedAmount,
      totalUnspentAmount,
      overallUtilizationPercentage: Number(overallUtilizationPercentage.toFixed(1)),
      tranchesPendingCount,
    };
  }
}

export const fundingService = new FundingService();
