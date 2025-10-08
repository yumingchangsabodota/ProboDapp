# Probo DApp
A decentralized application demonstrating blockchain-based cryptographic proof verification for secure, privacy-preserving document authentication across borders. Built on the [Probo](https://github.com/yumingchangsabodota/Probo) blockchain framework.

Read the full technical overview and justification [here](https://github.com/yumingchangsabodota/Probo/OVERVIEW.md).


## Main Functionalities
- **Register as Whitelist Entity**: Authorize entities to store proofs on-chain (production systems would use governance mechanisms like OpenGov)
- **Store Issuance Proof**: Encrypt document data, generate hash, sign with private key, and store signature proof on blockchain
- **Verify Signature Proof**: Retrieve issuer public key, encrypt raw inputs, generate hash, and cryptographically verify signature authenticity

## Demo video
https://github.com/user-attachments/assets/6c8a6764-dd94-48d1-b878-90a1578b2897


## Applicable Scenarios

### Scenario 1: Cross-Border Travel Document Verification

#### Background
The Embassy of Country A in Country B issues legitimate visas to travelers. However, sophisticated forgers extract authentic visa stickers, replace photos with unauthorized individuals, and affix them to different passports. Transit Country C lacks real-time access to Country A's issuance database, making detection nearly impossible until after unauthorized entry occurs.

#### Probo Solution

**Issuance Process:**
- Country A's embassy issues a visa
- dApp encrypts composite data (visa number + passport number + issuing entity ID) with embassy's public key
- Generates cryptographic hash and signs with embassy's private key
- Stores only signature proof, public key, and expiration block on blockchain

**Verification Process:**
- Traveler arrives at Transit Country C with raw visa/passport numbers and signature proof
- Immigration officers use dApp to:
  - Retrieve Country A's public key from blockchain
  - Encrypt raw inputs with public key
  - Generate hash and verify signature authenticity
- If passport number differs from original (photo-substitution attack), verification fails immediately

**Benefits:** Real-time authentication without exposing bilateral relationships or centralized databases, making composite document forgery cryptographically detectable.

---

### Scenario 2: International Academic Credential Authentication

#### Background
University P in Country A issues a bachelor's degree. The recipient seeks employment in Country B, where employers require government-validated academic credentials. Traditional verification requires lengthy communication between multiple authorities—a process taking weeks or months and vulnerable to forgery.

#### Probo Solution

**Step 1 - Department of Education Validation:**
- Recipient presents raw credential data (university ID, degree certificate, identity document)
- Department's dApp encrypts data, generates hash, signs with private key
- Stores signature proof on blockchain

**Step 2 - Embassy Endorsement:**
- Recipient presents same raw data + Department's signature proof
- Embassy dApp retrieves Department's public key and verifies signature
- Creates own signature proof referencing the original

**Final Verification in Country B:**
- Recipient presents raw credentials + both signature proofs to licensing authorities
- dApp verifies both signatures sequentially:
  - Retrieves each entity's public key
  - Encrypts raw data and confirms cryptographic validity

**Benefits:** Eliminates institutional communication, reduces verification from months to seconds, creates mathematically infeasible-to-forge credential chains.



