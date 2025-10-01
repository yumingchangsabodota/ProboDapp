import Link from "next/link";

export default function AuthenticityDocsPage() {
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
          <h1 className="display-5 fw-bold mb-2">
            Document Authenticity Verification
          </h1>
          <p className="text-secondary">
            Verify and validate the authenticity of digital documents and certificates
          </p>
        </div>

        {/* Main Content */}
        <div className="card shadow-sm border p-4">
          <div className="text-center py-5">
            <div className="text-primary mb-4">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <h2 className="h3 fw-semibold mb-3">
              Document Verification System
            </h2>

            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "700px" }}>
              This page will allow users to upload and verify the authenticity of digital documents,
              certificates, and other important files using blockchain technology.
            </p>

            <div className="row g-3 mx-auto text-start" style={{ maxWidth: "700px" }}>
              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2">
                    Upload Documents
                  </h3>
                  <p className="small text-secondary mb-0">
                    Securely upload documents for verification
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2">
                    Verify Authenticity
                  </h3>
                  <p className="small text-secondary mb-0">
                    Check document integrity and authenticity
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2">
                    Blockchain Records
                  </h3>
                  <p className="small text-secondary mb-0">
                    Immutable verification records on blockchain
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2">
                    Certificate Generation
                  </h3>
                  <p className="small text-secondary mb-0">
                    Generate verification certificates
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="btn btn-primary fw-medium px-4 py-2"
                disabled
              >
                Coming Soon - Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}