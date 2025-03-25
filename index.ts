#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as cheerio from 'cheerio';
import fetch from "node-fetch";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
    GetCollectionParamsSchema,
    GetDeveloperAnalysisParamsSchema,
    GetRepoAnalysisParamsSchema,
    ListCollectionsParamsSchema,
    NaturalLanguageQueryParamsSchema,
} from './schemas.js';

const server = new Server({
  name: "ossinsight-mcp-server",
  version: "0.1.0",
}, {
  capabilities: {
    tools: {}
  }
});

const OSSINSIGHT_API_URL = "https://api.ossinsight.io/v1";
const OSSINSIGHT_REPO_API_URL = "https://api.ossinsight.io/gh";
const OSSINSIGHT_WEB_URL = "https://ossinsight.io";

// Helper function for API calls
async function apiRequest(endpoint: string, params: Record<string, any> = {}, useRepoApi: boolean = true) {
  // Build URL and query parameters
  const baseUrl = useRepoApi ? OSSINSIGHT_REPO_API_URL : OSSINSIGHT_API_URL;
  const url = new URL(`${baseUrl}${endpoint}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  // Send request
  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OSSInsight API error: ${response.status} ${response.statusText}\n${errorText}`);
  }

  return response.json();
}

// Helper function to fetch web page content
async function fetchWebPage(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch web page: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

// Helper function to extract data from OSS Insight web pages using cheerio
async function scrapeOSSInsightPage(url: string, selectors: Record<string, string>) {
  const html = await fetchWebPage(url);
  const $ = cheerio.load(html);
  
  const result: Record<string, any> = {};
  
  for (const [key, selector] of Object.entries(selectors)) {
    result[key] = $(selector).text().trim();
  }
  
  return result;
}

// Implement feature functions
interface RepositoryOwner {
  login: string;
  type: string;
  html_url: string;
  avatar_url: string;
}

interface RepositoryData {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  created_at: string;
  updated_at: string;
  language: string | null;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  owner: RepositoryOwner;
}

interface ApiResponse {
  data?: RepositoryData;
}

async function getRepoAnalysis(ownerRepo: string, timePeriod?: string): Promise<any> {
  const [owner, repo] = ownerRepo.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository format. Use "owner/repo"');
  }

  try {
    // Get repository basic info from API
    const repoResponse = await apiRequest(`/repo/${owner}/${repo}`) as ApiResponse;
    
    // Extract data from response structure (which matches repo.json)
    const repoData = (repoResponse['data'] || repoResponse) as RepositoryData;
    
    // Create a structured response with the available data
    const analysis = {
      basic_info: {
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        html_url: repoData.html_url,
        homepage: repoData.homepage,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        language: repoData.language,
        license: repoData.license,
        topics: repoData.topics
      },
      statistics: {
        stars: repoData.stargazers_count,
        watchers: repoData.watchers_count,
        forks: repoData.forks_count,
        open_issues: repoData.open_issues_count,
        size: repoData.size
      },
      owner: {
        login: repoData.owner?.login,
        type: repoData.owner?.type,
        html_url: repoData.owner?.html_url,
        avatar_url: repoData.owner?.avatar_url
      },
      web_url: `${OSSINSIGHT_WEB_URL}/analyze/${owner}/${repo}`
    };
    
    return analysis;
  } catch (error) {
    // If API fails, try to extract data from the web page
    console.error(`API request failed, falling back to web scraping: ${error}`);
    const webUrl = `${OSSINSIGHT_WEB_URL}/analyze/${owner}/${repo}`;
    
    return {
      message: "API request failed. Falling back to web scraping.",
      web_data: await scrapeOSSInsightPage(webUrl, {
        title: 'h1',
        stars: '.stars-count',
        forks: '.forks-count',
        open_issues: '.issues-count',
        // Add more selectors as needed
      }),
      web_url: webUrl
    };
  }
}

async function getDeveloperAnalysis(username: string): Promise<any> {
  try {
    // Get user information through API if available
    const userData = await apiRequest(`/users/${username}`);
    
    return {
      user_data: userData
    };
  } catch (error) {
    // If API fails, rely on web page data
    console.error(`API request failed, falling back to web scraping: ${error}`);
    const webUrl = `${OSSINSIGHT_WEB_URL}/analyze/user/${username}`;
    
    return {
      web_data: await scrapeOSSInsightPage(webUrl, {
        name: 'h1',
        bio: '.user-bio',
        repos: '.repos-count',
        // Add more selectors as needed
      }),
      web_url: webUrl
    };
  }
}

async function getCollection(collectionId: string): Promise<any> {
  try {
    // Get collection data from API if available
    const collectionData = await apiRequest(`/collections/${collectionId}`);
    
    // Get web page URL for reference
    const webUrl = `${OSSINSIGHT_WEB_URL}/collections/${collectionId}`;
    
    // Try to get additional data from the web page
    const webData = await scrapeOSSInsightPage(webUrl, {
      title: 'h1',
      description: '.collection-description',
      // Add more selectors as needed
    });
    
    return {
      collection_data: collectionData,
      web_data: webData,
      web_url: webUrl
    };
  } catch (error) {
    // If API fails, rely on web page data
    console.error(`API request failed, falling back to web scraping: ${error}`);
    const webUrl = `${OSSINSIGHT_WEB_URL}/collections/${collectionId}`;
    
    return {
      web_data: await scrapeOSSInsightPage(webUrl, {
        title: 'h1',
        description: '.collection-description',
        repos_count: '.repos-count',
        // Add more selectors as needed
      }),
      web_url: webUrl
    };
  }
}

async function listCollections(page: number = 1, perPage: number = 20): Promise<any> {
  try {
    // Get collections from API if available
    const collectionsData = await apiRequest('/collections', { 
      page, 
      per_page: perPage 
    });
    
    // Get web page URL for reference
    const webUrl = `${OSSINSIGHT_WEB_URL}/collections`;
    
    return {
      collections: collectionsData,
      web_url: webUrl
    };
  } catch (error) {
    // If API fails, provide just the collections web URL
    console.error(`API request failed: ${error}`);
    
    return {
      message: "API request failed. Please visit the web URL to browse collections.",
      web_url: `${OSSINSIGHT_WEB_URL}/collections`
    };
  }
}

async function naturalLanguageQuery(query: string): Promise<any> {
  // Natural language query is likely not available via the public API
  // So we'll direct users to the web interface
  
  const webUrl = `${OSSINSIGHT_WEB_URL}/chat?question=${encodeURIComponent(query)}`;
  
  return {
    message: "Natural language queries are best handled through the OSSInsight web interface.",
    web_url: webUrl
  };
}

// Set up tools list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_repo_analysis",
        description: "Get detailed analysis of a GitHub repository, including activity, stars, issues, and other metrics.",
        inputSchema: zodToJsonSchema(GetRepoAnalysisParamsSchema)
      },
      {
        name: "get_developer_analysis",
        description: "Get detailed analysis of a GitHub developer, including their activity and contributions.",
        inputSchema: zodToJsonSchema(GetDeveloperAnalysisParamsSchema)
      },
      {
        name: "get_collection",
        description: "Get information about a specific collection of repositories",
        inputSchema: zodToJsonSchema(GetCollectionParamsSchema)
      },
      {
        name: "list_collections",
        description: "List all available repository collections",
        inputSchema: zodToJsonSchema(ListCollectionsParamsSchema)
      },
      {
        name: "natural_language_query",
        description: "Query GitHub data using natural language through the OSSInsight chat interface",
        inputSchema: zodToJsonSchema(NaturalLanguageQueryParamsSchema)
      }
    ]
  };
});

// Set up tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "get_repo_analysis": {
        const args = GetRepoAnalysisParamsSchema.parse(request.params.arguments);
        const analysis = await getRepoAnalysis(args.owner_repo, args.time_period);
        return { content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }] };
      }

      case "get_developer_analysis": {
        const args = GetDeveloperAnalysisParamsSchema.parse(request.params.arguments);
        const analysis = await getDeveloperAnalysis(args.username);
        return { content: [{ type: "text", text: JSON.stringify(analysis, null, 2) }] };
      }

      case "get_collection": {
        const args = GetCollectionParamsSchema.parse(request.params.arguments);
        const collection = await getCollection(args.collection_id);
        return { content: [{ type: "text", text: JSON.stringify(collection, null, 2) }] };
      }

      case "list_collections": {
        const args = ListCollectionsParamsSchema.parse(request.params.arguments);
        const collections = await listCollections(args.page, args.per_page);
        return { content: [{ type: "text", text: JSON.stringify(collections, null, 2) }] };
      }

      case "natural_language_query": {
        const args = NaturalLanguageQueryParamsSchema.parse(request.params.arguments);
        const result = await naturalLanguageQuery(args.query);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid arguments: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OSSInsight MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});