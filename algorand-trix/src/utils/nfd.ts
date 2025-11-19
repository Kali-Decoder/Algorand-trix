// utils/nfd.ts

export async function getNfd(nameOrId: string, view: string = "brief") {
  try {
    const url = `https://api.nf.domains/nfd/${nameOrId}?view=${view}`;
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
    console.error("Error fetching NFD:", err);
    return null;
  }
}

export async function reverseLookup(addresses: string[] = [], view: string = "tiny") {
  try {
    const params = new URLSearchParams();
    addresses.forEach(addr => params.append("address", addr));
    params.append("view", view);

    const url = `https://api.nf.domains/nfd/lookup?${params.toString()}`;
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
    console.error("Error reverse lookup:", err);
    return null;
  }
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

