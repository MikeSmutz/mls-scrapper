import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

/**
 * Utility functions for data handling in automation scripts
 */

/**
 * Save data to JSON file with timestamp
 */
export async function saveToJSON(
  data: any, 
  filename: string = 'data',
  includeTimestamp: boolean = true
): Promise<string> {
  const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  const fullFilename = `${filename}${timestamp}.json`;
  const filePath = path.join('./data', fullFilename);
  
  // Ensure data directory exists
  await fs.promises.mkdir('./data', { recursive: true });
  
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Data saved to: ${filePath}`);
  return filePath;
}

/**
 * Save data to CSV file
 */
export async function saveToCSV(
  data: any[], 
  filename: string = 'data',
  includeTimestamp: boolean = true
): Promise<string> {
  const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  const fullFilename = `${filename}${timestamp}.csv`;
  const filePath = path.join('./data', fullFilename);
  
  // Ensure data directory exists
  await fs.promises.mkdir('./data', { recursive: true });
  
  if (data.length === 0) {
    throw new Error('No data to save');
  }
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\\n');
  
  await fs.promises.writeFile(filePath, csvContent);
  console.log(`💾 Data saved to: ${filePath}`);
  return filePath;
}

/**
 * Read data from CSV file
 */
export async function readFromCSV(filePath: string): Promise<any[]> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true
  });
  return records;
}

/**
 * Save data to Excel file
 */
export async function saveToExcel(
  data: any[], 
  filename: string = 'data',
  sheetName: string = 'Sheet1',
  includeTimestamp: boolean = true
): Promise<string> {
  const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
  const fullFilename = `${filename}${timestamp}.xlsx`;
  const filePath = path.join('./data', fullFilename);
  
  // Ensure data directory exists
  await fs.promises.mkdir('./data', { recursive: true });
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  XLSX.writeFile(workbook, filePath);
  console.log(`💾 Data saved to: ${filePath}`);
  return filePath;
}

/**
 * Clean and validate scraped data
 */
export function cleanScrapedData(data: any[]): any[] {
  return data.map(item => {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (value !== null && value !== undefined) {
        // Clean strings
        if (typeof value === 'string') {
          cleaned[key] = value
            .trim()
            .replace(/\\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\\n+/g, ' ') // Replace newlines with space
            .replace(/\\t+/g, ' '); // Replace tabs with space
        } else {
          cleaned[key] = value;
        }
      }
    }
    
    return cleaned;
  }).filter(item => Object.keys(item).length > 0); // Remove empty objects
}

/**
 * Generate summary statistics for scraped data
 */
export function generateDataSummary(data: any[]): any {
  if (data.length === 0) {
    return { count: 0, message: 'No data to analyze' };
  }
  
  const summary = {
    totalRecords: data.length,
    fields: {},
    createdAt: new Date().toISOString()
  };
  
  // Analyze each field
  const firstRecord = data[0];
  for (const field of Object.keys(firstRecord)) {
    const values = data.map(record => record[field]).filter(v => v !== null && v !== undefined);
    
    (summary.fields as any)[field] = {
      totalValues: values.length,
      nullValues: data.length - values.length,
      dataType: typeof firstRecord[field],
      sampleValues: values.slice(0, 3) // First 3 values as examples
    };
    
    // Additional stats for strings
    if (typeof firstRecord[field] === 'string') {
      const lengths = values.map(v => v.toString().length);
      (summary.fields as any)[field].avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
      (summary.fields as any)[field].maxLength = Math.max(...lengths);
      (summary.fields as any)[field].minLength = Math.min(...lengths);
    }
  }
  
  return summary;
}

/**
 * Create data directory structure
 */
export async function createDataDirectories(): Promise<void> {
  const directories = [
    './data',
    './data/screenshots',
    './data/exports',
    './data/temp'
  ];
  
  for (const dir of directories) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
}
