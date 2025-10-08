# Probo DApp
A decentralized application demonstrating blockchain-based cryptographic proof verification for secure, privacy-preserving document authentication across borders. Built on the [Probo](https://github.com/yumingchangsabodota/Probo) blockchain framework.

Read the full technical overview and justification [here](https://github.com/yumingchangsabodota/Probo/OVERVIEW.md).

## Demo Scenarios

### Scenario 1: Cross-Border Travel Document Verification

**Background**: The Embassy of Country A in Country B issues legitimate visas to travelers. However, sophisticated forgers extract authentic visa stickers, replace photos with unauthorized individuals, and affix them to different passports. Transit Country C lacks real-time access to Country A's issuance database, making detection nearly impossible until after unauthorized entry occurs.

**Probo Solution**: When Country A's embassy issues a visa, the dApp encrypts the composite document data (visa number + passport number + issuing entity ID) using the embassy's public key, generates a cryptographic hash, and signs it with the embassy's private key. Only this signature proof, the embassy's public key, and expiration block number are stored on the blockchain—not the sensitive document details.

When travelers arrive at Transit Country C, they present their raw visa number and passport number along with the signature proof. Immigration officers use the dApp to retrieve Country A's public key from the blockchain using the signature proof, encrypt the raw inputs with this public key, generate a hash, and cryptographically verify the signature was created by Country A's private key. If the passport number differs from what was originally signed (as in photo-substitution attacks), verification fails immediately. This privacy-preserving approach enables real-time authentication without exposing bilateral relationships or requiring centralized databases, while making composite document forgery cryptographically detectable.

### Scenario 2: International Academic Credential Authentication

**Background**: University P in Country A issues a bachelor's degree. The recipient seeks employment in Country B, where employers require government-validated academic credentials. Traditional verification requires lengthy communication between Country B's authorities, Country A's Department of Education, and the university—a process taking weeks or months and vulnerable to document forgery.

**Probo Solution**: The verification follows a two-step cryptographic chain. First, the recipient presents raw credential data (university ID, degree certificate number, identity document) to Country A's Department of Education. The dApp encrypts this data using the department's public key, generates a hash, signs it with their private key, and stores the signature proof on the blockchain. Second, the recipient presents the same raw data and the department's signature proof to Country B's embassy. The embassy's dApp retrieves the department's public key, encrypts the raw data, verifies the department's signature, then creates their own signature proof referencing the original.

Upon arrival in Country B for employment, the recipient presents raw credentials and both signature proofs to licensing authorities. The dApp verifies both signatures sequentially: retrieving each entity's public key, encrypting the raw data, and confirming cryptographic validity. This eliminates direct institutional communication, reduces verification from months to seconds, and makes fraudulent credentials mathematically infeasible—authorities verify the authentic cryptographic chain without accessing centralized databases.


## Main Functionalities
- **Register as Whitelist Entity**: Authorize entities to store proofs on-chain (production systems would use governance mechanisms like OpenGov)
- **Store Issuance Proof**: Encrypt document data, generate hash, sign with private key, and store signature proof on blockchain
- **Verify Signature Proof**: Retrieve issuer public key, encrypt raw inputs, generate hash, and cryptographically verify signature authenticity


## Demo video
https://github.com/user-attachments/assets/6c8a6764-dd94-48d1-b878-90a1578b2897

