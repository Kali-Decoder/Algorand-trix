/**
 * Backend entry point for Algorand-trix
 * This file can be extended to add more backend services
 */

import { scrapeData } from './scraper';
import type { ScrapeConfig } from './scraper';
import { processScrapedData, generateMarkdownReport } from './data-processor';

console.log('🚀 Algorand-trix Backend Server');
console.log('Available services: Web Scraper, Data Processor\n');

// Export services for use in other modules
export { scrapeData, processScrapedData, generateMarkdownReport };
export type { ScrapeConfig };

// Example: You can add Express server, API routes, etc. here
// import express from 'express';
// const app = express();
// app.listen(3001, () => console.log('Backend server running on port 3001'));

