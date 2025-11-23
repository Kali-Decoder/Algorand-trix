// utils/nfd.ts

/**
 * Fetch NFD data by name/ID or by address(es)
 * 
 * @param nameOrId - NFD name (e.g., "myname.algo") or app ID
 * @param viewOrOptions - View type string (legacy) or options object
 * @param viewOrOptions.address - Single address or array of addresses (max 20)
 * @param viewOrOptions.view - View type: "tiny", "thumbnail", "brief", "full"
 * 
 * @returns For address lookup: Object with address keys mapping to NFD data
 *          Example: { "ADDRESS1": { name: "...", ... }, "ADDRESS2": { ... } }
 *          For name/ID lookup: NFD data object
 * 
 * @example
 * // Single address lookup
 * getNfd(undefined, { address: "ABC123..." })
 * 
 * // Multiple addresses lookup (returns object keyed by addresses)
 * getNfd(undefined, { address: ["ABC123...", "DEF456...", "GHI789..."] })
 * 
 * // Name lookup
 * getNfd("myname.algo", "brief")
 */
export async function getNfd(
  nameOrId?: string,
  viewOrOptions?: string | { address?: string | string[]; view?: string }
) {
  const params = new URLSearchParams();
  let url: string;

  const isLegacyCall = typeof viewOrOptions === "string";
  const options = isLegacyCall 
    ? { view: viewOrOptions } 
    : (viewOrOptions || {});

  if (options.address) {
    // Support single address or array of addresses (max 20)
    // Multiple addresses are appended as: ?address=xxx&address=yyy&address=zzz
    // Response will be an object keyed by addresses: { "ADDRESS1": {...}, "ADDRESS2": {...} }
    const addresses = Array.isArray(options.address) ? options.address : [options.address];
    addresses.forEach(addr => params.append("address", addr));
    
    if (options.view) {
      params.append("view", options.view);
    }
    url = `https://api.nf.domains/nfd/lookup?${params.toString()}`;
  } else if (nameOrId) {
    const view = options.view || "brief";
    url = `https://api.nf.domains/nfd/${nameOrId}?view=${view}`;
  } else {
    throw new Error("Either nameOrId or address must be provided");
  }


  console.log("url", url);
  
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "*/*",
    },
    next: { revalidate: 5 },
  });

  return await res.json();
}

export async function reverseLookup(addresses: string[] = [], view: string = "tiny") {
  const params = new URLSearchParams();
  addresses.forEach(addr => params.append("address", addr));
  params.append("view", view);

  const url = `https://api.nf.domains/nfd/lookup?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "*/*",
      "Content-Type": "application/json",
    },
    next: { revalidate: 5 },
  });

  return await res.json();
}

export async function getAllNfdsByAddress(
  address: string,
  state: string = "owned",
  limit: number = 200
) {
  try {
    // Basic validation: Algorand address pattern
    const algAddrPattern = /^[A-Z2-7]{57}[AEIMQUY4]$/;
    if (!algAddrPattern.test(address)) {
      throw new Error("Invalid Algorand address format");
    }

    const params = new URLSearchParams();
    params.append("owner", address);
    params.append("state", state);
    params.append("limit", limit.toString());

    const url = `https://api.nf.domains/nfd/v2/search?${params.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 5 },
    });


    if (!res.ok) {
      throw new Error(`Failed: ${res.status}`);
    }


    return await res.json();
  } catch (err) {
    console.error("Error fetching all NFDs by address:", err);
    return null;
  }
}

