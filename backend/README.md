# Algorand-trix Backend

Backend services for Algorand-trix including web scraping and data processing utilities.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory (optional):

```env
SCRAPE_URL=https://example.com
```

### 3. Run the Scraper

```bash
# Run scraper with URL as argument
npm run scrape https://example.com

# Or use environment variable
SCRAPE_URL=https://example.com npm run scrape
```

### 4. Process Scraped Data

After scraping data, organize it into readable format:

```bash
# Process the default output.json file
npm run process

# Or specify custom input/output files
npm run process ./scraped-data/output.json ./scraped-data/organized.json ./scraped-data/report.md
```

### 5. Development Mode

```bash
# Watch mode for development
npm run dev
```

### 6. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts          # Main entry point
│   ├── scraper.ts        # Web scraping utility
│   └── data-processor.ts # Data organization and processing
├── scraped-data/         # Output directory for scraped and processed data
│   ├── output.json       # Raw scraped data
│   ├── organized-projects.json # Organized project data
│   └── projects-report.md # Markdown report
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with watch mode
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run scrape` - Run the web scraper
- `npm run process` - Process and organize scraped data
- `npm run lint` - Run ESLint

## 📝 Usage Examples

### Web Scraping

```bash
# Scrape a website
npm run scrape https://developer.algorand.org/ecosystem-projects/

# The output will be saved to ./scraped-data/output.json
```

### Data Processing

After scraping, process the data to organize it:

```bash
# Process scraped data
npm run process

# This will create:
# - organized-projects.json (structured JSON with categories)
# - projects-report.md (readable markdown report)
```

### Output Format

The data processor organizes projects by:
- **Name** - Project name
- **Description** - Project description
- **GitHub** - GitHub repository URL (if available)
- **Website** - Project website URL
- **Category** - Project category (Wallets, Block Explorers, SDKs, etc.)
- **Logo** - Project logo URL (if available)

## 🔌 API Reference

### `scrapeData(config: ScrapeConfig): Promise<ScrapeResult>`

Scrapes data from a URL and returns structured data.

#### Parameters

- `config.url` (string, required) - URL to scrape
- `config.selectors` (object, optional) - CSS selectors for specific data extraction
- `config.headers` (object, optional) - Custom HTTP headers
- `config.outputFile` (string, optional) - Path to save output file
- `config.format` ('json' | 'csv' | 'txt', optional) - Output format (default: 'json')

### `processScrapedData(inputFile: string, outputFile?: string): OrganizedData`

Processes scraped JSON data and organizes projects by category.

#### Parameters

- `inputFile` (string, required) - Path to scraped JSON file
- `outputFile` (string, optional) - Path to save organized JSON

#### Returns

```typescript
{
  categories: {
    [category: string]: Project[];
  };
  summary: {
    totalProjects: number;
    categories: string[];
    projectsWithGithub: number;
  };
}
```

### `generateMarkdownReport(data: OrganizedData, outputFile?: string): string`

Generates a readable markdown report from organized data.

## 📦 Dependencies

- **axios** - HTTP client for making requests
- **cheerio** - HTML parsing and manipulation
- **dotenv** - Environment variable management

## 🛠️ Development

### TypeScript Configuration

The backend uses TypeScript with strict type checking. Configuration is in `tsconfig.json`.

### Adding New Services

1. Create a new file in `src/` directory
2. Export functions/types from the file
3. Import and use in `src/index.ts` if needed
4. Add any new dependencies to `package.json`

## 📊 Data Processing Features

The data processor automatically:

1. **Extracts Project Information**
   - Project names (handles "Featured Project" entries)
   - Descriptions
   - GitHub and website URLs
   - Logos (when available)

2. **Categorizes Projects**
   - Matches projects to categories based on keywords
   - Categories include: Wallets, Block Explorers, SDKs, Applications, Oracles & Bridges, etc.

3. **Generates Reports**
   - JSON format for programmatic access
   - Markdown format for human-readable reports

## 📄 License

ISC
