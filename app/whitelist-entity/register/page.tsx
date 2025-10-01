import Link from "next/link";

export default function WhitelistEntityRegisterPage() {
  return (
    <div className="bg-light" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="container py-4" style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-success text-decoration-underline d-inline-block mb-3"
          >
            ← Back to Home
          </Link>
          <h1 className="display-5 fw-bold mb-2" style={{ color: "#ededed" }}>
            Whitelist Entity Registration
          </h1>
          <p className="text-secondary">
            Register and manage trusted entities in the whitelist system
          </p>
        </div>

        {/* Main Content */}
        <div className="card shadow-sm border p-4">
          <div className="text-center py-5">
            <div className="text-success mb-4">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>

            <h2 className="h3 fw-semibold mb-3" style={{ color: "#ededed" }}>
              Entity Whitelist Management
            </h2>

            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "700px" }}>
              This page will allow authorized users to register new entities, manage existing
              whitelist entries, and verify entity credentials on the blockchain.
            </p>

            <div className="row g-3 mx-auto text-start" style={{ maxWidth: "700px" }}>
              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2" style={{ color: "#ededed" }}>
                    Register Entity
                  </h3>
                  <p className="small text-secondary mb-0">
                    Add new trusted entities to the whitelist
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2" style={{ color: "#ededed" }}>
                    Verify Credentials
                  </h3>
                  <p className="small text-secondary mb-0">
                    Validate entity information and permissions
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2" style={{ color: "#ededed" }}>
                    Manage Whitelist
                  </h3>
                  <p className="small text-secondary mb-0">
                    Update or remove existing whitelist entries
                  </p>
                </div>
              </div>

              <div className="col-md-6">
                <div className="bg-light p-4 rounded">
                  <h3 className="fw-semibold mb-2" style={{ color: "#ededed" }}>
                    Audit Trail
                  </h3>
                  <p className="small text-secondary mb-0">
                    Track all whitelist changes and activities
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="btn btn-success fw-medium px-4 py-2 me-2"
                disabled
              >
                Coming Soon - Register New Entity
              </button>
              <button
                className="btn btn-secondary fw-medium px-4 py-2"
                disabled
              >
                Coming Soon - View Whitelist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}