import React, { createContext, useContext, useState, useEffect } from 'react';
import { purchaseService, PurchaseResult } from '../services/purchase/purchaseService';
import { SubscriptionTier } from '../services/subscription/types';
import { showMessage } from 'react-native-flash-message';

interface PurchaseContextType {
  currentTier: SubscriptionTier | null;
  hasDailyOptimizer: boolean;
  isLoading: boolean;
  purchaseTier: (tier: SubscriptionTier) => Promise<PurchaseResult>;
  upgradeTier: (tier: SubscriptionTier) => Promise<PurchaseResult>;
  purchaseDailyOptimizer: () => Promise<boolean>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [hasDailyOptimizer, setHasDailyOptimizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchaseState();
  }, []);

  const loadPurchaseState = async () => {
    try {
      const purchase = await purchaseService.getCurrentPurchase();
      if (purchase) {
        setCurrentTier(purchase.tier);
      }
      const hasOptimizer = await purchaseService.hasDailyOptimizer();
      setHasDailyOptimizer(hasOptimizer);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseTier = async (tier: SubscriptionTier): Promise<PurchaseResult> => {
    setIsLoading(true);
    try {
      const transactionId = `purchase_${Date.now()}`; // In production, this would come from the payment provider
      const result = await purchaseService.verifyPurchase(tier, transactionId);
      
      if (result.success) {
        setCurrentTier(tier);
        showMessage({
          message: "Welcome to AnxietyCrush!",
          description: "Your purchase was successful. Enjoy your transformation journey!",
          type: "success",
          duration: 4000,
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeTier = async (tier: SubscriptionTier): Promise<PurchaseResult> => {
    setIsLoading(true);
    try {
      const transactionId = `upgrade_${Date.now()}`; // In production, this would come from the payment provider
      const result = await purchaseService.upgradeTier(tier, transactionId);
      
      if (result.success) {
        setCurrentTier(tier);
        showMessage({
          message: "Upgrade Successful!",
          description: "Welcome to your enhanced AnxietyCrush experience!",
          type: "success",
          duration: 4000,
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseDailyOptimizer = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await purchaseService.enableDailyOptimizer();
      if (success) {
        setHasDailyOptimizer(true);
        showMessage({
          message: "Daily Optimizer Activated!",
          description: "Your morning and evening sessions are now available.",
          type: "success",
          duration: 4000,
        });
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PurchaseContext.Provider
      value={{
        currentTier,
        hasDailyOptimizer,
        isLoading,
        purchaseTier,
        upgradeTier,
        purchaseDailyOptimizer,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};
