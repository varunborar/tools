// Subnetting utilities for IPv4 CIDR calculations and tree encoding/decoding
// All numbers are 32-bit unsigned integers represented in JS number type.

// Convert integer IPv4 to dotted string
export function inetNtoa(addressInteger) {
  const a = (addressInteger >>> 24) & 0xff;
  const b = (addressInteger >>> 16) & 0xff;
  const c = (addressInteger >>> 8) & 0xff;
  const d = addressInteger & 0xff;
  return `${a}.${b}.${c}.${d}`;
}

// Convert dotted IPv4 string to integer; returns null on invalid input
export function inetAton(addressString) {
  const match = /^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/.exec(
    addressString
  );
  if (!match) return null;
  for (let i = 1; i <= 4; i++) {
    const octet = Number(match[i]);
    if (octet < 0 || octet > 255) return null;
  }
  // Use unsigned operations to avoid negative numbers
  const a = Number(match[1]) >>> 0;
  const b = Number(match[2]) >>> 0;
  const c = Number(match[3]) >>> 0;
  const d = Number(match[4]) >>> 0;
  return (((a << 24) | (b << 16) | (c << 8) | d) >>> 0) >>> 0;
}

// Apply mask bits to produce network address (zero out host bits)
export function networkAddress(addressInteger, maskBits) {
  let ip = addressInteger >>> 0;
  for (let i = 31 - maskBits; i >= 0; i--) {
    // clear host bit i
    ip &= ~(1 << i);
  }
  return ip >>> 0;
}

// Number of addresses in a subnet of given mask
export function subnetAddresses(maskBits) {
  return 2 ** (32 - maskBits);
}

export function subnetLastAddress(subnetAddress, maskBits) {
  return (subnetAddress + subnetAddresses(maskBits) - 1) >>> 0;
}

export function subnetNetmask(maskBits) {
  return networkAddress(0xffffffff >>> 0, maskBits);
}

// Tree structure
// A node is: { depthOfChildren: number, numVisibleChildren: number, children: [Node, Node] | null }
export function createLeafNode() {
  return { depthOfChildren: 0, numVisibleChildren: 0, children: null };
}

// Encode the tree using the legacy format where '1' means node has two children, '0' is leaf
export function nodeToBinaryString(node) {
  if (node.children) {
    return `1${nodeToBinaryString(node.children[0])}${nodeToBinaryString(
      node.children[1]
    )}`;
  }
  return "0";
}

// Convert binary string to compact ascii form: `${length}.${nibbles in hex}`
export function binaryToAscii(encodedBinary) {
  let out = "";
  let curBit = 0;
  let curChar = 0;
  for (let i = 0; i < encodedBinary.length; i++) {
    if (encodedBinary.charAt(i) === "1") {
      curChar |= 1 << curBit;
    }
    curBit++;
    if (curBit > 3) {
      out += curChar.toString(16);
      curChar = 0;
      curBit = 0;
    }
  }
  if (curBit > 0) {
    out += curChar.toString(16);
  }
  return `${encodedBinary.length}.${out}`;
}

export function asciiToBinary(ascii) {
  const re = /^(\d+)\.([0-9a-f]+)$/i;
  const match = re.exec(ascii ?? "");
  if (!match) return null;
  const len = Number(match[1]);
  const hex = match[2].toLowerCase();
  let out = "";
  for (let i = 0; i < len; i++) {
    const ch = parseInt(hex.charAt(Math.floor(i / 4)), 16);
    const pos = i % 4;
    out += ch & (1 << pos) ? "1" : "0";
  }
  return out;
}

// Build tree structure from binary encoding starting at current node; returns remaining string tail
export function loadNodeFromBinary(currentNode, binary) {
  if (binary.charAt(0) === "0") {
    return binary.substring(1);
  }
  currentNode.children = [createLeafNode(), createLeafNode()];
  let rest = loadNodeFromBinary(currentNode.children[0], binary.substring(1));
  rest = loadNodeFromBinary(currentNode.children[1], rest);
  return rest;
}

// Compute numVisibleChildren and depthOfChildren for each node recursively
export function updateNodeAggregates(node) {
  if (!node.children) {
    node.numVisibleChildren = 0;
    node.depthOfChildren = 0;
    return 1;
  }
  const left = updateNodeAggregates(node.children[0]);
  const right = updateNodeAggregates(node.children[1]);
  node.numVisibleChildren = left + right;
  node.depthOfChildren = left + right; // matches legacy behavior
  return node.numVisibleChildren;
}

// Walk leaf nodes in order, producing rows with computed addressing details
export function enumerateLeafSubnets(rootNode, baseAddress, baseMask) {
  const rows = [];
  function walk(node, address, mask) {
    if (node.children) {
      walk(node.children[0], address, mask + 1);
      const nextAddress = (address + subnetAddresses(mask + 1)) >>> 0;
      walk(node.children[1], nextAddress, mask + 1);
    } else {
      const first = address >>> 0;
      const last = subnetLastAddress(address, mask);
      const usableFirst = (first + 1) >>> 0;
      const usableLast = (last - 1) >>> 0;
      let hostCount;
      let addressRange;
      let usableRange;
      if (mask === 32) {
        addressRange = inetNtoa(first);
        usableRange = addressRange;
        hostCount = 1;
      } else if (mask === 31) {
        addressRange = `${inetNtoa(first)} - ${inetNtoa(last)}`;
        usableRange = addressRange;
        hostCount = 2;
      } else {
        addressRange = `${inetNtoa(first)} - ${inetNtoa(last)}`;
        usableRange = `${inetNtoa(usableFirst)} - ${inetNtoa(usableLast)}`;
        hostCount = (usableLast - usableFirst + 1) >>> 0;
      }
      rows.push({
        address,
        mask,
        subnetCidr: `${inetNtoa(address)}/${mask}`,
        netmask: inetNtoa(subnetNetmask(mask)),
        addressRange,
        usableRange,
        hostCount,
        node,
      });
    }
  }
  walk(rootNode, baseAddress, baseMask);
  return rows;
}

// Like enumerateLeafSubnets but also returns a Map of child->parent for join operations
export function enumerateLeafSubnetsWithParents(rootNode, baseAddress, baseMask) {
  const rows = [];
  const parentMap = new Map();
  function walk(node, address, mask, parent) {
    if (parent) parentMap.set(node, parent);
    if (node.children) {
      walk(node.children[0], address, mask + 1, node);
      const nextAddress = (address + subnetAddresses(mask + 1)) >>> 0;
      walk(node.children[1], nextAddress, mask + 1, node);
    } else {
      const first = address >>> 0;
      const last = subnetLastAddress(address, mask);
      const usableFirst = (first + 1) >>> 0;
      const usableLast = (last - 1) >>> 0;
      let hostCount;
      let addressRange;
      let usableRange;
      if (mask === 32) {
        addressRange = inetNtoa(first);
        usableRange = addressRange;
        hostCount = 1;
      } else if (mask === 31) {
        addressRange = `${inetNtoa(first)} - ${inetNtoa(last)}`;
        usableRange = addressRange;
        hostCount = 2;
      } else {
        addressRange = `${inetNtoa(first)} - ${inetNtoa(last)}`;
        usableRange = `${inetNtoa(usableFirst)} - ${inetNtoa(usableLast)}`;
        hostCount = (usableLast - usableFirst + 1) >>> 0;
      }
      rows.push({
        address,
        mask,
        subnetCidr: `${inetNtoa(address)}/${mask}`,
        netmask: inetNtoa(subnetNetmask(mask)),
        addressRange,
        usableRange,
        hostCount,
        node,
      });
    }
  }
  walk(rootNode, baseAddress, baseMask, null);
  return { rows, parentMap };
}

export function divideNode(node) {
  if (!node.children && node) {
    node.children = [createLeafNode(), createLeafNode()];
  }
}

export function joinNode(node) {
  if (node) node.children = null;
}

// Validate and coerce network + mask. Returns { network, mask, error, changed }
export function validateNetworkAndMask(networkStr, maskBits) {
  const parsed = inetAton(networkStr);
  if (parsed === null) {
    return { error: "Invalid network address entered" };
  }
  const mask = Number(maskBits);
  if (!(mask >= 0 && mask <= 32)) {
    return { error: "The network mask you have entered is invalid" };
  }
  const network = networkAddress(parsed, mask);
  const changed = network !== parsed;
  return { network, mask, changed };
}

// Serialize the tree division structure into ascii form suitable for query param
export function serializeDivision(rootNode) {
  const bin = nodeToBinaryString(rootNode);
  return binaryToAscii(bin);
}

// Deserialize division from ascii param into a new root node
export function deserializeDivision(ascii) {
  const bin = asciiToBinary(ascii);
  const root = createLeafNode();
  if (bin && bin !== "0") {
    loadNodeFromBinary(root, bin);
  }
  updateNodeAggregates(root);
  return root;
}

// Export helpers
export function createExportState({ network, mask, rootNode, rows }) {
  const netStr = inetNtoa(network);
  const division = serializeDivision(rootNode);
  const query = `network=${netStr}&mask=${mask}&division=${division}`;
  const tableRows = Array.isArray(rows)
    ? rows.map((r) => ({
        subnet: r.subnetCidr,
        netmask: r.netmask,
        range: r.addressRange,
        usable: r.usableRange,
        hosts: r.hostCount,
      }))
    : undefined;
  return {
    version: 2,
    network: netStr,
    mask,
    division,
    params: { network: netStr, mask, division },
    query,
    rows: tableRows,
  };
}

export function exportAsJsonBlob(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  return blob;
}

export function exportAsCsvBlob(state) {
  if (Array.isArray(state.rows) && state.rows.length > 0) {
    const headers = ["network", "mask", "division", "subnet", "netmask", "range", "usable", "hosts"];
    const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const lines = [headers.join(",")];
    for (const r of state.rows) {
      const values = [state.network, String(state.mask), state.division, r.subnet, r.netmask, r.range, r.usable, String(r.hosts)];
      lines.push(values.map(escape).join(","));
    }
    return new Blob([lines.join("\n")], { type: "text/csv" });
  }
  // fallback minimal CSV
  const headers = ["network", "mask", "division"];
  const values = [state.network, String(state.mask), state.division];
  const csv = `${headers.join(",")}\n${values.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")}`;
  return new Blob([csv], { type: "text/csv" });
}

export async function triggerDownload({ blob, filename }) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function importFromFile(file) {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    // accept legacy fields or structured params/query
    let networkStr = data.network;
    let mask = data.mask;
    let division = data.division;
    if ((!networkStr || mask == null || !division) && data.params) {
      networkStr = data.params.network;
      mask = data.params.mask;
      division = data.params.division;
    }
    if ((!networkStr || mask == null || !division) && typeof data.query === "string") {
      const params = new URLSearchParams(data.query);
      networkStr = networkStr || params.get("network");
      const maskStr = params.get("mask");
      mask = mask != null ? mask : (maskStr != null ? Number(maskStr) : mask);
      division = division || params.get("division");
    }
    return {
      network: inetAton(networkStr),
      mask: Number(mask),
      root: deserializeDivision(division),
    };
  } catch {
    // attempt CSV parse with flexible columns
    const lines = text.trim().split(/\r?\n/);
    if (lines.length >= 2) {
      const header = lines[0]
        .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
        .map((s) => s.replace(/^\"|\"$/g, "").toLowerCase());
      const idxNetwork = header.indexOf("network");
      const idxMask = header.indexOf("mask");
      const idxDivision = header.indexOf("division");
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (!row.trim()) continue;
        const parts = row
          .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
          .map((s) => s.replace(/^\"|\"$/g, ""));
        const networkStr = idxNetwork >= 0 ? parts[idxNetwork] : undefined;
        const maskStr = idxMask >= 0 ? parts[idxMask] : undefined;
        const division = idxDivision >= 0 ? parts[idxDivision] : undefined;
        if (networkStr && maskStr != null && division) {
          return {
            network: inetAton(networkStr),
            mask: Number(maskStr),
            root: deserializeDivision(division),
          };
        }
      }
    }
    throw new Error("Unsupported import format");
  }
}


