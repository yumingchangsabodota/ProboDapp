import Link from "next/link";

export default function Home() {
  return (
    <div className="d-flex align-items-center justify-content-center p-4" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <main className="container text-center" style={{ maxWidth: "900px" }}>
        <h1 className="display-4 fw-bold mb-4" style={{ color: "#ededed" }}>
          Probo DApp
        </h1>
        <p className="fs-5 text-secondary mb-5">
          Choose a service to get started
        </p>

        <div className="row g-4 mx-auto" style={{ maxWidth: "900px" }}>
          <div className="col-md-4">
            <Link
              href="/authenticity/store"
              className="card h-100 text-decoration-none shadow-sm hover-shadow"
              style={{ transition: "all 0.2s", borderColor: "#3b82f6" }}
            >
              <div className="card-body p-4">
                <div className="text-primary mb-3">
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="h5 fw-semibold mb-2" style={{ color: "#ededed" }}>
                  Store Signature
                </h2>
                <p className="text-secondary mb-0">
                  Sign and store document signatures
                </p>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link
              href="/authenticity/verify"
              className="card h-100 text-decoration-none shadow-sm hover-shadow"
              style={{ transition: "all 0.2s", borderColor: "#8b5cf6" }}
            >
              <div className="card-body p-4">
                <div className="mb-3" style={{ color: "#8b5cf6" }}>
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="h5 fw-semibold mb-2" style={{ color: "#ededed" }}>
                  Verify Signature
                </h2>
                <p className="text-secondary mb-0">
                  Verify document signatures
                </p>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link
              href="/whitelist-entity/register"
              className="card h-100 text-decoration-none shadow-sm hover-shadow"
              style={{ transition: "all 0.2s", borderColor: "#22c55e" }}
            >
              <div className="card-body p-4">
                <div className="text-success mb-3">
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="h5 fw-semibold mb-2" style={{ color: "#ededed" }}>
                  Whitelist Entity
                </h2>
                <p className="text-secondary mb-0">
                  Register as whitelisted entities
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
