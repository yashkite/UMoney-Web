// umoney-frontend/src/models/CategoryModel.js

import { getCategories as fetchCategories } from '../api/categoryApi';

export const CategoryModel = {
  async getCategories() {
    console.log('CategoryModel: Fetching categories from API...');
    
    try {
      const data = await fetchCategories();
      console.log('CategoryModel: Categories data from API:', data);
      return data;
    } catch (error) {
      console.error('CategoryModel: Error fetching categories:', error);

      // Return mock data in case of error
      console.log('CategoryModel: Returning mock data due to error');
      return [
        { _id: 'error-needs', name: 'Needs (Mock)', type: 'Needs', icon: 'pi pi-home' },
        { _id: 'error-wants', name: 'Wants (Mock)', type: 'Wants', icon: 'pi pi-shopping-bag' },
        { _id: 'error-savings', name: 'Savings (Mock)', type: 'Savings', icon: 'pi pi-wallet' },
        { _id: 'error-income', name: 'Income (Mock)', type: 'Income', icon: 'pi pi-money-bill' }
      ];
    }
  }
};
