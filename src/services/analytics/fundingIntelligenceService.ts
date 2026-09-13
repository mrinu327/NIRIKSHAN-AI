/**
 * NIRIKSHAN Funding Intelligence Service
 * SIH26095 | MoSJE
 *
 * Provides dynamic grant calculations, release tracking, utilization rates,
 * and unspent balance computation across Projects, Schemes, Divisions, and Organizations.
 *
 * Formulas:
 * - unspentAmount = releasedAmount - utilizedAmount
 * - utilizationPercentage = (utilizedAmount / releasedAmount) * 100
 * - releaseRatio = (releasedAmount / sanctionedAmount) * 100
 * - utilizationRatio = (utilizedAmount / sanctionedAmount) * 100
 */

import { ProjectFundingIntelligence } from '../../types/master';
import { masterDataRegistry, masterLookup } from '../../data/master';

export class FundingIntelligenceService {
  /**
   * Retrieve dynamic funding intelligence for a specific project
   */
  public async getProjectFunding(projectId: string): Promise<ProjectFundingIntelligence | undefined> {
    const funding = masterLookup.getFundingByProject(projectId);
    const proj = masterLookup.getProjectById(projectId);

    if (!funding && !proj) return undefined;

    const sanctioned = funding?.sanctionedAmount ?? proj?.sanctionedAmount ?? 0;
    const released = funding?.releasedAmount ?? proj?.releasedAmount ?? 0;
    const utilized = funding?.utilizedAmount ?? proj?.utilizedAmount ?? 0;
    const unspent = Math.max(0, released - utilized);

    const utilizationPct = released > 0 ? Math.round((utilized / released) * 10000) / 100 : 0;
    const releaseRatio = sanctioned > 0 ? Math.round((released / sanctioned) * 10000) / 100 : 0;
    const utilizationRatio = sanctioned > 0 ? Math.round((utilized / sanctioned) * 10000) / 100 : 0;

    return {
      sanctionedAmount: sanctioned,
      releasedAmount: released,
      utilizedAmount: utilized,
      unspentAmount: unspent,
      utilizationPercentage: utilizationPct,
      releaseRatio,
      utilizationRatio,
      status: funding?.status ?? 'RELEASED',
      financialYear: funding?.financialYear ?? '2025-26',
    };
  }

  /**
   * Aggregate funding rollup across all projects in a scheme
   */
  public async getSchemeFunding(schemeId: string): Promise<ProjectFundingIntelligence> {
    const projects = masterLookup.getProjectsByScheme(schemeId);
    let sanctioned = 0;
    let released = 0;
    let utilized = 0;

    for (const p of projects) {
      const f = masterLookup.getFundingByProject(p.projectId);
      sanctioned += f?.sanctionedAmount ?? p.sanctionedAmount ?? 0;
      released += f?.releasedAmount ?? p.releasedAmount ?? 0;
      utilized += f?.utilizedAmount ?? p.utilizedAmount ?? 0;
    }

    const unspent = Math.max(0, released - utilized);
    const utilizationPct = released > 0 ? Math.round((utilized / released) * 10000) / 100 : 0;
    const releaseRatio = sanctioned > 0 ? Math.round((released / sanctioned) * 10000) / 100 : 0;
    const utilizationRatio = sanctioned > 0 ? Math.round((utilized / sanctioned) * 10000) / 100 : 0;

    return {
      sanctionedAmount: sanctioned,
      releasedAmount: released,
      utilizedAmount: utilized,
      unspentAmount: unspent,
      utilizationPercentage: utilizationPct,
      releaseRatio,
      utilizationRatio,
    };
  }

  /**
   * Aggregate funding rollup across all projects in an administrative division
   */
  public async getDivisionFunding(divisionId: string): Promise<ProjectFundingIntelligence> {
    const projects = masterLookup.getProjectsByDivision(divisionId);
    let sanctioned = 0;
    let released = 0;
    let utilized = 0;

    for (const p of projects) {
      const f = masterLookup.getFundingByProject(p.projectId);
      sanctioned += f?.sanctionedAmount ?? p.sanctionedAmount ?? 0;
      released += f?.releasedAmount ?? p.releasedAmount ?? 0;
      utilized += f?.utilizedAmount ?? p.utilizedAmount ?? 0;
    }

    const unspent = Math.max(0, released - utilized);
    const utilizationPct = released > 0 ? Math.round((utilized / released) * 10000) / 100 : 0;
    const releaseRatio = sanctioned > 0 ? Math.round((released / sanctioned) * 10000) / 100 : 0;
    const utilizationRatio = sanctioned > 0 ? Math.round((utilized / sanctioned) * 10000) / 100 : 0;

    return {
      sanctionedAmount: sanctioned,
      releasedAmount: released,
      utilizedAmount: utilized,
      unspentAmount: unspent,
      utilizationPercentage: utilizationPct,
      releaseRatio,
      utilizationRatio,
    };
  }

  /**
   * Aggregate funding rollup across all projects of an organization
   */
  public async getOrganizationFunding(organizationId: string): Promise<ProjectFundingIntelligence> {
    const fundingList = masterLookup.getFundingByOrganization(organizationId);
    const projects = masterLookup.getProjectsByOrganization(organizationId);

    let sanctioned = 0;
    let released = 0;
    let utilized = 0;

    if (fundingList.length > 0) {
      for (const f of fundingList) {
        sanctioned += f.sanctionedAmount;
        released += f.releasedAmount;
        utilized += f.utilizedAmount;
      }
    } else {
      for (const p of projects) {
        sanctioned += p.sanctionedAmount ?? 0;
        released += p.releasedAmount ?? 0;
        utilized += p.utilizedAmount ?? 0;
      }
    }

    const unspent = Math.max(0, released - utilized);
    const utilizationPct = released > 0 ? Math.round((utilized / released) * 10000) / 100 : 0;
    const releaseRatio = sanctioned > 0 ? Math.round((released / sanctioned) * 10000) / 100 : 0;
    const utilizationRatio = sanctioned > 0 ? Math.round((utilized / sanctioned) * 10000) / 100 : 0;

    return {
      sanctionedAmount: sanctioned,
      releasedAmount: released,
      utilizedAmount: utilized,
      unspentAmount: unspent,
      utilizationPercentage: utilizationPct,
      releaseRatio,
      utilizationRatio,
    };
  }
}

export const fundingIntelligenceService = new FundingIntelligenceService();
