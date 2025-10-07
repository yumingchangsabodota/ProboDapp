"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { DocSigner } from "@/lib/DocSigner";
import { useWallet } from "@/contexts/WalletContext";
import { ApiPromise } from '@polkadot/api';
import { NodeProvider } from '@/lib/NodeProvider';

export default function AuthenticityDocsPage() {
  const { selectedAccount } = useWallet();
  const [inputs, setInputs] = useState<string[]>([""]);
  const [isSigning, setIsSigning] = useState(false);
  const [overallSignature, setOverallSignature] = useState<string>("");
  const [expirationBlock, setExpirationBlock] = useState<string>("0");
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isStored, setIsStored] = useState(false);

  const docSigner = useMemo(() => new DocSigner(), []);
  const nodeProvider = useMemo(() => new NodeProvider(), []);

  const handleAdd = () => {
    setInputs([...inputs, ""]);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleRemove = (index: number) => {
    if (inputs.length > 1) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const getEncryptedHash = (value: string): string => {
    if (!value.trim()) return "";
    if (!selectedAccount) return "Please connect wallet";
    try {
      return docSigner.encryptDocument(selectedAccount.address, value);
    } catch (error) {
      return "Error generating hash";
    }
  };

  const handleSignDocuments = async () => {
    setError("");
    setSuccess("");

    if (!selectedAccount) {
      setError("Please connect wallet");
      return;
    }

    // Get all encrypted hashes from non-empty inputs
    const encryptedHashes = inputs
      .filter(input => input.trim())
      .map(input => getEncryptedHash(input));

    if (encryptedHashes.length === 0) {
      setError("No documents to sign");
      return;
    }

    setIsSigning(true);
    try {
      const signature = await docSigner.signDocuments(selectedAccount.address, encryptedHashes);
      setOverallSignature(signature);
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing documents:", error);
      setError(error instanceof Error ? error.message : "Error signing documents");
    } finally {
      setIsSigning(false);
    }
  };

  const handleStoreDocuments = async () => {
    setError("");
    setSuccess("");

    if (!selectedAccount) {
      setError("Please connect wallet");
      return;
    }

    if (!overallSignature) {
      setError("Please sign documents first");
      return;
    }

    setIsStoring(true);
    try {
      const provider = nodeProvider.getProvider();
      const api = await ApiPromise.create({ provider });

      // Get injector for signing
      const { web3FromAddress } = await import('@polkadot/extension-dapp');
      const injector = await web3FromAddress(selectedAccount.address);

      // Parse expiration block (use 0 if empty for no expiration)
      const expiration = expirationBlock ? parseInt(expirationBlock, 10) : 0;

      // Call storeProof extrinsic
      const storeTx = api.tx.proof.storeProof(overallSignature, expiration);

      let blockHash = '';

      await new Promise((resolve, reject) => {
        storeTx.signAndSend(
          selectedAccount.address,
          { signer: injector.signer },
          ({ status, events }) => {
            if (status.isInBlock) {
              console.log(`Transaction included in block hash: ${status.asInBlock}`);
            }
            if (status.isFinalized) {
              blockHash = status.asFinalized.toString();
              console.log(`Transaction finalized at block hash: ${blockHash}`);

              // Check for errors in events
              let errorMessage = '';
              events.forEach(({ event }) => {
                if (api.events.system.ExtrinsicFailed.is(event)) {
                  // Extract the error details
                  const [dispatchError] = event.data;

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const error = dispatchError as any;

                  if (error.isModule) {
                    // Decode the module error
                    const decoded = api.registry.findMetaError(error.asModule);
                    const { docs, name, section } = decoded;
                    errorMessage = `${section}.${name}: ${docs.join(' ')}`;
                  } else {
                    // Other error types
                    errorMessage = error.toString();
                  }
                }
              });

              if (errorMessage) {
                reject(new Error(errorMessage));
              } else {
                resolve(true);
              }
            }
          }
        ).catch(reject);
      });

      setSuccess(`Documents stored successfully on blockchain! Transaction hash: ${blockHash}`);
      setIsStored(true);
      await api.disconnect();
    } catch (error) {
      console.error("Store failed:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to store documents";
      setError(`Failed to store documents: ${errorMsg}`);
    } finally {
      setIsStoring(false);
    }
  };

  const handleStoreNew = () => {
    // Reset all states to start fresh
    setInputs([""]);
    setOverallSignature("");
    setExpirationBlock("0");
    setError("");
    setSuccess("");
    setIsStored(false);
  };

  return (
    <div className="bg-light" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="container py-4" style={{ maxWidth: "1200px" }}>
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-primary text-decoration-underline d-inline-block mb-3"
          >
            ← Back to Home
          </Link>
          <h1 className="display-5 fw-bold mb-2" style={{ color: "#ededed" }}>
            Document Authenticity Store
          </h1>
          <p className="text-secondary">
            Verify and validate the authenticity of digital documents and certificates
          </p>
        </div>

        {/* Main Content */}
        <div className="card shadow-sm border p-4">
          <div className="py-5">
            <div className="mx-auto" style={{ maxWidth: "900px" }}>
              {inputs.map((input, index) => (
                <div key={index} className="mb-4">
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter document ID or hash..."
                      value={input}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleRemove(index)}
                      disabled={inputs.length === 1}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                  {input.trim() && (
                    <div className="mt-2 p-2 bg-light rounded border">
                      <small className="text-secondary d-block mb-1">Encrypted Hash:</small>
                      <code className="text-break small">{getEncryptedHash(input)}</code>
                    </div>
                  )}
                </div>
              ))}

              {inputs.length < 10 && !overallSignature && (
                <div className="text-center mt-4">
                  <button className="btn btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Expiration Block Input */}
              {inputs.some(input => input.trim()) && (
                <div className="mt-4">
                  <label className="form-label text-secondary small">Expiration Block Number (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter block number..."
                    value={expirationBlock}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = parseInt(value, 10);
                        // Cap at 52560000
                        if (numValue > 52560000) {
                          setExpirationBlock('52560000');
                        } else {
                          setExpirationBlock(value);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent non-numeric characters from being typed
                      if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                        e.preventDefault();
                      }
                    }}
                  />
                  <div className="form-text text-secondary small">
                    Leave empty for no expiration (max: 52,560,000)
                  </div>
                </div>
              )}

              {/* Overall Signature Display */}
              {overallSignature && (
                <div className="mt-4 p-3 bg-dark rounded border">
                  <h6 className="text-secondary mb-3">Blockchain Storage Preview</h6>

                  <div className="mb-3">
                    <small className="text-secondary d-block mb-1">Wallet Address:</small>
                    <code className="text-break small text-info">{selectedAccount?.address}</code>
                  </div>

                  <div className="mb-3">
                    <small className="text-secondary d-block mb-2">Documents:</small>
                    {inputs
                      .filter(input => input.trim())
                      .map((input, index) => (
                        <div key={index} className="mb-2">
                          <div className="ms-2">
                            <small className="text-secondary">{index + 1}. </small>
                            <code className="text-break small text-info">{getEncryptedHash(input)}</code>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mb-3">
                    <small className="text-secondary d-block mb-1">Combined Signature:</small>
                    <code className="text-break small text-success">{overallSignature}</code>
                  </div>

                  <div>
                    <small className="text-secondary d-block mb-1">Expiration Block:</small>
                    <code className="text-break small text-warning">{expirationBlock || 'No expiration'}</code>
                  </div>
                </div>
              )}

              {/* Sign/Store Documents Button */}
              {inputs.some(input => input.trim()) && !isStored && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-success fw-medium px-4 py-2"
                    onClick={overallSignature ? handleStoreDocuments : handleSignDocuments}
                    disabled={isSigning || isStoring || !selectedAccount}
                  >
                    {isSigning ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing...
                      </>
                    ) : isStoring ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Storing...
                      </>
                    ) : overallSignature ? (
                      'Store Documents Signature'
                    ) : (
                      'Sign Documents'
                    )}
                  </button>
                </div>
              )}

              {/* Store New Button */}
              {isStored && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-primary fw-medium px-4 py-2"
                    onClick={handleStoreNew}
                  >
                    Store New Signature
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="alert alert-success mt-3 mb-0" role="alert">
                  {success}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}