/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { queryLLM } from '@/utils/ai';
import * as fs from 'fs';
import * as path from 'path';

// Load organized projects data
function loadProjectsData() {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), '..', 'backend', 'scraped-data', 'organized-projects.json'),
      path.join(process.cwd(), 'backend', 'scraped-data', 'organized-projects.json'),
      path.join(process.cwd(), '..', '..', 'backend', 'scraped-data', 'organized-projects.json'),
    ];
    
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          return JSON.parse(fileContent);
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

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    // Load ecosystem projects data
    const projectsData = loadProjectsData();
    
    // Create context from projects data
    let context = '';
    if (projectsData) {
      const summary = projectsData.summary;
      context = `You are an AI assistant helping users discover and learn about Algorand ecosystem projects.

Ecosystem Summary:
- Total Projects: ${summary.totalProjects}
- Categories: ${summary.categories.join(', ')}
- Projects with GitHub: ${summary.projectsWithGithub}

Available Categories:
${summary.categories.map((cat: string) => `- ${cat} (${projectsData.categories[cat]?.length || 0} projects)`).join('\n')}

When users ask about projects, you can provide information about:
1. Projects in specific categories
2. Projects with GitHub repositories
3. Specific project details (name, description, links)
4. Recommendations based on use cases

Format your responses in a helpful, conversational way. Include relevant links (GitHub, websites) when available.`;

      // Add sample projects from each category for context
      const sampleProjects: string[] = [];
      for (const category of summary.categories.slice(0, 5)) {
        const projects = projectsData.categories[category] || [];
        if (projects.length > 0) {
          const sample = projects.slice(0, 2);
          sampleProjects.push(`\n${category}:\n${sample.map((p: any) => 
            `- ${p.name}: ${p.description.substring(0, 100)}${p.github ? ` [GitHub: ${p.github}]` : ''}${p.website ? ` [Website: ${p.website}]` : ''}`
          ).join('\n')}`);
        }
      }
      
      if (sampleProjects.length > 0) {
        context += '\n\nSample Projects:\n' + sampleProjects.join('\n');
      }
    } else {
      context = `You are an AI assistant helping users discover and learn about Algorand ecosystem projects. 
      The ecosystem includes projects in categories like Wallets, Block Explorers, SDKs, Applications, Oracles & Bridges, and more.
      Help users find projects that match their needs, provide information about specific projects, and answer questions about the Algorand ecosystem.`;
    }

    const prompt = `${context}\n\nUser Question: ${text}\n\nProvide a helpful response about Algorand ecosystem projects.`;
    
    const response = await queryLLM(prompt);
    return NextResponse.json({ data: response });
  } catch (error: any) {
    console.error('Ecosystem projects API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

