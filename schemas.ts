import { z } from 'zod';

// API parameter structures
export const GetRepoAnalysisParamsSchema = z.object({
  owner_repo: z.string().describe("Repository name in the format 'owner/repo'"),
  time_period: z.enum(['last_28_days', 'last_90_days', 'last_year', 'all_time']).optional()
    .describe("Time range for analysis (optional)")
});

export const GetDeveloperAnalysisParamsSchema = z.object({
  username: z.string().describe("GitHub username")
});

export const GetCollectionParamsSchema = z.object({
  collection_id: z.string().describe("Collection ID, e.g., 'open-source-database'")
});

export const ListCollectionsParamsSchema = z.object({
  page: z.number().optional().describe("Page number, starting from 1"),
  per_page: z.number().optional().describe("Number of results per page, default is 20")
});

export const NaturalLanguageQueryParamsSchema = z.object({
  query: z.string().describe("Natural language query, e.g., 'Which repositories gained the most stars in 2023?'")
});