'use client';

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { ApiPromise } from '@polkadot/api';
import { NodeProvider } from '../../../lib/NodeProvider';
import { useWallet } from '@/contexts/WalletContext';

interface EntityInfo {
  address: string;
  // Add other entity fields as needed
}

export default function WhitelistEntityRegisterPage() {
  const { selectedAccount } = useWallet();
  const selectedAddress = selectedAccount?.address || '';
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [entities, setEntities] = useState<EntityInfo[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const nodeProvider = useMemo(() => new NodeProvider(), []);

  // Check if address is registered whenever it changes
  useEffect(() => {
    const checkRegistration = async () => {
      if (!selectedAddress) {
        setIsRegistered(false);
        return;
      }

      setIsChecking(true);
      try {
        const provider = nodeProvider.getProvider();
        const api = await ApiPromise.create({ provider });

        // Query the blockchain storage to check if entity is registered
        // Assuming the storage is proof.entities(AccountId) -> Option<EntityInfo>
        const entityInfo = await api.query.proof.whitelistEntity(selectedAddress);

        // If entityInfo exists (not None), the address is registered
        setIsRegistered(!entityInfo.isEmpty);

        await api.disconnect();
      } catch (err) {
        console.error('Failed to check registration:', err);
        setIsRegistered(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkRegistration();
  }, [selectedAddress, nodeProvider]);

  // Fetch all registered entities
  useEffect(() => {
    const fetchEntities = async (showLoading = false) => {
      if (showLoading) {
        setIsLoadingEntities(true);
      }
      try {
        const provider = nodeProvider.getProvider();
        const api = await ApiPromise.create({ provider });

        // Query all entries from the whitelistEntity storage
        const entries = await api.query.proof.whitelistEntity.entries();

        // Extract addresses from the entries
        const entityList: EntityInfo[] = entries
          .filter(([, value]) => !value.isEmpty)
          .map(([key]) => ({
            address: key.args[0].toString(),
          }));

        setEntities(entityList);
        await api.disconnect();
      } catch (err) {
        console.error('Failed to fetch entities:', err);
        if (showLoading) {
          setEntities([]);
        }
      } finally {
        if (showLoading) {
          setIsLoadingEntities(false);
        }
      }
    };

    // Initial fetch with loading spinner
    fetchEntities(true);

    // Poll every 10 seconds without loading spinner
    const interval = setInterval(() => fetchEntities(false), 10000);

    return () => {
      clearInterval(interval);
    };
  }, [nodeProvider, success]); // Refetch when a new entity is registered

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntities = entities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(entities.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleRegisterEntity = async () => {
    if (!selectedAddress) {
      setError('Please connect a wallet first');
      return;
    }

    setIsRegistering(true);
    setError('');
    setSuccess('');

    try {
      const provider = nodeProvider.getProvider();
      const api = await ApiPromise.create({ provider });

      // Get injector for signing
      const { web3FromAddress } = await import('@polkadot/extension-dapp');
      const injector = await web3FromAddress(selectedAddress);

      // Call registerEntity() extrinsic
      const registerTx = api.tx.proof.registerEntity();

      await new Promise((resolve, reject) => {
        registerTx.signAndSend(
          selectedAddress,
          { signer: injector.signer },
          ({ status, events }) => {
            if (status.isInBlock) {
              console.log(`Transaction included in block hash: ${status.asInBlock}`);
            }
            if (status.isFinalized) {
              console.log(`Transaction finalized at block hash: ${status.asFinalized}`);

              // Check for errors in events
              events.forEach(({ event }) => {
                if (api.events.system.ExtrinsicFailed.is(event)) {
                  reject(new Error('Transaction failed'));
                }
              });

              resolve(true);
            }
          }
        ).catch(reject);
      });

      setSuccess('Entity registered successfully!');
      await api.disconnect();
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to register entity');
    } finally {
      setIsRegistering(false);
    }
  };

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
          <h2 className="h4 fw-semibold mb-4" style={{ color: "#ededed" }}>
            Register Entity
          </h2>
          <div style={{ maxWidth: "500px", margin: "0 auto" }}>

            {/* Wallet Address Display */}
            <div className="mb-4">
              <label className="form-label fw-medium" style={{ color: "#ededed" }}>
                Selected Wallet Address
              </label>
              <div className="position-relative">
                <div className="form-control bg-secondary text-white d-flex align-items-center justify-content-between" style={{ fontFamily: "monospace", fontSize: "0.9rem", padding: "0.75rem" }}>
                  <span className="flex-grow-1">
                    {selectedAddress || 'No wallet connected'}
                  </span>
                  {isChecking && selectedAddress && (
                    <span className="spinner-border spinner-border-sm text-light ms-2" role="status">
                      <span className="visually-hidden">Checking...</span>
                    </span>
                  )}
                  {!isChecking && isRegistered && selectedAddress && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="ms-2">
                      <circle cx="12" cy="12" r="10" fill="#198754" />
                      <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="form-text text-secondary">
                {isRegistered && !isChecking ? (
                  <span className="text-success">✓ This address is already registered as an entity</span>
                ) : (
                  'This is the wallet address that will be registered as an entity'
                )}
              </div>
            </div>

            {/* Register Button */}
            <div className="d-grid">
              <button
                className="btn btn-success fw-medium py-2"
                onClick={handleRegisterEntity}
                disabled={!selectedAddress || isRegistering || isRegistered || isChecking || (!isChecking && !isRegistered && selectedAddress === '')}
              >
                {isChecking ? 'Checking...' : isRegistering ? 'Registering...' : isRegistered ? 'Already Registered' : 'Register Entity'}
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="alert alert-success mt-3 mb-0" role="alert">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger mt-3 mb-0" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Registered Entities List */}
        <div className="card shadow-sm border p-4 mt-4">
          <h2 className="h4 fw-semibold mb-4" style={{ color: "#ededed" }}>
            Registered Entities
          </h2>

          {isLoadingEntities ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading entities...</span>
              </div>
              <p className="text-secondary mt-3">Loading registered entities...</p>
            </div>
          ) : entities.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-secondary">No registered entities found.</p>
            </div>
          ) : (
            <>
              {/* Entities Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col" style={{ color: "#ededed" }}>#</th>
                      <th scope="col" style={{ color: "#ededed" }}>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntities.map((entity, index) => (
                      <tr key={entity.address}>
                        <th scope="row" className="text-secondary">
                          {indexOfFirstItem + index + 1}
                        </th>
                        <td className="text-white" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                          {entity.address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Entity pagination" className="mt-4">
                  <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}

              {/* Total count */}
              <div className="text-center mt-3">
                <p className="text-secondary small mb-0">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, entities.length)} of {entities.length} entities
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}