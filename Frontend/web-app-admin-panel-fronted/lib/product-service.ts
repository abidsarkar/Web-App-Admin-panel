import api from './axios';

export const productService = {
  async getAllProducts() {
    const response = await api.get('/product/get-all');
    return response.data;
  },

  async createProduct(formData: FormData) {
    const response = await api.post('/product/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProduct(id: string) {
    // Assuming delete route exists and follows similar pattern
    const response = await api.delete(`/product/delete/${id}`); 
    return response.data;
  },
  
  async getCategories() {
      const response = await api.get('/category/get-all');
      return response.data;
  }
};
