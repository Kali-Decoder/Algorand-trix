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
    
    // Use the operation type provided by the client, or determine it from input
    const operationType = operation || 'auto';
    
    // Handle based on explicit operation type
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
        console.log("result", result);
        lookupType = 'all-nfds';
      } catch (error) {
        console.error('Error in getAllNfdsByAddress:', error);
        return NextResponse.json(
          { error: 'Failed to lookup all NFDs for this address' },
          { status: 500 }
        );
      }
    }
    else if (operationType === 'reverseLookup') {
      // Validate address
      if (!addressPattern.test(input) && !addressPattern58.test(input)) {
        return NextResponse.json(
          { error: 'Please provide a valid Algorand address for reverse lookup' },
          { status: 400 }
        );
      }
      
      try {
        result = await reverseLookup([input], viewType);
        lookupType = 'address';
        
        // If reverseLookup returns empty or null, try getAllNfdsByAddress as fallback
        if (!result || (Array.isArray(result) && result.length === 0)) {
          result = await getAllNfdsByAddress(input, "owned", 200);
          lookupType = 'all-nfds';
        }
      } catch (error) {
        console.error('Error in reverseLookup:', error);
        return NextResponse.json(
          { error: 'Failed to lookup NFD names for this address' },
          { status: 500 }
        );
      }
    }
    else if (operationType === 'resolveName') {
      try {
        result = await getNfd(input, viewType);
        lookupType = 'name';
        console.log("result", result);
      } catch (error) {
        console.error('Error in getNfd:', error);
        return NextResponse.json(
          { error: 'Failed to lookup NFD information' },
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
        try {
          result = await reverseLookup([input], viewType);
          lookupType = 'address';
          
          if (!result || (Array.isArray(result) && result.length === 0)) {
            result = await getAllNfdsByAddress(input, "owned", 200);
            lookupType = 'all-nfds';
          }
        } catch (error) {
          console.error('Error in address lookup:', error);
          return NextResponse.json(
            { error: 'Failed to lookup NFD names for this address' },
            { status: 500 }
          );
        }
      } else {
        try {
          result = await getNfd(input, viewType);
          lookupType = 'name';
        } catch (error) {
          console.error('Error in NFD name lookup:', error);
          return NextResponse.json(
            { error: 'Failed to lookup NFD information' },
            { status: 500 }
          );
        }
      }
    }
    
    // Format response
    if (!result) {
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

