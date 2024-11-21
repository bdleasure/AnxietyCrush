import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import { SubscriptionTier } from './types';

// Product IDs for different platforms
const PRODUCT_IDS = {
  ios: {
    [SubscriptionTier.CORE]: 'com.anxietycrush.core',
    [SubscriptionTier.MASTER]: 'com.anxietycrush.master',
    [SubscriptionTier.OPTIMIZER]: 'com.anxietycrush.optimizer',
  },
  android: {
    [SubscriptionTier.CORE]: 'com.anxietycrush.core',
    [SubscriptionTier.MASTER]: 'com.anxietycrush.master',
    [SubscriptionTier.OPTIMIZER]: 'com.anxietycrush.optimizer',
  },
};

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

class PurchaseService {
  private static instance: PurchaseService;
  private products: Product[] = [];
  private isConnected = false;

  private constructor() {}

  static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await InAppPurchases.connectAsync();
      this.isConnected = true;

      // Get the product IDs for the current platform
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const productIds = Object.values(PRODUCT_IDS[platform]);

      // Load the products
      const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);
      
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        this.products = results;
      }

      // Set up purchase listener
      InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          results.forEach(async (purchase) => {
            if (!purchase.acknowledged) {
              // Acknowledge the purchase
              await InAppPurchases.finishTransactionAsync(purchase, true);
              
              // Update the user's subscription status
              // This should integrate with your backend
              this.handleSuccessfulPurchase(purchase);
            }
          });
        }
      });
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      throw error;
    }
  }

  async purchaseSubscription(tier: SubscriptionTier): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.initialize();
      }

      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const productId = PRODUCT_IDS[platform][tier];
      
      // Start the purchase flow
      const { responseCode, results } = await InAppPurchases.purchaseItemAsync(productId);
      
      return responseCode === InAppPurchases.IAPResponseCode.OK;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  }

  private async handleSuccessfulPurchase(purchase: InAppPurchases.PurchaseResult): Promise<void> {
    // Here you would typically:
    // 1. Validate the purchase with your backend
    // 2. Update the user's subscription status
    // 3. Grant access to the purchased features
    
    // For now, we'll just log the purchase
    console.log('Successful purchase:', purchase);
  }

  getProducts(): Product[] {
    return this.products;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await InAppPurchases.disconnectAsync();
      this.isConnected = false;
    }
  }
}

export const purchaseService = PurchaseService.getInstance();
