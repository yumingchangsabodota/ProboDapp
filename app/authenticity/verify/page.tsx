"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { DocSigner } from "@/lib/DocSigner";
import { ApiPromise } from '@polkadot/api';
import { NodeProvider } from '@/lib/NodeProvider';
import type { Option } from '@polkadot/types';
import type { u32 } from '@polkadot/types-codec';

interface ProofMeta {
  issuer: string;
  expiryBlock: number | string;
}

export default function AuthenticityVerifyPage() {
  const [signature, setSignature] = useState<string>("");
  const [documentIds, setDocumentIds] = useState<string[]>([""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>("");
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    encryptedHashes: string[];
    issuer: string;
    expiryBlock: number;
    userProvidedIds: string[];
    isExpired?: boolean;
    currentBlock?: number;
  } | null>(null);

  const docSigner = useMemo(() => new DocSigner(), []);
  const nodeProvider = useMemo(() => new NodeProvider(), []);

  const handleAddDocument = () => {
    setDocumentIds([...documentIds, ""]);
  };

  const handleDocumentChange = (index: number, value: string) => {
    const newDocuments = [...documentIds];
    newDocuments[index] = value;
    setDocumentIds(newDocuments);
  };

  const handleRemoveDocument = (index: number) => {
    if (documentIds.length > 1) {
      const newDocuments = documentIds.filter((_, i) => i !== index);
      setDocumentIds(newDocuments);
    }
  };


  const handleVerify = async () => {
    setError("");
    setVerificationResult(null);

    if (!signature.trim()) {
      setError("Please enter a signature");
      return;
    }

    const validDocumentIds = documentIds.filter(id => id.trim());

    if (validDocumentIds.length === 0) {
      setError("Please enter at least one document ID");
      return;
    }

    setIsVerifying(true);
    let api: ApiPromise | null = null;

    try {
      // Connect to blockchain
      const provider = nodeProvider.getProvider();
      api = await ApiPromise.create({ provider });

      // Query blockchain storage for proof metadata using signature as key
      const proofData = await api.query.proof.issuanceProof(signature) as Option<any>;

      // Check if proof exists
      if (proofData.isNone) {
        setError("Signature not found on blockchain");
        return;
      }

      // Extract proof metadata
      const proofMetaRaw = proofData.unwrap();
      const proofMeta = proofMetaRaw.toJSON() as ProofMeta;
      const issuerAddress = proofMeta.issuer;

      // Parse expiry block from the raw codec data to get the actual number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expiryBlock = (proofMetaRaw as any).expiryBlock.toNumber();

      console.log("Proof found:", { issuerAddress, expiryBlock });

      // Check if proof has expired
      const currentBlock = await api.query.system.number() as u32;
      const currentBlockNumber = currentBlock.toNumber();
      const isExpired = expiryBlock > 0 && currentBlockNumber > expiryBlock;

      // Encrypt the user-provided document IDs using the issuer's address
      const encryptedHashes = validDocumentIds.map(docId =>
        docSigner.encryptDocument(issuerAddress, docId)
      );

      console.log("Encrypted hashes from user input:", encryptedHashes);

      // Verify the signature using the issuer's public key and the encrypted hashes
      const isSignatureValid = docSigner.verifySignature(signature, issuerAddress, encryptedHashes);

      console.log("Signature verification result:", isSignatureValid);

      if (isSignatureValid) {
        setVerificationResult({
          isValid: true,
          encryptedHashes: encryptedHashes,
          issuer: issuerAddress,
          expiryBlock: expiryBlock,
          userProvidedIds: validDocumentIds,
          isExpired: isExpired,
          currentBlock: currentBlockNumber
        });
      } else {
        setVerificationResult({
          isValid: false,
          encryptedHashes: encryptedHashes,
          issuer: issuerAddress,
          expiryBlock: expiryBlock,
          userProvidedIds: validDocumentIds,
          isExpired: isExpired,
          currentBlock: currentBlockNumber
        });
      }

    } catch (error) {
      console.error("Verification error:", error);
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsVerifying(false);
      if (api) {
        await api.disconnect();
      }
    }
  };

  const handleReset = () => {
    setSignature("");
    setDocumentIds([""]);
    setError("");
    setVerificationResult(null);
  };

  return (
    <div className="bg-light" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="container py-4" style={{ maxWidth: "1200px" }}>
        <div className="mb-4">
          <Link
            href="/"
            className="text-primary text-decoration-underline d-inline-block mb-3"
          >
            Back to Home
          </Link>
          <h1 className="display-5 fw-bold mb-2" style={{ color: "#ededed" }}>
            Document Authenticity Verification
          </h1>
          <p className="text-secondary">
            Verify document signatures stored on the blockchain
          </p>
        </div>

        <div className="card shadow-sm border p-4">
          <div className="py-5">
            <div className="mx-auto" style={{ maxWidth: "900px" }}>
              <div className="mb-4">
                <label className="form-label fw-medium">Signature</label>
                <textarea
                  className="form-control font-monospace"
                  rows={4}
                  placeholder="Enter the signature to verify..."
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  disabled={verificationResult !== null}
                />
                <div className="form-text text-secondary small">
                  Paste the blockchain signature you want to verify
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">Document IDs</label>
                {documentIds.map((docId, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex gap-2 align-items-center">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter document ID or hash..."
                        value={docId}
                        onChange={(e) => handleDocumentChange(index, e.target.value)}
                        disabled={verificationResult !== null}
                      />
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveDocument(index)}
                        disabled={documentIds.length === 1 || verificationResult !== null}
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {documentIds.length < 10 && verificationResult === null && (
                  <div className="text-center mt-3">
                    <button className="btn btn-outline-primary" onClick={handleAddDocument}>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="me-2">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      Add Another Document
                    </button>
                  </div>
                )}
              </div>

              {verificationResult && (
                <div className={`alert ${verificationResult.isValid ? 'alert-success' : 'alert-danger'} mt-4`}>
                  <h5 className="alert-heading mb-3">
                    {verificationResult.isValid ? (
                      <>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="me-2" style={{verticalAlign: 'middle'}}>
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        Verification Successful
                      </>
                    ) : (
                      <>
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="me-2" style={{verticalAlign: 'middle'}}>
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                        Verification Failed
                      </>
                    )}
                  </h5>

                  {/* Stored Proof Details */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Stored Proof Details (On-Chain):</h6>
                    <div className="mb-3">
                      <small className="text-secondary d-block mb-1">Signature (Storage Key):</small>
                      <code className="text-break small d-block p-2 bg-dark rounded">{signature}</code>
                    </div>
                    <div className="mb-2">
                      <small className="text-secondary d-block mb-1">Issuer Address:</small>
                      <code className="text-break small d-block">{verificationResult.issuer}</code>
                    </div>
                    <div className="mb-2">
                      <small className="text-secondary d-block mb-1">Expiry Block:</small>
                      <code className="text-break small d-block">
                        {verificationResult.expiryBlock === 0 ? 'No expiration' : verificationResult.expiryBlock.toLocaleString()}
                      </code>
                      {verificationResult.isExpired && (
                        <div className="alert alert-warning mt-2 mb-0 py-2 px-3">
                          <small>
                            <strong>⚠️ Warning:</strong> This proof has expired at block {verificationResult.expiryBlock.toLocaleString()}.
                            Current block: {verificationResult.currentBlock?.toLocaleString()}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr />

                  {/* User Provided Details */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">User Provided Details:</h6>
                    <div className="mb-3">
                      <small className="text-secondary d-block mb-2">Raw Document IDs:</small>
                      {verificationResult.userProvidedIds?.map((docId, index) => (
                        <div key={index} className="mb-2">
                          <code className="text-break small d-block p-2 bg-light rounded border">
                            {index + 1}. {docId}
                          </code>
                        </div>
                      ))}
                    </div>
                    <div>
                      <small className="text-secondary d-block mb-2">Issuer Encrypted Hashes:</small>
                      {verificationResult.encryptedHashes?.map((hash, index) => (
                        <div key={index} className="mb-2">
                          <code className="text-break small d-block p-2 bg-light rounded border">
                            {index + 1}. {hash}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {verificationResult.isValid ? (
                    <div className="alert alert-success mb-0">
                      <strong>Result:</strong> The signature was successfully verified using the issuer's public key.
                      The provided documents match the stored proof.
                    </div>
                  ) : (
                    <div className="alert alert-danger mb-0">
                      <strong>Result:</strong> Signature verification failed. The provided documents do not match
                      what was originally signed by the issuer.
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="alert alert-danger mt-4" role="alert">
                  {error}
                </div>
              )}

              {verificationResult === null ? (
                <div className="d-flex gap-3 justify-content-center mt-5">
                  <button
                    className="btn btn-success fw-medium px-5 py-2"
                    onClick={handleVerify}
                    disabled={isVerifying || !signature.trim()}
                  >
                    {isVerifying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Verifying...
                      </>
                    ) : (
                      <>Verify Signature</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-primary fw-medium px-5 py-2"
                    onClick={handleReset}
                  >
                    Verify Another Signature
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
