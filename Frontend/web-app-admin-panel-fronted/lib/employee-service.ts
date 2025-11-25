import api from './axios';

export const employeeService = {
  async getAllEmployees() {
    const response = await api.get('/employee/get-all');
    return response.data;
  },

  async createEmployee(formData: FormData) {
    const response = await api.post('/employee/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteEmployee(id: string) {
    const response = await api.delete('/employee/delete', {
        data: { id } // Assuming the backend expects the ID in the body based on typical delete patterns or query params. 
                     // Checking route: router.delete("/delete", ... deleteEmployerInfoController);
                     // Usually delete requests might take ID in body or query. Let's assume body for now based on "data: { id }".
    });
    return response.data;
  },
  
  async updateEmployee(data: any) {
      const response = await api.patch('/employee/update', data);
      return response.data;
  }
};
