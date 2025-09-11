const accountabstraction = `
<table class="w-full border-collapse border border-gray-700 text-white">
  <thead>
    <tr class="bg-gray-900 text-left">
      <th class="p-3 border border-gray-700">Account Type</th>
      <th class="p-3 border border-gray-700">Details</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Standard (Single Signature)</td>
      <td class="p-3 border border-gray-700">
        Controlled by one private key or mnemonic; signs transactions via signature.
      </td>
    </tr>
    <tr class="bg-gray-900">
      <td class="p-3 border border-gray-700">Multisignature</td>
      <td class="p-3 border border-gray-700">
        Multiple keys with a signing threshold; requires multiple signatures for transactions.
      </td>
    </tr>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Smart Signature (LogicSig)</td>
      <td class="p-3 border border-gray-700">
        Stateless TEAL-controlled contract accounts; no private key; compiled program maps to an address.
      </td>
    </tr>
    <tr class="bg-gray-900">
      <td class="p-3 border border-gray-700">Application Accounts</td>
      <td class="p-3 border border-gray-700">
        On-chain account associated with an application ID; can hold/send assets via inner transactions.
      </td>
    </tr>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Rekeyed Accounts</td>
      <td class="p-3 border border-gray-700">
        An address whose signing authority is delegated to a different key/account.
      </td>
    </tr>
    <tr class="bg-gray-900">
      <td class="p-3 border border-gray-700">KMD-managed Accounts</td>
      <td class="p-3 border border-gray-700">
        Keys stored and accessed via the Key Management Daemon for signing transactions.
      </td>
    </tr>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Transaction Signer Abstractions</td>
      <td class="p-3 border border-gray-700">
        Helpers for composing transactions: SigningAccount, LogicSigAccount, MultisigAccount, and generic TransactionSignerAccount.
      </td>
    </tr>
  </tbody>
</table>
`;



const oracle = `<table class="w-full border-collapse border border-gray-700 text-white">
  <thead>
    <tr class="bg-gray-900 text-left">
      <th class="p-3 border border-gray-700">Oracle</th>
      <th class="p-3 border border-gray-700">Details</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Folks Finance xChain App</td>
      <td class="p-3 border border-gray-700">
        Cross-chain oracle integration <br/>
        <a href="https://docs.xapp.folks.finance/technical-details/oracle" target="_blank" class="text-blue-400 hover:underline">Docs</a> <br/>
        <code class="bg-gray-800 text-gray-300 p-1 rounded">https://docs.xapp.folks.finance/technical-details/oracle</code>
      </td>
    </tr>
    <tr class="bg-gray-900">
      <td class="p-3 border border-gray-700">Gora Oracle</td>
      <td class="p-3 border border-gray-700">
        Decentralized data oracle <br/>
        <a href="https://www.gora.io/" target="_blank" class="text-blue-400 hover:underline">Gora Oracle</a> <br/>
        <code class="bg-gray-800 text-gray-300 p-1 rounded">https://www.gora.io/</code>
      </td>
    </tr>
  </tbody>
</table>`;


const crosschain = `<table class="w-full border-collapse border border-gray-700 text-white">
  <thead>
    <tr class="bg-gray-900 text-left">
      <th class="p-3 border border-gray-700">Project</th>
      <th class="p-3 border border-gray-700">Details</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Messina</td>
      <td class="p-3 border border-gray-700">
        Cross-Chain Bridge for Algorand <br/>
        <a href="https://messina.one/bridge" target="_blank" class="text-blue-400 hover:underline">Messina Bridge</a>
      </td>
    </tr>
    <tr class="bg-gray-900">
      <td class="p-3 border border-gray-700">Wormhole</td>
      <td class="p-3 border border-gray-700">
        Cross-chain interoperability protocol supporting Algorand <br/>
        <a href="https://wormhole.com/platform/blockchains" target="_blank" class="text-blue-400 hover:underline">Wormhole</a>
      </td>
    </tr>
  </tbody>
</table>`;


const indexer = `<table class="w-full border-collapse border border-gray-700 text-white">
  <thead>
    <tr class="bg-gray-900 text-left">
      <th class="p-3 border border-gray-700">Indexer</th>
      <th class="p-3 border border-gray-700">Details</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Algorand Indexer (V2)</td>
      <td class="p-3 border border-gray-700">
        Official daemon that connects to PostgreSQL DB and archival node <br/>
        Exposes REST API on port <code class="bg-gray-800 text-gray-300 p-1 rounded">8980</code> by default <br/>
        <a href="https://developer.algorand.org/docs/rest-apis/indexer/" target="_blank" class="text-blue-400 hover:underline">Indexer V2 Setup</a>
      </td>
    </tr>
    <tr class="bg-gray-900">
      <td class="p-3 border border-gray-700">REST API Access</td>
      <td class="p-3 border border-gray-700">
        Official OpenAPI specs (OAS2/OAS3) for Indexer endpoints <br/>
        <a href="https://developer.algorand.org/docs/rest-apis/indexer/" target="_blank" class="text-blue-400 hover:underline">REST APIs Overview</a>
      </td>
    </tr>
    <tr class="bg-gray-800">
      <td class="p-3 border border-gray-700">Managed Indexer Services</td>
      <td class="p-3 border border-gray-700">
        Third-party providers offering Indexer-as-a-service <br/>
        Examples: Nodely, BlockDaemon, GetBlock.io <br/>
        <a href="https://getblock.io/nodes/algo/" target="_blank" class="text-blue-400 hover:underline">GetBlock Algorand</a>
      </td>
    </tr>
    <tr class="bg-gray-900">
      <td class="p-3 border border-gray-700">SDK Clients</td>
      <td class="p-3 border border-gray-700">
        Clients that interact with the Indexer: <br/>
        <ul class="list-none space-y-1">
          <li>JavaScript SDK Indexer Client – <a href="https://github.com/algorand/js-algorand-sdk" target="_blank" class="text-blue-400 hover:underline">JS SDK</a></li>
          <li>Java SDK Indexer Queries – <a href="https://github.com/algorand/algorand-sdk-testing" target="_blank" class="text-blue-400 hover:underline">Java SDK</a></li>
          <li>Python SDK IndexerClient – <a href="https://py-algorand-sdk.readthedocs.io/en/latest/" target="_blank" class="text-blue-400 hover:underline">Py SDK</a></li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>`;


const walletinfra = `<table class="w-full border-collapse border border-gray-700 text-white">
        <thead>
          <tr class="bg-gray-900 text-left">
            <th class="p-3 border border-gray-700">Wallet Infra</th>
            <th class="p-3 border border-gray-700">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr class="bg-gray-800">
            <td class="p-3 border border-gray-700">KMD (Key Management Daemon)</td>
            <td class="p-3 border border-gray-700">
              On-node wallet service; manage keys, wallets, and sign transactions via REST API & SDKs. <br/>
              <a href="https://developer.algorand.org/docs/get-details/accounts/kmd/" target="_blank" class="text-blue-400 hover:underline">KMD API Docs</a>
            </td>
          </tr>
          <tr class="bg-gray-900">
            <td class="p-3 border border-gray-700">Wallet Standards (ARCs)</td>
            <td class="p-3 border border-gray-700">
              Specifications for dApp-to-wallet interoperability (e.g., WalletConnect, multisig, logic sigs). <br/>
              <a href="https://arc.algorand.foundation/" target="_blank" class="text-blue-400 hover:underline">ARC Standards</a>
            </td>
          </tr>
          <tr class="bg-gray-800">
            <td class="p-3 border border-gray-700">Popular Wallets</td>
            <td class="p-3 border border-gray-700">
              Pera, Defly, HesabPay, Exodus, Ledger – widely used mobile/web/hardware wallets. <br/>
              <a href="https://algorandwallet.com/" target="_blank" class="text-blue-400 hover:underline">Pera Wallet</a>
            </td>
          </tr>
          <tr class="bg-gray-900">
            <td class="p-3 border border-gray-700">HD Wallets</td>
            <td class="p-3 border border-gray-700">
              ARC-0052 deterministic accounts from a single seed. Libraries in TypeScript, Kotlin, Swift. <br/>
              <a href="https://arc.algorand.foundation/ARCs/arc-0052" target="_blank" class="text-blue-400 hover:underline">ARC-0052 Spec</a>
            </td>
          </tr>
          <tr class="bg-gray-800">
            <td class="p-3 border border-gray-700">Vault Wallet</td>
            <td class="p-3 border border-gray-700">
              HashiCorp Vault integration for standalone key custody in enterprise setups.
            </td>
          </tr>
          <tr class="bg-gray-900">
            <td class="p-3 border border-gray-700">UseWallet Library</td>
            <td class="p-3 border border-gray-700">
              dApp integration layer for connecting/signing with wallets like Pera. <br/>
              <a href="https://github.com/perawallet/use-wallet" target="_blank" class="text-blue-400 hover:underline">UseWallet</a>
            </td>
          </tr>
          <tr class="bg-gray-800">
            <td class="p-3 border border-gray-700">AlgoKit Wallet Task</td>
            <td class="p-3 border border-gray-700">
              Developer tooling for wallet operations like creating accounts, testing, and signing. <br/>
              <a href="https://developer.algorand.org/docs/get-started/algokit/" target="_blank" class="text-blue-400 hover:underline">AlgoKit Docs</a>
            </td>
          </tr>
        </tbody>
      </table>`;


const rpcs = `<table class="w-full border-collapse border border-gray-700 text-white">
      <thead>
        <tr class="bg-gray-900 text-left">
          <th class="p-3 border border-gray-700">RPC / API</th>
          <th class="p-3 border border-gray-700">Details</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-gray-800">
          <td class="p-3 border border-gray-700">Algod REST API</td>
          <td class="p-3 border border-gray-700">
            Complete list of node endpoints: pending transactions, submit transactions, account info, etc. <br/>
            <a href="https://developer.algorand.org/docs/rest-apis/algod/" target="_blank" class="text-blue-400 hover:underline">Algod API; REST overview</a> <br/>
            <code class="bg-gray-800 text-gray-300 p-1 rounded">Example: GetPendingTransactions response semantics</code>
          </td>
        </tr>
        <tr class="bg-gray-900">
          <td class="p-3 border border-gray-700">Indexer REST API</td>
          <td class="p-3 border border-gray-700">
            Historical data / query endpoints. SDK clients expose these (e.g., JS/Python). <br/>
            <a href="https://developer.algorand.org/docs/rest-apis/indexer/" target="_blank" class="text-blue-400 hover:underline">REST overview</a> <br/>
            <code class="bg-gray-800 text-gray-300 p-1 rounded">JS Indexer class; Py Indexer client</code>
          </td>
        </tr>
        <tr class="bg-gray-800">
          <td class="p-3 border border-gray-700">KMD REST API</td>
          <td class="p-3 border border-gray-700">
            Key and wallet management endpoints. <br/>
            <a href="https://developer.algorand.org/docs/rest-apis/kmd/" target="_blank" class="text-blue-400 hover:underline">REST overview</a>
          </td>
        </tr>
      </tbody>
    </table>`;


const defi = `<table class="w-full border-collapse border border-gray-700 text-white">
        <thead>
          <tr class="bg-gray-900 text-left">
            <th class="p-3 border border-gray-700">DeFi</th>
            <th class="p-3 border border-gray-700">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr class="bg-gray-800">
            <td class="p-3 border border-gray-700">Uniswap</td>
            <td class="p-3 border border-gray-700">
              Router, multicall, factory, quoter, and more <br/>
              <a href="https://github.com/Uniswap/contracts/blob/bf676eed3dc31b18c70aba61dcc6b3c6e4d0028f/deployments/10143.md#quoter-v2" target="_blank" class="text-blue-400 hover:underline">Uniswap</a> <br/>
            </td>
          </tr>
        </tbody>
      </table>`;


export { accountabstraction, oracle, crosschain, indexer, walletinfra, rpcs, defi };
