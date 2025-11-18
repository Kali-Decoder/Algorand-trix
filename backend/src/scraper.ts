import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import type { Element } from 'cheerio';

interface ScrapeConfig {
  url: string;
  selectors?: {
    [key: string]: string; // e.g., { title: 'h1', price: '.price', description: '.description' }
  };
  headers?: Record<string, string>;
  outputFile?: string;
  format?: 'json' | 'csv' | 'txt';
}

interface ScrapeResult {
  url: string;
  timestamp: string;
  data: Record<string, any>;
  rawHtml?: string;
}

/**
 * Scrapes data from a specific URL
 * @param config - Configuration object with URL and optional selectors
 * @returns Scraped data as an object
 */
export async function scrapeData(config: ScrapeConfig): Promise<ScrapeResult> {
  const { url, selectors = {}, headers = {}, outputFile, format = 'json' } = config;

  try {
    console.log(`🌐 Scraping data from: ${url}`);

    // Make HTTP request
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...headers,
      },
      timeout: 30000, // 30 seconds timeout
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Extract data based on selectors
    const extractedData: Record<string, any> = {};

    if (Object.keys(selectors).length === 0) {
      // If no selectors provided, extract common elements
      extractedData.title = $('title').text().trim();
      extractedData.headings = {
        h1: $('h1').map((_: number, el: Element) => $(el).text().trim()).get(),
        h2: $('h2').map((_: number, el: Element) => $(el).text().trim()).get(),
      };
      extractedData.links = $('a')
        .map((_: number, el: Element) => ({
          text: $(el).text().trim(),
          href: $(el).attr('href'),
        }))
        .get()
        .filter((link: { text: string; href?: string }) => link.text && link.href);
      extractedData.images = $('img')
        .map((_: number, el: Element) => ({
          alt: $(el).attr('alt'),
          src: $(el).attr('src'),
        }))
        .get();
      extractedData.text = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 1000);
    } else {
      // Extract data using provided selectors
      for (const [key, selector] of Object.entries(selectors)) {
        const elements = $(selector);
        
        if (elements.length === 0) {
          extractedData[key] = null;
        } else if (elements.length === 1) {
          // Single element - get text or attribute
          const text = elements.text().trim();
          const href = elements.attr('href');
          const src = elements.attr('src');
          extractedData[key] = text || href || src || elements.html()?.trim();
        } else {
          // Multiple elements - return array
          extractedData[key] = elements
            .map((_: number, el: Element) => {
              const $el = $(el);
              return {
                text: $el.text().trim(),
                html: $el.html()?.trim(),
                href: $el.attr('href'),
                src: $el.attr('src'),
              };
            })
            .get();
        }
      }
    }

    const result: ScrapeResult = {
      url,
      timestamp: new Date().toISOString(),
      data: extractedData,
    };

    // Save to file if outputFile is specified
    if (outputFile) {
      await saveToFile(result, outputFile, format);
    }

    console.log('✅ Scraping completed successfully!');
    return result;
  } catch (error: unknown) {
    console.error('❌ Error scraping data:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.message;
      throw new Error(`HTTP Error: ${status} - ${message}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while scraping');
  }
}

/**
 * Saves scraped data to a file
 */
async function saveToFile(
  result: ScrapeResult,
  outputFile: string,
  format: 'json' | 'csv' | 'txt'
): Promise<void> {
  const outputPath = path.resolve(outputFile);
  const outputDir = path.dirname(outputPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let content: string;

  switch (format) {
    case 'json':
      content = JSON.stringify(result, null, 2);
      break;
    case 'csv':
      content = convertToCSV(result.data);
      break;
    case 'txt':
      content = convertToTXT(result);
      break;
    default:
      content = JSON.stringify(result, null, 2);
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`💾 Data saved to: ${outputPath}`);
}

/**
 * Converts data object to CSV format
 */
function convertToCSV(data: Record<string, any>): string {
  const rows: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      rows.push(`${key},${JSON.stringify(value)}`);
    } else if (typeof value === 'object' && value !== null) {
      rows.push(`${key},${JSON.stringify(value)}`);
    } else {
      rows.push(`${key},"${String(value).replace(/"/g, '""')}"`);
    }
  }
  
  return 'Key,Value\n' + rows.join('\n');
}

/**
 * Converts result to readable text format
 */
function convertToTXT(result: ScrapeResult): string {
  let text = `Scraped Data from: ${result.url}\n`;
  text += `Timestamp: ${result.timestamp}\n`;
  text += '='.repeat(50) + '\n\n';
  
  for (const [key, value] of Object.entries(result.data)) {
    text += `${key}:\n`;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        text += `  [${index}]: ${JSON.stringify(item, null, 2)}\n`;
      });
    } else if (typeof value === 'object' && value !== null) {
      text += `  ${JSON.stringify(value, null, 2)}\n`;
    } else {
      text += `  ${value}\n`;
    }
    text += '\n';
  }
  
  return text;
}

/**
 * Main function to run the scraper
 */
async function main() {
  // Example usage - modify this with your specific URL and selectors
  const config: ScrapeConfig = {
    url: process.env.SCRAPE_URL || process.argv[2] || 'https://example.com',
    selectors: {
      // Add your CSS selectors here
      // Example:
      // title: 'h1',
      // price: '.price',
      // description: '.description',
    },
    outputFile: './scraped-data/output.json',
    format: 'json',
  };

  try {
    const result = await scrapeData(config);
    console.log('\n📊 Scraped Data:');
    console.log(JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('Failed to scrape data:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();

