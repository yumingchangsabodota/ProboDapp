import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex, stringToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';

export class DocSigner {
  /**
   * Encrypts a string value using a public wallet address
   * @param publicAddress - The public wallet address
   * @param value - The string value to encrypt
   * @returns The encrypted hash as a hex string
   */
  encryptDocument(publicAddress: string, value: string): string {
    try {
      // Decode the public address to get the public key bytes
      const publicKey = decodeAddress(publicAddress);

      // Convert the string value to bytes
      const valueBytes = new TextEncoder().encode(value);

      // Combine public key and value bytes
      const combined = new Uint8Array([...publicKey, ...valueBytes]);

      // Hash the combined data using BLAKE2
      const hash = blake2AsU8a(combined, 256);

      // Convert to hex string
      return u8aToHex(hash);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to encrypt document: ${error.message}`);
      }
      throw new Error('Failed to encrypt document: Unknown error');
    }
  }

  /**
   * Signs an array of document hashes using the wallet's private key
   * This creates a cryptographic signature that can be verified later using the public key
   * Note: This will trigger a wallet popup for the user to approve the signature
   *
   * @param walletAddress - The wallet address to sign with
   * @param documents - Array of encrypted hash strings
   * @returns The signature as a hex string (signed with private key, verifiable with public key)
   */
  async signDocuments(walletAddress: string, documents: string[]): Promise<string> {
    try {
      // Import web3FromAddress only when needed (avoids SSR issues)
      const { web3FromAddress } = await import('@polkadot/extension-dapp');

      // Get the injector for the wallet address
      const injector = await web3FromAddress(walletAddress);

      if (!injector.signer.signRaw) {
        throw new Error('Wallet does not support signing raw messages');
      }

      // Join all document hashes with a separator
      const combinedDocs = documents.join('::PROBO::');

      // Convert to hex format for signing
      const messageHex = stringToHex(combinedDocs);

      // Sign with private key (user will see wallet popup)
      // The signature can later be verified using the public key
      const { signature } = await injector.signer.signRaw({
        address: walletAddress,
        data: messageHex,
        type: 'bytes'
      });

      return signature;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to sign documents: ${error.message}`);
      }
      throw new Error('Failed to sign documents: Unknown error');
    }
  }

  /**
   * Verifies a signature using the issuer's public key and a reconstructed message
   *
   * @param signature - The signature to verify (hex string from signRaw)
   * @param walletAddress - The issuer's wallet address (contains public key)
   * @param encryptedHashes - The encrypted document hashes to verify against
   * @returns true if signature is valid, false otherwise
   */
  verifySignature(signature: string, walletAddress: string, encryptedHashes: string[]): boolean {
    try {
      // Decode the public key from the issuer's wallet address
      const publicKey = decodeAddress(walletAddress);

      // Reconstruct the original message that should have been signed
      // This is the same process as in signDocuments():
      // 1. Join encrypted hashes with separator
      // 2. Convert to hex
      const combinedDocs = encryptedHashes.join('::PROBO::');
      const messageHex = stringToHex(combinedDocs);

      // Verify the signature using the public key and reconstructed message
      const { isValid } = signatureVerify(messageHex, signature, publicKey);

      return isValid;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to verify signature: ${error.message}`);
      }
      throw new Error('Failed to verify signature: Unknown error');
    }
  }
}
