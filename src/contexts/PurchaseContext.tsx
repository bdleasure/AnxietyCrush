import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { SubscriptionTier } from '../services/subscription/types';
import { verifyPurchase, upgradeTier as upgradeTierService } from '../services/purchase/purchaseService';

interface PurchaseContextType {
  currentTier: SubscriptionTier;
  selectedPackages: Set<SubscriptionTier>;
  isLoading: boolean;
  hasDailyOptimizer: boolean;
  totalPrice: number;
  togglePackageSelection: (tier: SubscriptionTier) => void;
  purchaseSelectedPackages: () => Promise<void>;
  clearSelection: () => void;
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
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [selectedPackages, setSelectedPackages] = useState<Set<SubscriptionTier>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasDailyOptimizer, setHasDailyOptimizer] = useState(false);

  // Calculate total price based on selected packages
  const calculateTotalPrice = useCallback(() => {
    let total = 0;
    selectedPackages.forEach(tier => {
      switch (tier) {
        case SubscriptionTier.CORE:
          total += 39;
          break;
        case SubscriptionTier.ADVANCED:
          total += 79;
          break;
        case SubscriptionTier.DAILY:
          total += 29;
          break;
      }
    });
    return total;
  }, [selectedPackages]);

  const togglePackageSelection = useCallback((tier: SubscriptionTier) => {
    setSelectedPackages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(tier)) {
        newSelection.delete(tier);
      } else {
        newSelection.add(tier);
      }
      return newSelection;
    });
  }, []);

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
        
        if (tier === SubscriptionTier.DAILY) {
          setHasDailyOptimizer(true);
          await AsyncStorage.setItem('hasDailyOptimizer', 'true');
        }
      }

      // Update to the highest tier purchased
      const highestTier = Array.from(selectedPackages).reduce((highest, current) => {
        const tierOrder = {
          [SubscriptionTier.FREE]: 0,
          [SubscriptionTier.CORE]: 1,
          [SubscriptionTier.ADVANCED]: 2,
          [SubscriptionTier.DAILY]: 3,
        };
        return tierOrder[current] > tierOrder[highest] ? current : highest;
      }, SubscriptionTier.FREE);

      setCurrentTier(highestTier);
      await AsyncStorage.setItem('subscriptionTier', highestTier);

      showMessage({
        message: 'Purchase successful!',
        description: 'Thank you for your purchase. Your access has been upgraded.',
        type: 'success',
      });

      clearSelection();
    } catch (error) {
      showMessage({
        message: 'Purchase failed',
        description: 'Please try again later',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPackages, clearSelection]);

  // Initial load of purchase state
  React.useEffect(() => {
    const loadPurchaseState = async () => {
      try {
        const [storedTier, storedOptimizer] = await Promise.all([
          AsyncStorage.getItem('subscriptionTier'),
          AsyncStorage.getItem('hasDailyOptimizer'),
        ]);

        if (storedTier) {
          setCurrentTier(storedTier as SubscriptionTier);
        }
        
        setHasDailyOptimizer(storedOptimizer === 'true');
      } catch (error) {
        console.error('Error loading purchase state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchaseState();
  }, []);

  return (
    <PurchaseContext.Provider
      value={{
        currentTier,
        selectedPackages,
        isLoading,
        hasDailyOptimizer,
        totalPrice: calculateTotalPrice(),
        togglePackageSelection,
        purchaseSelectedPackages,
        clearSelection,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};
