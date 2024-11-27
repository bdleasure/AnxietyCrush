import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { SubscriptionTier } from '../services/subscription/types';
import { verifyPurchase, upgradeTier as upgradeTierService } from '../services/purchase/purchaseService';

interface PurchaseContextType {
  ownedTiers: Set<SubscriptionTier>;
  selectedPackages: Set<SubscriptionTier>;
  isLoading: boolean;
  totalPrice: number;
  togglePackageSelection: (tier: SubscriptionTier) => void;
  purchaseSelectedPackages: () => Promise<void>;
  clearSelection: () => void;
  hasTier: (tier: SubscriptionTier) => boolean;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ownedTiers, setOwnedTiers] = useState<Set<SubscriptionTier>>(new Set([SubscriptionTier.FREE]));
  const [selectedPackages, setSelectedPackages] = useState<Set<SubscriptionTier>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to check if a tier is owned
  const hasTier = useCallback((tier: SubscriptionTier) => {
    return ownedTiers.has(tier);
  }, [ownedTiers]);

  // Calculate total price based on selected packages
  const calculateTotalPrice = useCallback(() => {
    let total = 0;
    selectedPackages.forEach(tier => {
      switch (tier) {
        case SubscriptionTier.ESSENTIALS:
          total += 39;
          break;
        case SubscriptionTier.ADVANCED:
          total += 79;
          break;
        case SubscriptionTier.DAILY:
          total += 149;
          break;
      }
    });
    return total;
  }, [selectedPackages]);

  const togglePackageSelection = useCallback((tier: SubscriptionTier) => {
    // Don't allow selecting already owned tiers
    if (hasTier(tier)) return;

    setSelectedPackages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tier)) {
        newSelection.delete(tier);
      } else {
        newSelection.add(tier);
      }
      return newSelection;
    });
  }, [hasTier]);

  const clearSelection = useCallback(() => {
    setSelectedPackages(new Set());
  }, []);

  const purchaseSelectedPackages = useCallback(async () => {
    if (selectedPackages.size === 0) {
      showMessage({
        message: 'Please select at least one package',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Process each selected package
      for (const tier of selectedPackages) {
        await upgradeTierService(tier);
      }

      // Add newly purchased tiers to owned tiers
      const newOwnedTiers = new Set(ownedTiers);
      selectedPackages.forEach(tier => newOwnedTiers.add(tier));
      setOwnedTiers(newOwnedTiers);

      // Save owned tiers to storage - convert enum values to strings
      const tiersArray = Array.from(newOwnedTiers).map(tier => tier.toString());
      await AsyncStorage.setItem('ownedTiers', JSON.stringify(tiersArray));

      showMessage({
        message: 'Purchase successful!',
        description: 'Thank you for your purchase. Your access has been upgraded.',
        type: 'success',
      });

      // Clear selection after successful purchase
      clearSelection();
    } catch (error) {
      showMessage({
        message: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Please try again later',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackages, ownedTiers, clearSelection]);

  // Initial load of purchase state
  React.useEffect(() => {
    const loadPurchaseState = async () => {
      try {
        const storedTiers = await AsyncStorage.getItem('ownedTiers');
        
        if (storedTiers) {
          const parsedTiers = JSON.parse(storedTiers);
          // Convert the array of strings back to SubscriptionTier enum values
          const tiers = new Set(parsedTiers.map((tier: string) => SubscriptionTier[tier as keyof typeof SubscriptionTier]));
          setOwnedTiers(tiers);
        } else {
          // For development, set ESSENTIALS as owned by default
          setOwnedTiers(new Set([SubscriptionTier.FREE, SubscriptionTier.ESSENTIALS]));
          await AsyncStorage.setItem('ownedTiers', JSON.stringify([SubscriptionTier.FREE.toString(), SubscriptionTier.ESSENTIALS.toString()]));
        }
      } catch (error) {
        console.error('Error loading purchase state:', error);
        // Fallback to default state
        setOwnedTiers(new Set([SubscriptionTier.FREE, SubscriptionTier.ESSENTIALS]));
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchaseState();
  }, []);

  return (
    <PurchaseContext.Provider
      value={{
        ownedTiers,
        selectedPackages,
        isLoading,
        totalPrice: calculateTotalPrice(),
        togglePackageSelection,
        purchaseSelectedPackages,
        clearSelection,
        hasTier,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};
