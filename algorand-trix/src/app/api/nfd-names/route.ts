/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getNfd, reverseLookup, getAllNfdsByAddress } from '@/utils/nfd';

export async function POST(req: Request) {
  try {
    const { text, view, operation } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid NFD name or Algorand address' },
        { status: 400 }
      );
    }

    const input = text.trim();
    
    // Validate and use provided view or default to "brief"
    const validViewTypes = ["tiny", "thumbnail", "brief", "full"];
    const viewType = (view && validViewTypes.includes(view.toLowerCase())) 
      ? view.toLowerCase() 
      : "brief";

    const addressPattern = /^[A-Z2-7]{57}[AEIMQUY4]$/i;
    const addressPattern58 = /^[A-Z2-7]{58}$/i;
    
    let result: any = null;
    let lookupType: 'name' | 'address' | 'all-nfds' | 'unknown' = 'unknown';
    
    // Use the operation type provided by the client
    const operationType = operation || 'auto';
    console.log("operationType", operationType);
    
    // Operation 1: getAllNfds - Get all NFD names associated with an address
    if (operationType === 'getAllNfds') {
      // Validate address
      if (!addressPattern.test(input) && !addressPattern58.test(input)) {
        return NextResponse.json(
          { error: 'Please provide a valid Algorand address to get all NFDs' },
          { status: 400 }
        );
      }
      
      try {
        result = await getAllNfdsByAddress(input, "owned", 200);
        lookupType = 'all-nfds';
      } catch (error) {
        console.error('Error in getAllNfdsByAddress:', error);
        return NextResponse.json(
          { error: 'Failed to lookup all NFDs for this address' },
          { status: 500 }
        );
      }
    }


    // Operation 2: resolveAddress - Resolve an address to get primary NFD name(s)
    else if (operationType === 'resolveAddress') {
      
      // Validate address
      if (!addressPattern.test(input) && !addressPattern58.test(input)) {
        return NextResponse.json(
          { error: 'Please provide a valid Algorand address to resolve' },
          { status: 400 }
        );
      }
      
      try {
        result = await getNfd(undefined, { address: input, view: viewType });
        
        console.log("result before extraction", result);
        console.log("input address", input);
        
        // Handle address lookup response structure: { "ADDRESS": { ...NFD data... } }
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          // Check if result has the address as a key (exact match)
          if (result[input]) {
            result = result[input]; // Extract NFD data for the address
            console.log("extracted result", result);
          } else {
            // Try to find the address key (case-insensitive or partial match)
            const resultKeys = Object.keys(result);
            console.log("result keys", resultKeys);
            
            if (resultKeys.length === 0) {
              // Empty object means no NFD found
              result = null;
            } else {
              // Use the first key (should be the address we queried)
              const firstKey = resultKeys[0];
              result = result[firstKey];
              console.log("using first key", firstKey, "extracted result", result);
            }
          }
        }
        
        lookupType = 'address';
      } catch (error) {
        console.error('Error in resolveAddress:', error);
        return NextResponse.json(
          { error: 'Failed to resolve address to NFD name' },
          { status: 500 }
        );
      }
    }
    // Operation 3: reverseLookup - Reverse lookup an NFD name to get its address
    else if (operationType === 'reverseLookup') {
      // Input should be an NFD name (not an address)
      if (addressPattern.test(input) || addressPattern58.test(input)) {
        return NextResponse.json(
          { error: 'Please provide an NFD name (e.g., myname.algo) for reverse lookup, not an address' },
          { status: 400 }
        );
      }
      
      // Validate that input looks like an NFD name (ends with .algo) or is numeric
      const nfdNamePattern = /^(.+\.algo)|(\d+)$/i;
      if (!nfdNamePattern.test(input)) {
        return NextResponse.json(
          { error: 'Invalid NFD name format. Please provide a name ending in .algo (e.g., myname.algo) or a numeric ID' },
          { status: 400 }
        );
      }
      
      try {
        result = await getNfd(input, viewType);
        
        // Check if API returned an error object
        if (result && typeof result === 'object' && result.name === 'invalid_pattern') {
          return NextResponse.json(
            { error: 'Invalid NFD name format. Please provide a name ending in .algo (e.g., myname.algo) or a numeric ID' },
            { status: 400 }
          );
        }
        
        lookupType = 'name';
      } catch (error: any) {
        console.error('Error in reverseLookup:', error);
        // Check if error is from API validation
        if (error?.name === 'invalid_pattern' || error?.message?.includes('nameOrID must match')) {
          return NextResponse.json(
            { error: 'Invalid NFD name format. Please provide a name ending in .algo (e.g., myname.algo) or a numeric ID' },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: 'Failed to reverse lookup NFD name to address' },
          { status: 500 }
        );
      }
    }
    else {
      // Auto-detect operation type (fallback for backward compatibility)
      const lowerInput = input.toLowerCase();
      const wantsAllNfds = lowerInput.includes('all') || 
                           lowerInput.includes('list') || 
                           lowerInput.includes('show all') ||
                           lowerInput.includes('get all');
      
      if (wantsAllNfds) {
        // Extract address from text
        const addressMatch = input.match(/([A-Z2-7]{57}[AEIMQUY4]|[A-Z2-7]{58})/i);
        const extractedAddress = addressMatch ? addressMatch[1] : 
                                ((addressPattern.test(input) || addressPattern58.test(input)) ? input : null);
        
        if (!extractedAddress) {
          return NextResponse.json(
            { error: 'Please provide a valid Algorand address to get all NFDs' },
            { status: 400 }
          );
        }
        
        try {
          result = await getAllNfdsByAddress(extractedAddress, "owned", 200);
          lookupType = 'all-nfds';
        } catch (error) {
          console.error('Error in getAllNfdsByAddress:', error);
          return NextResponse.json(
            { error: 'Failed to lookup all NFDs for this address' },
            { status: 500 }
          );
        }
      } else if (addressPattern.test(input) || addressPattern58.test(input)) {
        // If it's an address, default to resolveAddress
        try {
          result = await getNfd(undefined, { address: input, view: viewType });
          
          // Handle address lookup response structure: { "ADDRESS": { ...NFD data... } }
          if (result && typeof result === 'object' && !Array.isArray(result)) {
            // Check if result has the address as a key
            if (result[input]) {
              result = result[input]; // Extract NFD data for the address
            } else if (Object.keys(result).length === 0) {
              // Empty object means no NFD found
              result = null;
            } else {
              // If there are other keys, use the first one (shouldn't happen for single address lookup)
              const firstKey = Object.keys(result)[0];
              result = result[firstKey];
            }
          }
          
          lookupType = 'address';
        } catch (error) {
          console.error('Error in resolveAddress:', error);
          return NextResponse.json(
            { error: 'Failed to resolve address to NFD name' },
            { status: 500 }
          );
        }
      } else {
        // If it's a name, default to reverseLookup (name to address)
        // Validate that input looks like an NFD name (ends with .algo) or is numeric
        const nfdNamePattern = /^(.+\.algo)|(\d+)$/i;
        if (!nfdNamePattern.test(input)) {
          return NextResponse.json(
            { error: 'Invalid input. Please provide a valid Algorand address, NFD name (ending in .algo), or numeric ID' },
            { status: 400 }
          );
        }
        
        try {
          result = await getNfd(input, viewType);
          
          // Check if API returned an error object
          if (result && typeof result === 'object' && result.name === 'invalid_pattern') {
            return NextResponse.json(
              { error: 'Invalid NFD name format. Please provide a name ending in .algo (e.g., myname.algo) or a numeric ID' },
              { status: 400 }
            );
          }
          
          lookupType = 'name';
        } catch (error: any) {
          console.error('Error in reverseLookup:', error);
          // Check if error is from API validation
          if (error?.name === 'invalid_pattern' || error?.message?.includes('nameOrID must match')) {
            return NextResponse.json(
              { error: 'Invalid NFD name format. Please provide a name ending in .algo (e.g., myname.algo) or a numeric ID' },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: 'Failed to reverse lookup NFD name to address' },
            { status: 500 }
          );
        }
      }
    }
    
    // Format response
    console.log("final result before response", result);
    console.log("lookupType", lookupType);
    
    if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
      return NextResponse.json(
        { 
          error: lookupType === 'address' || lookupType === 'all-nfds'
            ? 'No NFD names found for this address' 
            : 'NFD name not found'
        },
        { status: 404 }
      );
    }
    
    // Handle getAllNfdsByAddress response structure
    if (lookupType === 'all-nfds' && result && result.nfds) {
      // The API returns { nfds: [], total: number }
      result = result.nfds;
    }
    
    // Return the actual NFD data
    return NextResponse.json({ 
      data: result,
      lookupType,
      input 
    });
  } catch (error: any) {
    console.error('NFD names API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

