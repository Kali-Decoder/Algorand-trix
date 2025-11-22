/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Load projects data from constant folder
function loadProjectsData() {
  try {
    // Try multiple possible paths for projects.json
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'constant', 'projects.json'),
      path.join(process.cwd(), '..', 'src', 'constant', 'projects.json')
    ];
    
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(fileContent);
          
          // Calculate statistics if not already present
          if (data.categories && !data.summary) {
            const categories = Object.keys(data.categories);
            let totalProjects = 0;
            let projectsWithGithub = 0;
            
            categories.forEach((cat: string) => {
              const projects = data.categories[cat] || [];
              totalProjects += projects.length;
              projects.forEach((p: any) => {
                if (p.github) projectsWithGithub++;
              });
            });
            
            data.summary = {
              totalProjects,
              categories,
              projectsWithGithub
            };
          }
          
          return data;
        }
      } catch (err) {
        // Try next path
        continue;
      }
    }
    
    console.warn('Projects data file not found in any expected location');
    return null;
  } catch (error) {
    console.error('Error loading projects data:', error);
    return null;
  }
}

// Search for projects by name and group by category
function searchProjects(projectsData: any, searchTerm: string): Record<string, any[]> {
  const results: Record<string, any[]> = {};
  const lowerSearch = searchTerm.toLowerCase();
  
  Object.keys(projectsData.categories || {}).forEach((category: string) => {
    const projects = projectsData.categories[category] || [];
    projects.forEach((project: any) => {
      if (project.name?.toLowerCase().includes(lowerSearch) ||
          project.description?.toLowerCase().includes(lowerSearch)) {
        if (!results[category]) {
          results[category] = [];
        }
        results[category].push({ ...project, category });
      }
    });
  });
  
  return results;
}

// Get projects by category
function getProjectsByCategory(projectsData: any, categoryName: string): any[] {
  const lowerCategory = categoryName.toLowerCase();
  const categories = Object.keys(projectsData.categories || {});
  
  // Find matching category (case-insensitive)
  const matchingCategory = categories.find((cat: string) => 
    cat.toLowerCase().includes(lowerCategory) || lowerCategory.includes(cat.toLowerCase())
  );
  
  if (matchingCategory) {
    return projectsData.categories[matchingCategory] || [];
  }
  
  return [];
}

// Get projects with GitHub grouped by category
function getProjectsWithGithub(projectsData: any): Record<string, any[]> {
  const results: Record<string, any[]> = {};
  
  Object.keys(projectsData.categories || {}).forEach((category: string) => {
    const projects = projectsData.categories[category] || [];
    projects.forEach((project: any) => {
      if (project.github) {
        if (!results[category]) {
          results[category] = [];
        }
        results[category].push({ ...project, category });
      }
    });
  });
  
  return results;
}

// Format projects grouped by category
function formatProjectsByCategory(projectsByCategory: Record<string, any[]>, limitPerCategory: number = 10): string {
  let response = '';
  const categories = Object.keys(projectsByCategory);
  
  // Sort categories to maintain consistent order
  const sortedCategories = categories.sort();
  
  sortedCategories.forEach((category: string) => {
    const projects = projectsByCategory[category];
    if (projects.length > 0) {
      response += `\n### 📂 ${category}\n\n`;
      response += `*${projects.length} project(s) in this category*\n\n`;
      
      const limitedProjects = projects.slice(0, limitPerCategory);
      limitedProjects.forEach((project: any) => {
        response += formatProject(project) + '\n---\n\n';
      });
      
      if (projects.length > limitPerCategory) {
        response += `*Showing ${limitPerCategory} of ${projects.length} projects in this category.*\n\n`;
      }
    }
  });
  
  return response;
}

// Format project response
function formatProject(project: any, includeCategory: boolean = false): string {
  let formatted = `**${project.name}**`;
  if (includeCategory && project.category) {
    formatted += ` (${project.category})`;
  }
  formatted += '\n\n';
  
  if (project.description) {
    formatted += `${project.description}\n\n`;
  }
  
  const links: string[] = [];
  if (project.website) {
    links.push(`🌐 Website: ${project.website}`);
  }
  if (project.github) {
    links.push(`💻 GitHub: ${project.github}`);
  }
  
  if (links.length > 0) {
    formatted += links.join('\n');
  }
  
  return formatted;
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const lowerText = text.toLowerCase().trim();
    
    // Load ecosystem projects data
    const projectsData = loadProjectsData();
    
    if (!projectsData || !projectsData.summary) {
      return NextResponse.json({ 
        error: 'Projects data not available' 
      }, { status: 500 });
    }
    
    const { totalProjects, categories } = projectsData.summary;
    
    // 1. Handle questions about total number of projects
    if ((lowerText.includes('how many') || 
         lowerText.includes('how much') ||
         lowerText.includes('total') ||
         lowerText.includes('count') ||
         lowerText.includes('number of')) &&
        (lowerText.includes('project') || 
         lowerText.includes('ecosystem') ||
         lowerText.includes('algorand'))) {
      
      const categoryBreakdown = categories.map((cat: string) => {
        const count = projectsData.categories[cat]?.length || 0;
        return `- **${cat}**: ${count} projects`;
      }).join('\n');
      
      return NextResponse.json({ 
        data: `📊 **Algorand Ecosystem Projects Overview**\n\n` +
              `There are **${totalProjects} projects** in the Algorand ecosystem across **${categories.length} categories**.\n\n` +
              `**Breakdown by Category:**\n${categoryBreakdown}\n\n` +
              `You can ask me about:\n` +
              `- List all categories\n` +
              `- Projects in a specific category (e.g., "show me wallets")\n` +
              `- Search for a project by name\n` +
              `- Projects with GitHub repositories\n` +
              `- Project details and links`
      });
    }
    
    // 2. Handle questions about categories
    if (lowerText.includes('categor') || 
        lowerText.includes('list all') ||
        lowerText === 'categories' ||
        lowerText === 'what categories') {
      
      const categoryList = categories.map((cat: string) => {
        const count = projectsData.categories[cat]?.length || 0;
        return `- **${cat}** (${count} projects)`;
      }).join('\n');
      
      return NextResponse.json({ 
        data: `📁 **Available Categories**\n\n${categoryList}\n\n` +
              `Ask me to show projects from any category, for example:\n` +
              `- "Show me projects in Algorand IDEs"\n` +
              `- "List Block Explorers"\n` +
              `- "What projects are in API Services?"`
      });
    }
    
    // 3. Handle questions about projects with GitHub
    if (lowerText.includes('github') || 
        lowerText.includes('open source') ||
        lowerText.includes('source code')) {
      
      const githubProjectsByCategory = getProjectsWithGithub(projectsData);
      const totalCount = Object.values(githubProjectsByCategory).reduce((sum, projects) => sum + projects.length, 0);
      
      // Convert to structured format
      const structuredProjects: any[] = [];
      Object.keys(githubProjectsByCategory).forEach((cat: string) => {
        githubProjectsByCategory[cat].slice(0, 5).forEach((project: any) => {
          structuredProjects.push({
            name: project.name,
            description: project.description || '',
            website: project.website,
            github: project.github,
            category: cat
          });
        });
      });
      
      return NextResponse.json({ 
        data: `💻 **Projects with GitHub Repositories**\n\nFound **${totalCount} projects** with GitHub repositories across **${Object.keys(githubProjectsByCategory).length} categories**.\n\n`,
        projects: structuredProjects,
        projectsByCategory: githubProjectsByCategory,
        totalCount: totalCount
      });
    }
    
    // 4. Handle category-specific requests
    for (const category of categories) {
      const lowerCategory = category.toLowerCase();
      if (lowerText.includes(lowerCategory) || 
          (lowerText.includes('show') && lowerText.includes('project') && 
           categories.some((cat: string) => lowerText.includes(cat.toLowerCase().split(' ')[0]))) ||
          (lowerText.includes('api services') || lowerText.includes('infrastructure'))) {
        
        const categoryProjects = getProjectsByCategory(projectsData, category);
        
        if (categoryProjects.length > 0) {
          // Return structured data for UI rendering
          return NextResponse.json({ 
            data: `📂 **${category}**\n\nFound **${categoryProjects.length} projects** in this category.\n\n`,
            projects: categoryProjects.slice(0, 15).map((p: any) => ({
              name: p.name,
              description: p.description || '',
              website: p.website,
              github: p.github,
              category: category
            })),
            totalCount: categoryProjects.length,
            showingCount: Math.min(15, categoryProjects.length),
            category: category
          });
        }
      }
    }
    
    // 5. Handle project search by name
    const searchKeywords = ['find', 'search', 'show', 'tell me about', 'what is', 'who is'];
    const isSearchQuery = searchKeywords.some(keyword => lowerText.includes(keyword));
    
    if (isSearchQuery || lowerText.length > 3) {
      // Extract potential project name (remove common words)
      const commonWords = ['show', 'me', 'find', 'search', 'for', 'about', 'what', 'is', 'the', 'a', 'an', 'tell', 'list'];
      const words = lowerText.split(' ').filter((word: string) => 
        word.length > 2 && !commonWords.includes(word)
      );
      
      if (words.length > 0) {
        const searchTerm = words.join(' ');
        const resultsByCategory = searchProjects(projectsData, searchTerm);
        const totalCount = Object.values(resultsByCategory).reduce((sum, projects) => sum + projects.length, 0);
        
        if (totalCount > 0) {
          // Convert to structured format
          const structuredProjects: any[] = [];
          Object.keys(resultsByCategory).forEach((cat: string) => {
            resultsByCategory[cat].slice(0, 5).forEach((project: any) => {
              structuredProjects.push({
                name: project.name,
                description: project.description || '',
                website: project.website,
                github: project.github,
                category: cat
              });
            });
          });
          
          return NextResponse.json({ 
            data: `🔍 **Search Results for "${searchTerm}"**\n\nFound **${totalCount} project(s)** across **${Object.keys(resultsByCategory).length} categories**\n\n`,
            projects: structuredProjects,
            projectsByCategory: resultsByCategory,
            totalCount: totalCount,
            searchTerm: searchTerm
          });
        } else {
          return NextResponse.json({ 
            data: `❌ No projects found matching "${searchTerm}".\n\n` +
                  `Try:\n` +
                  `- Asking about categories\n` +
                  `- Searching for a different project name\n` +
                  `- Asking "how many projects are there?"`
          });
        }
      }
    }
    
    // 6. Handle "show all projects" or "list all projects"
    if (lowerText.includes('show all') || 
        lowerText.includes('list all') ||
        lowerText.includes('all projects')) {
      
      let response = `📊 **All Algorand Ecosystem Projects**\n\n`;
      response += `Total: **${totalProjects} projects** across **${categories.length} categories**\n\n`;
      
      // Show all projects organized by category
      const allProjectsByCategory: Record<string, any[]> = {};
      categories.forEach((category: string) => {
        allProjectsByCategory[category] = projectsData.categories[category] || [];
      });
      
      response += formatProjectsByCategory(allProjectsByCategory, 10);
      
      return NextResponse.json({ data: response });
    }
    
    // 7. Default response with helpful information
    return NextResponse.json({ 
      data: `👋 **Welcome to Algorand Ecosystem Projects!**\n\n` +
            `I can help you explore **${totalProjects} projects** across **${categories.length} categories**.\n\n` +
            `**Available Categories:**\n` +
            categories.map((cat: string) => `- ${cat} (${projectsData.categories[cat]?.length || 0} projects)`).join('\n') +
            `\n\n**What would you like to know?**\n\n` +
            `- "How many projects are there?" - Get total count and breakdown\n` +
            `- "List all categories" - See all available categories\n` +
            `- "Show all projects" - Browse all projects organized by category\n` +
            `- "Show me projects in [category name]" - Browse projects by category\n` +
            `- "Find [project name]" - Search for a specific project\n` +
            `- "Projects with GitHub" - See open source projects\n` +
            `- "Tell me about [project name]" - Get detailed project information`
    });
    
  } catch (error: any) {
    console.error('Ecosystem projects API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

