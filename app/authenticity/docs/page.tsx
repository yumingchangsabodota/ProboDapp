"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { DocSigner } from "@/lib/DocSigner";
import { useWallet } from "@/contexts/WalletContext";

export default function AuthenticityDocsPage() {
  const { selectedAccount } = useWallet();
  const [inputs, setInputs] = useState<string[]>([""]);
  const [isSigning, setIsSigning] = useState(false);
  const [overallSignature, setOverallSignature] = useState<string>("");

  const docSigner = useMemo(() => new DocSigner(), []);

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
    if (!selectedAccount) {
      alert("Please connect wallet");
      return;
    }

    // Get all encrypted hashes from non-empty inputs
    const encryptedHashes = inputs
      .filter(input => input.trim())
      .map(input => getEncryptedHash(input));

    if (encryptedHashes.length === 0) {
      alert("No documents to sign");
      return;
    }

    setIsSigning(true);
    try {
      const signature = await docSigner.signDocuments(selectedAccount.address, encryptedHashes);
      setOverallSignature(signature);
      console.log("Signature:", signature);
    } catch (error) {
      console.error("Error signing documents:", error);
      alert("Error signing documents");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="bg-light" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="container py-4" style={{ maxWidth: "900px" }}>
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
            <div className="mx-auto" style={{ maxWidth: "600px" }}>
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

              {inputs.length < 10 && (
                <div className="text-center mt-4">
                  <button className="btn btn-primary" onClick={handleAdd}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Sign Documents Button */}
              {inputs.some(input => input.trim()) && (
                <div className="text-center mt-4">
                  <button
                    className="btn btn-success fw-medium px-4 py-2"
                    onClick={handleSignDocuments}
                    disabled={isSigning || !selectedAccount}
                  >
                    {isSigning ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing...
                      </>
                    ) : (
                      'Sign Documents'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Signature Display */}
        {overallSignature && (
          <div className="card shadow-sm border p-4 mt-4">
            <h2 className="h5 fw-semibold mb-3" style={{ color: "#ededed" }}>
              Overall Signature
            </h2>
            <div className="p-3 bg-dark rounded border mb-3">
              <small className="text-secondary d-block mb-2">Combined Signature:</small>
              <code className="text-break small text-success">{overallSignature}</code>
            </div>
            <div className="text-center">
              <button
                className="btn btn-primary fw-medium px-4 py-2"
                onClick={() => alert("Store functionality coming soon!")}
              >
                Store Documents Signature
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}