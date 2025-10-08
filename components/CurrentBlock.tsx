'use client';

import { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { NodeProvider } from '@/lib/NodeProvider';

export default function CurrentBlock() {
  const [bestBlock, setBestBlock] = useState<number | null>(null);
  const [finalizedBlock, setFinalizedBlock] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let api: ApiPromise | null = null;
    let unsubscribeNewHeads: (() => void) | null = null;
    let unsubscribeFinalizedHeads: (() => void) | null = null;

    const subscribeToBlocks = async () => {
      try {
        const nodeProvider = new NodeProvider();
        const provider = nodeProvider.getProvider();
        api = await ApiPromise.create({ provider });

        // Subscribe to new block headers (best block)
        unsubscribeNewHeads = await api.rpc.chain.subscribeNewHeads((header) => {
          setBestBlock(header.number.toNumber());
          setIsLoading(false);
        });

        // Subscribe to finalized block headers
        unsubscribeFinalizedHeads = await api.rpc.chain.subscribeFinalizedHeads((header) => {
          setFinalizedBlock(header.number.toNumber());
        });
      } catch (error) {
        console.error('Error subscribing to blocks:', error);
        setIsLoading(false);
      }
    };

    subscribeToBlocks();

    // Cleanup on unmount
    return () => {
      if (unsubscribeNewHeads) {
        unsubscribeNewHeads();
      }
      if (unsubscribeFinalizedHeads) {
        unsubscribeFinalizedHeads();
      }
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  return (
    <div
      className="d-flex align-items-center gap-3 px-3 py-2 rounded"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <div
          className="rounded-circle"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: isLoading ? '#ffc107' : '#28a745',
            animation: isLoading ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
        <span className="text-white-50 small">Best:</span>
        <span className="text-white fw-medium font-monospace">
          {isLoading ? '...' : bestBlock?.toLocaleString() ?? 'N/A'}
        </span>
      </div>
      <div
        style={{
          width: '1px',
          height: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        }}
      />
      <div className="d-flex align-items-center gap-2">
        <span className="text-white-50 small">Finalized:</span>
        <span className="text-white fw-medium font-monospace">
          {isLoading ? '...' : finalizedBlock?.toLocaleString() ?? 'N/A'}
        </span>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
