import { SubscriptionTier } from '../subscription/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PurchaseResult {
  success: boolean;
  tier: SubscriptionTier;
  transactionId?: string;
  error?: string;
}

class PurchaseService {
  private static PURCHASE_KEY = '@anxiety_crush_purchase';
  private static DAILY_OPTIMIZER_KEY = '@daily_optimizer_enabled';

  async verifyPurchase(tier: SubscriptionTier, transactionId: string): Promise<PurchaseResult> {
    try {
      // In a production app, this would make an API call to verify the purchase
      // For now, we'll simulate a successful purchase
      const purchaseData = {
        tier,
        transactionId,
        purchaseDate: new Date().toISOString(),
      };

      await AsyncStorage.setItem(PurchaseService.PURCHASE_KEY, JSON.stringify(purchaseData));

      return {
        success: true,
        tier,
        transactionId,
      };
    } catch (error) {
      return {
        success: false,
        tier,
        error: error instanceof Error ? error.message : 'Purchase verification failed',
      };
    }
  }

  async getCurrentPurchase(): Promise<{ tier: SubscriptionTier; transactionId: string } | null> {
    try {
      const purchaseData = await AsyncStorage.getItem(PurchaseService.PURCHASE_KEY);
      return purchaseData ? JSON.parse(purchaseData) : null;
    } catch {
      return null;
    }
  }

  async enableDailyOptimizer(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(PurchaseService.DAILY_OPTIMIZER_KEY, 'true');
      return true;
    } catch {
      return false;
    }
  }

  async hasDailyOptimizer(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(PurchaseService.DAILY_OPTIMIZER_KEY);
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  async upgradeTier(newTier: SubscriptionTier, transactionId: string): Promise<PurchaseResult> {
    return this.verifyPurchase(newTier, transactionId);
  }
}

export const purchaseService = new PurchaseService();
