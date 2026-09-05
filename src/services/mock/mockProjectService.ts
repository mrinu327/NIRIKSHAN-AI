/**
 * Mock Project Service
 * SIH26095 | MoSJE
 *
 * Provides mock API endpoints for project lists, metrics, and priority filters.
 */

import { Project, ProjectStatsSummary } from '../../types/project';
import { MOCK_PROJECTS, MOCK_OFFICIAL_STATS } from '../../data/mockData';

export class MockProjectService {
  private projects: Project[] = [...MOCK_PROJECTS];

  async getProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async getPriorityProjects(): Promise<Project[]> {
    return this.projects.filter((p) => p.priority === 'HIGH' || p.status === 'High Priority' || p.status === 'Inspection Due');
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.projects.find((p) => p.id === id);
  }

  async getOfficialStats(): Promise<ProjectStatsSummary> {
    return { ...MOCK_OFFICIAL_STATS };
  }

  async updateProjectStatus(id: string, status: Project['status'], notes?: string): Promise<Project | undefined> {
    const project = this.projects.find((p) => p.id === id);
    if (project) {
      project.status = status;
      if (notes) {
        project.notes = notes;
      }
    }
    return project;
  }

  async reset(): Promise<void> {
    this.projects = [...MOCK_PROJECTS];
  }
}

export const mockProjectService = new MockProjectService();
