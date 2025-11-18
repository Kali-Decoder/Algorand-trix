import * as fs from 'fs';
import * as path from 'path';

interface Project {
  name: string;
  description: string;
  github?: string;
  website?: string;
  category: string;
  logo?: string;
}

interface OrganizedData {
  categories: {
    [category: string]: Project[];
  };
  summary: {
    totalProjects: number;
    categories: string[];
    projectsWithGithub: number;
  };
}

/**
 * Extracts project name from link text
 */
function extractProjectName(text: string): string {
  // Handle "Featured Project" entries - extract the actual project name
  if (text.includes('Featured Project')) {
    // Look for project name after "Featured Project" - usually on a new line
    const lines = text.split('\n').map(line => line.trim()).filter(line => line && line !== 'Featured Project');
    // Find the first line that looks like a project name (not empty, not too long, has capital letters)
    for (const line of lines) {
      if (line.length > 2 && line.length < 100 && /[A-Z]/.test(line)) {
        return line;
      }
    }
  }
  
  // Regular project name extraction
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  // Skip common navigation text
  const skipWords = ['Featured Project', 'Sign In', 'Sign Up', 'Tutorial', 'Solution', 'Article', 'Submit'];
  for (const line of lines) {
    if (line && !skipWords.includes(line) && line.length > 2 && line.length < 100) {
      return line;
    }
  }
  
  return text.trim().substring(0, 100);
}

/**
 * Extracts description from link text
 */
function extractDescription(text: string): string {
  const name = extractProjectName(text);
  // Remove the name from text to get description
  let description = text.replace(name, '').trim();
  
  // Clean up common prefixes
  description = description.replace(/^Featured Project\s*/i, '');
  description = description.replace(/^\s*\n\s*/g, '');
  
  // Split by newlines and join
  const lines = description.split('\n').map(line => line.trim()).filter(line => line && line.length > 10);
  
  if (lines.length > 0) {
    return lines.join(' ').trim();
  }
  
  return '';
}

/**
 * Checks if URL is a GitHub link
 */
function isGitHubUrl(url: string): boolean {
  return url.includes('github.com');
}

/**
 * Checks if URL is a website (not GitHub)
 */
function isWebsiteUrl(url: string): boolean {
  return !isGitHubUrl(url) && (url.startsWith('http://') || url.startsWith('https://'));
}

/**
 * Processes scraped data and organizes it by category
 */
export function processScrapedData(inputFile: string, outputFile?: string): OrganizedData {
  console.log(`📖 Reading scraped data from: ${inputFile}`);
  
  const fileContent = fs.readFileSync(inputFile, 'utf-8');
  const scrapedData = JSON.parse(fileContent);
  
  const categories = scrapedData.data.headings?.h2 || [];
  const links = scrapedData.data.links || [];
  const images = scrapedData.data.images || [];
  
  // Create a map of image filenames to URLs for logo matching
  const logoMap: { [key: string]: string } = {};
  images.forEach((img: { alt?: string; src?: string }) => {
    if (img.src && img.alt) {
      // Extract project name from image filename or alt text
      const filename = path.basename(img.src);
      const projectName = filename.split('.')[0].toLowerCase();
      logoMap[projectName] = img.src;
    }
  });
  
  // Organize projects by category
  const organizedProjects: { [category: string]: Project[] } = {};
  let currentCategory = 'Uncategorized';
  
  // Initialize all categories
  categories.forEach((cat: string) => {
    organizedProjects[cat] = [];
  });
  organizedProjects['Uncategorized'] = [];
  
  // Process links to extract project information
  const processedProjects: Project[] = [];
  
  links.forEach((link: { text: string; href?: string }) => {
    if (!link.href || !link.text) return;
    
    // Skip navigation and non-project links
    const skipPatterns = [
      'developer.algorand.org',
      'discord.com',
      'forum.algorand.org',
      'metrics.algorand.org',
      'github.com/algorand/', // Official Algorand repos
      '/ecosystem-projects',
      '/docs/',
      '/tutorials/',
      '/bootcamps/',
      '/solutions/',
      '/articles/',
      '/events/',
    ];
    
    const shouldSkip = skipPatterns.some(pattern => link.href?.includes(pattern));
    if (shouldSkip) return;
    
    const name = extractProjectName(link.text);
    const description = extractDescription(link.text);
    
    // Skip if name is too generic or looks like navigation
    if (name.length < 2 || name.length > 100) return;
    
    const project: Project = {
      name,
      description,
      category: currentCategory,
    };
    
    // Determine if it's GitHub or website
    if (isGitHubUrl(link.href)) {
      project.github = link.href;
    } else if (isWebsiteUrl(link.href)) {
      project.website = link.href;
    }
    
    // Try to find logo
    const nameLower = name.toLowerCase().replace(/\s+/g, '');
    for (const [key, logoUrl] of Object.entries(logoMap)) {
      if (key.includes(nameLower) || nameLower.includes(key)) {
        project.logo = logoUrl;
        break;
      }
    }
    
    processedProjects.push(project);
  });
  
  // Categorize projects based on keywords in description or name
  processedProjects.forEach(project => {
    const nameLower = project.name.toLowerCase();
    const descLower = project.description.toLowerCase();
    const combined = `${nameLower} ${descLower}`;
    
    let assigned = false;
    
    // Match projects to categories based on keywords
    for (const category of categories) {
      const categoryLower = category.toLowerCase();
      const categoryKeywords = categoryLower.split(' ');
      
      // Check if project matches category
      if (categoryKeywords.some(keyword => combined.includes(keyword))) {
        if (!organizedProjects[category]) {
          organizedProjects[category] = [];
        }
        project.category = category;
        organizedProjects[category].push(project);
        assigned = true;
        break;
      }
    }
    
    // Special keyword matching for better categorization
    if (!assigned) {
      if (combined.includes('wallet') || combined.includes('defly') || combined.includes('pera') || combined.includes('exodus')) {
        project.category = 'Wallets';
        organizedProjects['Wallets'].push(project);
      } else if (combined.includes('explorer') || combined.includes('blockchain explorer') || combined.includes('block explorer')) {
        project.category = 'Block Explorers';
        organizedProjects['Block Explorers'].push(project);
      } else if (combined.includes('sdk') || combined.includes('library') || combined.includes('package')) {
        project.category = 'SDKs';
        if (!organizedProjects['SDKs']) organizedProjects['SDKs'] = [];
        organizedProjects['SDKs'].push(project);
      } else if (combined.includes('nft') || combined.includes('marketplace')) {
        project.category = 'Applications';
        organizedProjects['Applications'].push(project);
      } else if (combined.includes('dex') || combined.includes('swap') || combined.includes('trading')) {
        project.category = 'Applications';
        organizedProjects['Applications'].push(project);
      } else if (combined.includes('oracle') || combined.includes('bridge')) {
        project.category = 'Oracles & Bridges';
        organizedProjects['Oracles & Bridges'].push(project);
      } else if (combined.includes('api') || combined.includes('service') || combined.includes('infrastructure')) {
        project.category = 'API Services and Infrastructure';
        organizedProjects['API Services and Infrastructure'].push(project);
      } else {
        project.category = 'Uncategorized';
        organizedProjects['Uncategorized'].push(project);
      }
    }
  });
  
  // Remove empty categories
  Object.keys(organizedProjects).forEach(category => {
    if (organizedProjects[category].length === 0) {
      delete organizedProjects[category];
    }
  });
  
  // Calculate summary
  const totalProjects = processedProjects.length;
  const projectsWithGithub = processedProjects.filter(p => p.github).length;
  const categoryList = Object.keys(organizedProjects);
  
  const result: OrganizedData = {
    categories: organizedProjects,
    summary: {
      totalProjects,
      categories: categoryList,
      projectsWithGithub,
    },
  };
  
  // Save to file if output file is specified
  if (outputFile) {
    const outputPath = path.resolve(outputFile);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`💾 Organized data saved to: ${outputPath}`);
  }
  
  return result;
}

/**
 * Generates a readable markdown report
 */
export function generateMarkdownReport(data: OrganizedData, outputFile?: string): string {
  let markdown = '# Algorand Ecosystem Projects\n\n';
  markdown += `**Total Projects:** ${data.summary.totalProjects}\n`;
  markdown += `**Projects with GitHub:** ${data.summary.projectsWithGithub}\n`;
  markdown += `**Categories:** ${data.summary.categories.length}\n\n`;
  markdown += '---\n\n';
  
  // Sort categories alphabetically
  const sortedCategories = Object.keys(data.categories).sort();
  
  sortedCategories.forEach(category => {
    markdown += `## ${category}\n\n`;
    markdown += `*${data.categories[category].length} project(s)*\n\n`;
    
    data.categories[category].forEach((project, index) => {
      markdown += `### ${index + 1}. ${project.name}\n\n`;
      
      if (project.description) {
        markdown += `**Description:** ${project.description}\n\n`;
      }
      
      markdown += '**Links:**\n';
      if (project.github) {
        markdown += `- 🔗 [GitHub](${project.github})\n`;
      }
      if (project.website) {
        markdown += `- 🌐 [Website](${project.website})\n`;
      }
      if (project.logo) {
        markdown += `- 🖼️ [Logo](${project.logo})\n`;
      }
      
      markdown += '\n';
    });
    
    markdown += '---\n\n';
  });
  
  if (outputFile) {
    const outputPath = path.resolve(outputFile);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`📄 Markdown report saved to: ${outputFile}`);
  }
  
  return markdown;
}

/**
 * Main function
 */
function main() {
  const inputFile = process.argv[2] || './scraped-data/output.json';
  const outputJson = process.argv[3] || './scraped-data/organized-projects.json';
  const outputMarkdown = process.argv[4] || './scraped-data/projects-report.md';
  
  try {
    console.log('🔄 Processing scraped data...\n');
    
    const organizedData = processScrapedData(inputFile, outputJson);
    
    console.log('\n📊 Summary:');
    console.log(`  Total Projects: ${organizedData.summary.totalProjects}`);
    console.log(`  Categories: ${organizedData.summary.categories.length}`);
    console.log(`  Projects with GitHub: ${organizedData.summary.projectsWithGithub}`);
    console.log('\n📁 Categories:');
    organizedData.summary.categories.forEach(cat => {
      console.log(`  - ${cat} (${organizedData.categories[cat].length} projects)`);
    });
    
    console.log('\n📝 Generating markdown report...');
    generateMarkdownReport(organizedData, outputMarkdown);
    
    console.log('\n✅ Processing complete!');
  } catch (error) {
    console.error('❌ Error processing data:', error);
    process.exit(1);
  }
}

// Run if executed directly
main();

