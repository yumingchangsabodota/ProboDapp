import { NodeProvider } from '../lib/NodeProvider';
import { WsProvider } from '@polkadot/api';

describe('NodeProvider', () => {
  describe('constructor', () => {
    it('should initialize with default address', () => {
      const nodeProvider = new NodeProvider();
      const provider = nodeProvider.getProvider();
      
      expect(provider).toBeInstanceOf(WsProvider);
      expect(provider.endpoint).toBe('ws://127.0.0.1:9944');
    });

    it('should initialize with custom address', () => {
      const customAddress = 'wss://custom.node.io';
      const nodeProvider = new NodeProvider(customAddress);
      const provider = nodeProvider.getProvider();
      
      expect(provider).toBeInstanceOf(WsProvider);
      expect(provider.endpoint).toBe(customAddress);
    });
  });

  describe('setNodeAddress', () => {
    it('should update the node address', () => {
      const nodeProvider = new NodeProvider();
      const newAddress = 'wss://new.node.io';
      
      nodeProvider.setNodeAddress(newAddress);
      const provider = nodeProvider.getProvider();
      
      expect(provider.endpoint).toBe(newAddress);
    });
  });

  describe('getProvider', () => {
    it('should return a WsProvider instance', () => {
      const nodeProvider = new NodeProvider();
      const provider = nodeProvider.getProvider();
      
      expect(provider).toBeInstanceOf(WsProvider);
    });

    it('should return provider with correct endpoint', () => {
      const address = 'wss://test.node.io';
      const nodeProvider = new NodeProvider(address);
      const provider = nodeProvider.getProvider();
      
      expect(provider.endpoint).toBe(address);
    });
  });

  describe('getWhitelistAddresses', () => {
    it('should return an array with default address', () => {
      const nodeProvider = new NodeProvider();
      const addresses = nodeProvider.getWhitelistAddresses();
      
      expect(Array.isArray(addresses)).toBe(true);
      expect(addresses).toHaveLength(1);
      expect(addresses[0]).toBe('ws://127.0.0.1:9944');
    });
  });
});
