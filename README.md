[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/damonxue-mcp-ossinsight-badge.png)](https://mseep.ai/app/damonxue-mcp-ossinsight)

# OSSInsight MCP Server

An MCP server based on OSSInsight.io, providing data analysis for GitHub individuals, organizations, and repositories, as well as in-depth insights into the open source ecosystem.

<a href="https://glama.ai/mcp/servers/@damonxue/mcp-ossinsight">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@damonxue/mcp-ossinsight/badge" alt="OSSInsight Server MCP server" />
</a>

## Features

- **Repository Analysis**: Get comprehensive data about GitHub repositories, including star trends, contributor activity, and code commits
- **Developer Analysis**: Understand developers' contribution patterns, activity history, and influence
- **Organization Analysis**: View a global perspective of GitHub organizations, including members, repositories, and overall activity
- **Project Comparison**: Compare key metrics between two repositories side by side to discover differences and similarities
- **Project Collections**: Browse and explore curated collections of projects, such as open-source databases, AI tools, etc.
- **Natural Language Queries**: Access OSSInsight's chat interface to ask questions about GitHub data

## Tools

1. `get_repo_analysis`
   - Get detailed analysis of a GitHub repository
   - Input:
     - `owner_repo` (string): Repository name in the format 'owner/repo'
     - `time_period` (optional string): Time range for analysis
   - Returns: Repository analysis data from both API and web page, with a link to the OSSInsight page

2. `get_developer_analysis`
   - Get detailed analysis of a GitHub developer
   - Input:
     - `username` (string): GitHub username
   - Returns: Developer data from both API and web page, with a link to the OSSInsight page

3. `get_collection`
   - Get information about a specific collection of repositories
   - Input:
     - `collection_id` (string): Collection ID, e.g., 'open-source-database'
   - Returns: Collection data and a link to the collection page on OSSInsight

4. `list_collections`
   - List all available repository collections
   - Input:
     - `page` (optional number): Page number, starting from 1
     - `per_page` (optional number): Number of results per page, default is 20
   - Returns: List of collections and a link to browse collections on OSSInsight

5. `natural_language_query`
   - Direct access to OSSInsight's natural language query interface
   - Input:
     - `query` (string): Natural language query, e.g., 'Which repositories gained the most stars in 2023?'
   - Returns: A direct link to OSSInsight's chat interface with the query prefilled

## Implementation Details

This MCP server uses a dual approach to retrieve data:

1. **OSSInsight Public API** (v1) - Makes direct API calls to `https://api.ossinsight.io/v1/` endpoints
2. **Web Page Scraping** - Falls back to scraping the OSSInsight web pages when APIs are limited or unavailable

This approach ensures maximum coverage of OSSInsight's features while respecting the public API's rate limits (600 requests per hour per IP).

## Setup

### Usage Configuration

#### Docker

```json
{
  "mcpServers": { 
    "ossinsight": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "mcp/ossinsight"
      ]
    }
  }
}
```

#### NPX

```json
{
  "mcpServers": {
    "ossinsight": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-ossinsight"
      ]
    }
  }
}
```

## Build

Docker build:

```bash
docker build -t mcp/ossinsight -f Dockerfile .
```

## Examples

### Get Repository Analysis

```
// Get analysis data for the VSCode repository
{
  "owner_repo": "microsoft/vscode"
}
```

### Compare Two Repositories

```
// Compare React and Vue
{
  "repo1": "facebook/react",
  "repo2": "vuejs/vue"
}
```

### Natural Language Query

```
// Get a link to query data using natural language
{
  "query": "Which database projects gained the most stars in 2023?"
}
```

## License

This MCP server is licensed under the MIT License. This means you can freely use, modify, and distribute this software, subject to the terms and conditions of the MIT License. See the LICENSE file in the project repository for details.

---

# OSSInsight MCP 服务器

基于 OSSInsight.io 的 MCP 服务器，提供对 GitHub 个人、组织和仓库的数据分析，以及开源生态系统的深入洞察。

## 功能特点

- **仓库分析**：获取有关 GitHub 仓库的全面数据，包括星标趋势、贡献者活动和代码提交
- **开发者分析**：了解开发者的贡献模式、活动历史和影响力
- **组织分析**：查看 GitHub 组织的全局视图，包括成员、仓库和整体活动
- **项目比较**：并排比较两个仓库的关键指标，发现差异和相似之处
- **项目集合**：浏览和探索精选的项目集合，如开源数据库、AI 工具等
- **自然语言查询**：访问 OSSInsight 的聊天界面，用自然语言提问 GitHub 数据

## 工具

1. `get_repo_analysis`
   - 获取 GitHub 仓库的详细分析
   - 输入:
     - `owner_repo` (字符串): 仓库名称，格式为 'owner/repo'
     - `time_period` (可选字符串): 分析的时间范围
   - 返回: 来自 API 和网页的仓库分析数据，以及指向 OSSInsight 页面的链接

2. `get_developer_analysis`
   - 获取 GitHub 开发者的详细分析
   - 输入:
     - `username` (字符串): GitHub 用户名
   - 返回: 来自 API 和网页的开发者数据，以及指向 OSSInsight 页面的链接

3. `get_collection`
   - 获取特定集合的信息和仓库列表
   - 输入:
     - `collection_id` (字符串): 集合 ID，例如 'open-source-database'
   - 返回: 集合数据以及指向 OSSInsight 集合页面的链接

4. `list_collections`
   - 列出所有可用的仓库集合
   - 输入:
     - `page` (可选数字): 页码，从 1 开始
     - `per_page` (可选数字): 每页结果数量，默认为 20
   - 返回: 集合列表以及指向 OSSInsight 浏览集合页面的链接

5. `natural_language_query`
   - 直接访问 OSSInsight 的自然语言查询界面
   - 输入:
     - `query` (字符串): 自然语言查询，例如 'Which repositories gained the most stars in 2023?'
   - 返回: 指向 OSSInsight 聊天界面的直接链接，并预填充查询

## 实现细节

此 MCP 服务器使用双重方法获取数据：

1. **OSSInsight 公共 API** (v1) - 直接调用 `https://api.ossinsight.io/v1/` 端点
2. **网页抓取** - 当 API 受限或不可用时，回退到抓取 OSSInsight 网页

这种方法确保了对 OSSInsight 功能的最大覆盖，同时尊重公共 API 的速率限制（每个 IP 每小时 600 个请求）。

## 设置

### 使用配置

#### Docker

```json
{
  "mcpServers": { 
    "ossinsight": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "mcp/ossinsight"
      ]
    }
  }
}
```

#### NPX

```json
{
  "mcpServers": {
    "ossinsight": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-ossinsight"
      ]
    }
  }
}
```

## 构建

Docker 构建:

```bash
docker build -t mcp/ossinsight -f src/ossinsight/Dockerfile .
```

## 示例用法

### 获取仓库分析

```
// 获取 VSCode 仓库的分析数据
{
  "owner_repo": "microsoft/vscode"
}
```

### 比较两个仓库

```
// 比较 React 和 Vue
{
  "repo1": "facebook/react",
  "repo2": "vuejs/vue"
}
```

### 自然语言查询

```
// 获取使用自然语言查询数据的链接
{
  "query": "哪些数据库项目在 2023 年获得了最多的星标？"
}
```

## 许可证

此 MCP 服务器基于 MIT 许可证。这意味着您可以自由使用、修改和分发此软件，但需遵守 MIT 许可证的条款和条件。详情请参阅项目存储库中的 LICENSE 文件。